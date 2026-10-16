import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import prisma from '../config/prisma';

export const createMaterialReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Chưa đăng nhập.' });
      return;
    }

    const { materialId, rating, comment } = req.body;

    if (!materialId || rating === undefined) {
      res.status(400).json({ message: 'Vui lòng cung cấp materialId và rating.' });
      return;
    }

    // Kiểm tra xem người dùng đã mua học liệu này chưa
    const hasPurchased = await prisma.transaction.findFirst({
      where: {
        buyer_id: userId,
        material_id: materialId,
        status: 'Completed'
      }
    });

    if (!hasPurchased) {
      res.status(403).json({ message: 'Bạn chỉ có thể đánh giá học liệu đã mua.' });
      return;
    }

    // Kiểm tra xem đã đánh giá chưa
    const existingReview = await prisma.materialReview.findUnique({
      where: {
        user_id_material_id: {
          user_id: userId,
          material_id: materialId
        }
      }
    });

    if (existingReview) {
      res.status(409).json({ message: 'Bạn đã đánh giá học liệu này rồi.' });
      return;
    }

    const review = await prisma.materialReview.create({
      data: {
        user_id: userId,
        material_id: materialId,
        rating,
        comment
      },
      include: {
        user: { select: { username: true } }
      }
    });

    res.status(201).json({
      message: 'Đánh giá học liệu thành công',
      data: review
    });
  } catch (error) {
    console.error('Lỗi khi thêm đánh giá:', error);
    res.status(500).json({ message: 'Lỗi server.' });
  }
};

export const getMaterialReviews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const materialId = req.params.materialId as string;

    const reviews = await prisma.materialReview.findMany({
      where: { material_id: materialId },
      include: {
        user: { select: { username: true } }
      },
      orderBy: { created_at: 'desc' }
    });

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 
      ? reviews.reduce((sum, rev) => sum + rev.rating, 0) / totalReviews 
      : 0;

    res.status(200).json({
      data: reviews,
      totalReviews,
      averageRating: Number(averageRating.toFixed(1))
    });
  } catch (error) {
    console.error('Lỗi khi lấy đánh giá:', error);
    res.status(500).json({ message: 'Lỗi server.' });
  }
};

export const deleteMaterialReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    
    if (!userId) {
      res.status(401).json({ message: 'Chưa đăng nhập.' });
      return;
    }

    const id = req.params.id as string;

    const review = await prisma.materialReview.findUnique({
      where: { id }
    });

    if (!review) {
      res.status(404).json({ message: 'Đánh giá không tồn tại.' });
      return;
    }

    if (review.user_id !== userId && userRole !== 'Admin') {
      res.status(403).json({ message: 'Bạn không có quyền xoá đánh giá này.' });
      return;
    }

    await prisma.materialReview.delete({
      where: { id }
    });

    res.status(200).json({ message: 'Đã xoá đánh giá thành công.' });
  } catch (error) {
    console.error('Lỗi khi xoá đánh giá:', error);
    res.status(500).json({ message: 'Lỗi server.' });
  }
};

export const replyToMaterialReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sellerId = req.user?.id;
    if (!sellerId) {
      res.status(401).json({ message: 'Chưa đăng nhập.' });
      return;
    }

    const id = req.params.id as string;
    const { seller_reply } = req.body;

    if (!seller_reply) {
      res.status(400).json({ message: 'Vui lòng nhập nội dung phản hồi.' });
      return;
    }

    const review = await prisma.materialReview.findUnique({
      where: { id },
      include: { material: true }
    });

    if (!review) {
      res.status(404).json({ message: 'Đánh giá không tồn tại.' });
      return;
    }

    if (review.material.provider_id !== sellerId) {
      res.status(403).json({ message: 'Bạn chỉ có thể trả lời đánh giá trên học liệu của mình.' });
      return;
    }

    const updatedReview = await prisma.materialReview.update({
      where: { id },
      data: {
        seller_reply,
        replied_at: new Date()
      },
      include: {
        user: { select: { username: true } }
      }
    });

    res.status(200).json({
      message: 'Đã trả lời đánh giá',
      data: updatedReview
    });
  } catch (error) {
    console.error('Lỗi khi trả lời đánh giá:', error);
    res.status(500).json({ message: 'Lỗi server.' });
  }
};

export const getMyReceivedReviews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sellerId = req.user?.id;
    if (!sellerId) {
      res.status(401).json({ message: 'Chưa đăng nhập.' });
      return;
    }

    const reviews = await prisma.materialReview.findMany({
      where: {
        material: {
          provider_id: sellerId
        }
      },
      include: {
        user: { select: { username: true } },
        material: { select: { title: true, id: true } }
      },
      orderBy: { created_at: 'desc' }
    });

    res.status(200).json({
      message: 'Thành công',
      data: reviews
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách đánh giá:', error);
    res.status(500).json({ message: 'Lỗi server.' });
  }
};
