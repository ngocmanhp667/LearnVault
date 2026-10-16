import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import prisma from '../config/prisma';
import { ai, MODEL_NAME } from '../utils/gemini';

export const createTicket = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Chưa đăng nhập' });
      return;
    }

    const { subject, description } = req.body;
    if (!subject || !description) {
      res.status(400).json({ message: 'Vui lòng cung cấp tiêu đề và nội dung' });
      return;
    }

    // GỌI AI ĐỂ PHÂN LOẠI & ĐỀ XUẤT CÂU TRẢ LỜI
    let aiCategory = 'Khác';
    let aiReply = '';

    try {
      const prompt = `
        Bạn là Hệ thống hỗ trợ khách hàng tự động của EduMarket.
        Người dùng gửi một phiếu khiếu nại (ticket) có nội dung sau:
        - Tiêu đề: "${subject}"
        - Mô tả: "${description}"
        
        Vui lòng phân loại khiếu nại này vào MỘT trong các danh mục sau: "Lỗi thanh toán", "Kỹ thuật", "Tài khoản", "Góp ý", "Khác".
        Và hãy gợi ý một câu trả lời mẫu lịch sự (nhưng ngắn gọn dưới 50 chữ) để Admin có thể dùng trả lời ngay.
        
        TRẢ VỀ DUY NHẤT ĐỊNH DẠNG JSON NHƯ SAU (KHÔNG DÙNG MARKDOWN NHƯ \`\`\`json):
        {
          "category": "Tên danh mục",
          "suggested_reply": "Câu trả lời mẫu"
        }
      `;

      const aiResponse = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      const responseText = aiResponse.text;
      if (responseText) {
        const parsed = JSON.parse(responseText.trim());
        aiCategory = parsed.category || 'Khác';
        aiReply = parsed.suggested_reply || '';
      }
    } catch (aiError) {
      console.error('Lỗi khi gọi AI phân loại Ticket:', aiError);
      // Bỏ qua lỗi AI để Ticket vẫn được lưu
    }

    const ticket = await prisma.ticket.create({
      data: {
        user_id: userId,
        subject,
        description,
        status: 'Open',
        category: aiCategory,
        ai_suggested_reply: aiReply
      }
    });

    res.status(201).json({ message: 'Tạo ticket thành công', data: ticket });
  } catch (error) {
    console.error('Lỗi tạo ticket:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const getUserTickets = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Chưa đăng nhập' });
      return;
    }

    const tickets = await prisma.ticket.findMany({
      where: { user_id: userId },
      orderBy: { updated_at: 'desc' }
    });

    res.status(200).json({ data: tickets });
  } catch (error) {
    console.error('Lỗi lấy ticket của user:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const getAllTickets = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tickets = await prisma.ticket.findMany({
      include: {
        user: { select: { username: true, email: true } }
      },
      orderBy: { updated_at: 'desc' }
    });

    res.status(200).json({ data: tickets });
  } catch (error) {
    console.error('Lỗi lấy tất cả ticket:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const getTicketById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      res.status(401).json({ message: 'Chưa đăng nhập' });
      return;
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        user: { select: { username: true, email: true } },
        messages: {
          include: {
            sender: { select: { username: true, role: true } }
          },
          orderBy: { created_at: 'asc' }
        }
      }
    });

    if (!ticket) {
      res.status(404).json({ message: 'Không tìm thấy ticket' });
      return;
    }

    // Check permissions
    if (ticket.user_id !== userId && userRole !== 'Admin') {
      res.status(403).json({ message: 'Bạn không có quyền truy cập ticket này' });
      return;
    }

    res.status(200).json({ data: ticket });
  } catch (error) {
    console.error('Lỗi lấy chi tiết ticket:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const updateTicketStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;

    const validStatuses = ['Open', 'InProgress', 'Resolved', 'Closed'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ message: 'Trạng thái không hợp lệ' });
      return;
    }

    const ticket = await prisma.ticket.update({
      where: { id },
      data: { status }
    });

    res.status(200).json({ message: 'Cập nhật trạng thái thành công', data: ticket });
  } catch (error) {
    console.error('Lỗi cập nhật ticket:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const addTicketMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { message } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      res.status(401).json({ message: 'Chưa đăng nhập' });
      return;
    }

    if (!message) {
      res.status(400).json({ message: 'Nội dung tin nhắn không được để trống' });
      return;
    }

    const ticket = await prisma.ticket.findUnique({ where: { id } });
    if (!ticket) {
      res.status(404).json({ message: 'Không tìm thấy ticket' });
      return;
    }

    // Check permissions
    if (ticket.user_id !== userId && userRole !== 'Admin') {
      res.status(403).json({ message: 'Bạn không có quyền gửi tin nhắn vào ticket này' });
      return;
    }

    const newMessage = await prisma.ticketMessage.create({
      data: {
        ticket_id: id,
        sender_id: userId,
        message
      }
    });

    // Update ticket timestamp
    await prisma.ticket.update({
      where: { id },
      data: { updated_at: new Date() }
    });

    res.status(201).json({ message: 'Gửi tin nhắn thành công', data: newMessage });
  } catch (error) {
    console.error('Lỗi gửi tin nhắn ticket:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};
