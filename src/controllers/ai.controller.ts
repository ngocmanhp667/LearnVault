import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import prisma from '../config/prisma';
import { ai, MODEL_NAME } from '../utils/gemini';

export const getRecommendations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Chưa đăng nhập' });
      return;
    }

    // 1. Lấy lịch sử tương tác của người dùng
    const interactions = await prisma.userInteraction.findMany({
      where: { user_id: userId },
      include: {
        material: {
          select: { title: true, tags: true }
        }
      },
      orderBy: { created_at: 'desc' },
      take: 20 // Lấy 20 tương tác gần nhất để phân tích
    });

    // 2. Lấy danh sách học liệu khả dụng trên hệ thống
    // Trong thực tế, có thể chỉ lấy top học liệu phổ biến để giảm lượng token gửi lên API
    const availableMaterials = await prisma.material.findMany({
      select: {
        id: true,
        title: true,
        tags: true,
      },
      take: 50 // Giới hạn số lượng nạp vào prompt để tránh tràn token
    });

    if (availableMaterials.length === 0) {
      res.status(200).json({ data: [] });
      return;
    }

    // 3. Xây dựng Prompt phân tích sở thích
    const userHistoryStr = interactions.map(i => {
      const tags = (i.material.tags as string[]) || [];
      return `- Đã ${i.interaction_type === 'purchase' ? 'mua' : 'xem'}: "${i.material.title}" (Tags: ${tags.join(', ')})`;
    }).join('\n');

    const catalogStr = availableMaterials.map(m => {
      const tags = (m.tags as string[]) || [];
      return `[ID: ${m.id}] ${m.title} (Tags: ${tags.join(', ')})`;
    }).join('\n');

    const prompt = `
      Bạn là một AI phân tích hành vi và đề xuất tài liệu học tập cho sinh viên.
      Lịch sử học liệu người dùng đã quan tâm:
      ${userHistoryStr || 'Người dùng mới chưa có lịch sử, hãy đề xuất các tài liệu phổ biến ngẫu nhiên.'}
      
      Danh sách học liệu hiện có trên sàn:
      ${catalogStr}
      
      Nhiệm vụ: Dựa vào lịch sử (nếu có), hãy chọn ra tối đa 4 học liệu phù hợp nhất từ danh sách hiện có.
      YÊU CẦU BẮT BUỘC: Bạn CHỈ ĐƯỢC PHÉP trả về kết quả là MỘT MẢNG JSON hợp lệ chứa các chuỗi ID của học liệu được chọn. 
      KHÔNG ĐƯỢC thêm bất kỳ text, markdown (như \`\`\`json) hay giải thích nào khác.
      Ví dụ định dạng kết quả: ["id1", "id2", "id3"]
    `;

    // 4. Gọi Gemini API
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const resultText = response.text;
    
    if (!resultText) {
      throw new Error('Không nhận được phản hồi từ AI');
    }

    // 5. Parse JSON và Query DB lấy dữ liệu thật
    let recommendedIds: string[] = [];
    try {
      recommendedIds = JSON.parse(resultText.trim());
    } catch (e) {
      console.error('Lỗi parse JSON từ AI:', resultText);
      // Fallback: nếu AI lỗi parse, tự trả về bài mới nhất
      const fallback = await prisma.material.findMany({ take: 4, orderBy: { created_at: 'desc' } });
      res.status(200).json({ data: fallback });
      return;
    }

    if (!Array.isArray(recommendedIds) || recommendedIds.length === 0) {
      res.status(200).json({ data: [] });
      return;
    }

    // Lấy thông tin chi tiết các tài liệu được đề xuất
    const recommendedMaterials = await prisma.material.findMany({
      where: {
        id: { in: recommendedIds }
      },
      include: {
        provider: { select: { id: true, username: true } }
      }
    });

    res.status(200).json({
      message: 'Gợi ý AI thành công',
      data: recommendedMaterials
    });

  } catch (error) {
    console.error('Lỗi API Gợi ý AI:', error);
    res.status(500).json({ message: 'Lỗi server xử lý AI' });
  }
};

export const chatWithAI = async (req: Request, res: Response): Promise<void> => {
  try {
    const { message } = req.body;
    
    if (!message) {
      res.status(400).json({ message: 'Vui lòng nhập tin nhắn' });
      return;
    }

    const systemPrompt = `
      Bạn là "EduBot" - một trợ lý ảo của nền tảng EduMarket (Sàn giao dịch học liệu sinh viên).
      Nhiệm vụ của bạn:
      - Trả lời thân thiện, ngắn gọn và hữu ích.
      - Hỗ trợ giải đáp các câu hỏi về học tập, tìm kiếm tài liệu, hoặc tư vấn ngành học.
      - Nếu người dùng hỏi mua tài liệu, hướng dẫn họ dùng thanh tìm kiếm hoặc trang danh mục.
      - KHÔNG ĐƯỢC sử dụng markdown phức tạp. Hãy xuống dòng rõ ràng.
      
      Câu hỏi của người dùng: "${message}"
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: systemPrompt,
    });

    if (!response.text) {
      throw new Error('AI không phản hồi');
    }

    res.status(200).json({
      message: 'Thành công',
      data: response.text
    });

  } catch (error) {
    console.error('Lỗi API Chatbot AI:', error);
    res.status(500).json({ message: 'Lỗi server khi chat với AI' });
  }
};
