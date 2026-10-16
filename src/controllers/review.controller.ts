import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import prisma from '../config/prisma';

/**
 * Tạo đánh giá cho người bán (provider).
 * Chỉ cho phép nếu người mua đã từng mua hàng thành công từ provider đó.
 */
export const createReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const reviewerId = req.user?.id;
    if (!reviewerId) {
      res.status(401).json({ message: 'Chưa đăng nhập.' });
      return;
    }

    const { provider_id, rating, comment } = req.body;

    // Validate input
    if (!provider_id) {
      res.status(400).json({ message: 'Thiếu provider_id.' });
      return;
    }

    if (!rating || rating < 1 || rating > 5) {
      res.status(400).json({ message: 'Rating phải từ 1 đến 5.' });
      return;
    }

    // Không cho phép tự đánh giá chính mình
    if (reviewerId === provider_id) {
      res.status(400).json({ message: 'Bạn không thể tự đánh giá chính mình.' });
      return;
    }

    // Kiểm tra provider có tồn tại không
    const provider = await prisma.user.findUnique({
      where: { id: provider_id },
    });

    if (!provider) {
      res.status(404).json({ message: 'Không tìm thấy người bán.' });
      return;
    }

    // Kiểm tra người mua đã từng mua hàng thành công từ provider này chưa
    const completedTransaction = await prisma.transaction.findFirst({
      where: {
        buyer_id: reviewerId,
        seller_id: provider_id,
        status: 'Completed',
      },
    });

    if (!completedTransaction) {
      res.status(403).json({
        message: 'Bạn chỉ có thể đánh giá sau khi đã mua hàng thành công từ người bán này.',
      });
      return;
    }

    // Tạo review
    const review = await prisma.review.create({
      data: {
        reviewer_id: reviewerId,
        provider_id,
        rating: Math.round(rating), // Đảm bảo là số nguyên
        comment: comment || null,
      },
      include: {
        reviewer: {
          select: { id: true, username: true },
        },
      },
    });

    res.status(201).json({
      message: 'Đánh giá thành công.',
      data: review,
    });
  } catch (error) {
    console.error('Lỗi khi tạo đánh giá:', error);
    res.status(500).json({ message: 'Lỗi server.' });
  }
};

/**
 * Lấy tất cả đánh giá của một provider.
 * Trả về danh sách review + trung bình rating.
 */
export const getProviderReviews = async (req: any, res: Response): Promise<void> => {
  try {
    const { providerId } = req.params;

    if (!providerId) {
      res.status(400).json({ message: 'Thiếu providerId.' });
      return;
    }

    // Lấy danh sách review
    const reviews = await prisma.review.findMany({
      where: { provider_id: providerId },
      include: {
        reviewer: {
          select: { id: true, username: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    // Tính trung bình rating
    const aggregation = await prisma.review.aggregate({
      where: { provider_id: providerId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    res.status(200).json({
      message: 'Lấy đánh giá thành công.',
      data: {
        reviews,
        averageRating: aggregation._avg.rating
          ? parseFloat(aggregation._avg.rating.toFixed(1))
          : 0,
        totalReviews: aggregation._count.rating,
      },
    });
  } catch (error) {
    console.error('Lỗi khi lấy đánh giá:', error);
    res.status(500).json({ message: 'Lỗi server.' });
  }
};
