import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import prisma from '../config/prisma';
import bcrypt from 'bcrypt';

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Chưa đăng nhập.' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        created_at: true,
        updated_at: true,
        // Lấy danh sách học liệu đã đăng bán
        materials: {
          select: {
            id: true,
            title: true,
            price: true,
            created_at: true,
          }
        },
        // Lấy danh sách giao dịch mua
        purchases: {
          include: {
            material: {
              select: {
                id: true,
                title: true,
                file_format: true
              }
            }
          }
        }
      }
    });

    if (!user) {
      res.status(404).json({ message: 'Không tìm thấy người dùng.' });
      return;
    }

    res.status(200).json({ profile: user });
  } catch (error) {
    console.error('Lỗi khi lấy thông tin profile:', error);
    res.status(500).json({ message: 'Lỗi server.' });
  }
};

export const getMyMaterials = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Chưa đăng nhập.' });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const total = await prisma.material.count({ where: { provider_id: userId } });
    const materials = await prisma.material.findMany({
      where: { provider_id: userId },
      include: {
        provider: { select: { id: true, username: true } }
      },
      orderBy: { created_at: 'desc' },
      skip,
      take: limit,
    });

    res.status(200).json({
      message: 'Lấy danh sách học liệu đã đăng thành công',
      data: materials,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    });
  } catch (error) {
    console.error('Lỗi lấy học liệu của tôi:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const getMyPurchases = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Chưa đăng nhập.' });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const total = await prisma.transaction.count({ 
      where: { buyer_id: userId, status: 'Completed' } 
    });
    
    const purchases = await prisma.transaction.findMany({
      where: { buyer_id: userId, status: 'Completed' },
      include: {
        material: {
          select: { id: true, title: true, price: true, thumbnail_url: true, file_url: true, file_format: true }
        },
        seller: {
          select: { username: true }
        }
      },
      orderBy: { created_at: 'desc' },
      skip,
      take: limit,
    });

    res.status(200).json({
      message: 'Lấy danh sách đã mua thành công',
      data: purchases,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    });
  } catch (error) {
    console.error('Lỗi lấy lịch sử mua:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const updatePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Chưa đăng nhập.' });
      return;
    }

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      res.status(400).json({ message: 'Vui lòng cung cấp mật khẩu hiện tại và mật khẩu mới.' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ message: 'Không tìm thấy người dùng.' });
      return;
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      res.status(400).json({ message: 'Mật khẩu hiện tại không đúng.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: userId },
      data: { password_hash }
    });

    res.status(200).json({ message: 'Cập nhật mật khẩu thành công.' });
  } catch (error) {
    console.error('Lỗi cập nhật mật khẩu:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Chưa đăng nhập.' });
      return;
    }

    const { username } = req.body;
    if (!username) {
      res.status(400).json({ message: 'Vui lòng cung cấp username mới.' });
      return;
    }

    await prisma.user.update({
      where: { id: userId },
      data: { username }
    });

    res.status(200).json({ message: 'Cập nhật hồ sơ thành công.', data: { username } });
  } catch (error) {
    console.error('Lỗi cập nhật hồ sơ:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const getPublicProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        materials: {
          select: {
            id: true,
            title: true,
            price: true,
            thumbnail_url: true,
            tags: true,
            created_at: true,
          }
        },
        reviews_received: true
      }
    });

    if (!user) {
      res.status(404).json({ message: 'Không tìm thấy người dùng' });
      return;
    }

    const totalMaterials = user.materials.length;
    const totalSales = await prisma.transaction.count({
      where: { seller_id: id, status: 'Completed' }
    });

    const averageRating = user.reviews_received.length > 0
      ? user.reviews_received.reduce((sum: number, rev: any) => sum + rev.rating, 0) / user.reviews_received.length
      : 0;

    res.status(200).json({
      data: {
        id: user.id,
        username: user.username,
        created_at: user.created_at,
        totalMaterials,
        totalSales,
        averageRating: Number(averageRating.toFixed(1)),
        materials: user.materials
      }
    });
  } catch (error) {
    console.error('Lỗi lấy public profile:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Chưa đăng nhập.' });
      return;
    }

    const totalMaterials = await prisma.material.count({ where: { provider_id: userId } });
    
    const sales = await prisma.transaction.findMany({
      where: { seller_id: userId, status: 'Completed' },
      select: { amount: true }
    });

    const totalSalesCount = sales.length;
    const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.amount), 0);

    const reviews = await prisma.review.findMany({
      where: { provider_id: userId },
      select: { rating: true }
    });
    
    // Also get material reviews
    const materialReviews = await prisma.materialReview.findMany({
      where: { material: { provider_id: userId } },
      select: { rating: true }
    });
    
    const allRatings = [...reviews.map(r => r.rating), ...materialReviews.map(r => r.rating)];
    const averageRating = allRatings.length > 0
      ? allRatings.reduce((a, b) => a + b, 0) / allRatings.length
      : 0;

    res.status(200).json({
      data: {
        totalMaterials,
        totalSalesCount,
        totalRevenue,
        averageRating: Number(averageRating.toFixed(1))
      }
    });
  } catch (error) {
    console.error('Lỗi lấy dashboard stats:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * Lấy danh sách khách hàng đã mua tài liệu của Seller
 */
export const getMyCustomers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sellerId = req.user?.id;
    if (!sellerId) {
      res.status(401).json({ message: 'Chưa đăng nhập.' });
      return;
    }

    // Nhóm theo buyer_id
    const customerStats = await prisma.transaction.groupBy({
      by: ['buyer_id'],
      where: { seller_id: sellerId, status: 'Completed' },
      _sum: { amount: true },
      _count: { id: true }
    });

    // Lấy thông tin user cho mỗi buyer_id
    const customerIds = customerStats.map(stat => stat.buyer_id);
    const users = await prisma.user.findMany({
      where: { id: { in: customerIds } },
      select: { id: true, username: true, email: true, created_at: true }
    });

    const data = customerStats.map(stat => {
      const user = users.find(u => u.id === stat.buyer_id);
      return {
        id: user?.id,
        username: user?.username,
        email: user?.email,
        joined_at: user?.created_at,
        totalSpent: stat._sum.amount,
        totalPurchases: stat._count.id
      };
    }).sort((a, b) => Number(b.totalSpent) - Number(a.totalSpent));

    res.status(200).json({
      message: 'Lấy danh sách khách hàng thành công',
      data
    });
  } catch (error) {
    console.error('Lỗi lấy danh sách khách hàng:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};
