import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import prisma from '../config/prisma';

export const getMyNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Chưa đăng nhập.' });
      return;
    }

    const notifications = await prisma.notification.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      take: 20
    });

    const unreadCount = await prisma.notification.count({
      where: { user_id: userId, is_read: false }
    });

    res.status(200).json({
      data: notifications,
      unreadCount
    });
  } catch (error) {
    console.error('Lỗi lấy thông báo:', error);
    res.status(500).json({ message: 'Lỗi server.' });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Chưa đăng nhập.' });
      return;
    }

    const id = req.params.id as string;

    const notification = await prisma.notification.findUnique({
      where: { id }
    });

    if (!notification) {
      res.status(404).json({ message: 'Không tìm thấy thông báo.' });
      return;
    }

    if (notification.user_id !== userId) {
      res.status(403).json({ message: 'Bạn không có quyền cập nhật thông báo này.' });
      return;
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { is_read: true }
    });

    res.status(200).json({ message: 'Đã đánh dấu đã đọc.', data: updated });
  } catch (error) {
    console.error('Lỗi cập nhật thông báo:', error);
    res.status(500).json({ message: 'Lỗi server.' });
  }
};

export const markAllAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Chưa đăng nhập.' });
      return;
    }

    await prisma.notification.updateMany({
      where: { user_id: userId, is_read: false },
      data: { is_read: true }
    });

    res.status(200).json({ message: 'Đã đánh dấu tất cả là đã đọc.' });
  } catch (error) {
    console.error('Lỗi cập nhật thông báo:', error);
    res.status(500).json({ message: 'Lỗi server.' });
  }
};
