import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import prisma from '../config/prisma';

/**
 * Ghi lại tương tác của user với material.
 * Dùng để phục vụ hệ thống đề xuất AI sau này.
 */
export const trackInteraction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Chưa đăng nhập.' });
      return;
    }

    const { material_id, interaction_type } = req.body;

    // Validate input
    if (!material_id || !interaction_type) {
      res.status(400).json({ message: 'Thiếu material_id hoặc interaction_type.' });
      return;
    }

    // Validate interaction_type nằm trong enum
    const validTypes = ['click', 'view', 'add_to_cart', 'purchase'];
    if (!validTypes.includes(interaction_type)) {
      res.status(400).json({
        message: `interaction_type không hợp lệ. Chấp nhận: ${validTypes.join(', ')}`,
      });
      return;
    }

    // Kiểm tra material có tồn tại không
    const material = await prisma.material.findUnique({
      where: { id: material_id },
    });

    if (!material) {
      res.status(404).json({ message: 'Không tìm thấy học liệu.' });
      return;
    }

    // Ghi lại tương tác
    const interaction = await prisma.userInteraction.create({
      data: {
        user_id: userId,
        material_id,
        interaction_type,
      },
    });

    res.status(201).json({
      message: 'Ghi nhận tương tác thành công.',
      data: interaction,
    });
  } catch (error) {
    console.error('Lỗi khi ghi tương tác:', error);
    res.status(500).json({ message: 'Lỗi server.' });
  }
};

/**
 * Lấy lịch sử tương tác của user đang đăng nhập.
 * Hỗ trợ phân trang (page, limit).
 */
export const getUserInteractions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Chưa đăng nhập.' });
      return;
    }

    // Phân trang
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // Đếm tổng số tương tác
    const total = await prisma.userInteraction.count({
      where: { user_id: userId },
    });

    // Lấy danh sách tương tác
    const interactions = await prisma.userInteraction.findMany({
      where: { user_id: userId },
      include: {
        material: {
          select: {
            id: true,
            title: true,
            thumbnail_url: true,
            price: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
      skip,
      take: limit,
    });

    res.status(200).json({
      message: 'Lấy lịch sử tương tác thành công.',
      data: interactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Lỗi khi lấy lịch sử tương tác:', error);
    res.status(500).json({ message: 'Lỗi server.' });
  }
};
