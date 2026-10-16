import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import prisma from '../config/prisma';

/**
 * Lấy số liệu thống kê tổng quan cho Admin Dashboard
 */
export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const totalUsers = await prisma.user.count();
    const totalMaterials = await prisma.material.count();
    const totalTransactions = await prisma.transaction.count();

    const revenueResult = await prisma.transaction.aggregate({
      where: { status: 'Completed' },
      _sum: { amount: true },
    });
    const totalRevenue = revenueResult._sum.amount || 0;

    // Phân tích trạng thái giao dịch
    const transactionsByStatus = await prisma.transaction.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    // Thống kê 7 ngày qua
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const newUsersLast7Days = await prisma.user.count({
      where: { created_at: { gte: sevenDaysAgo } },
    });

    const newMaterialsLast7Days = await prisma.material.count({
      where: { created_at: { gte: sevenDaysAgo } },
    });

    // Top 5 học liệu bán chạy nhất
    const topMaterialsAgg = await prisma.transaction.groupBy({
      by: ['material_id'],
      where: { status: 'Completed' },
      _count: { material_id: true },
      orderBy: { _count: { material_id: 'desc' } },
      take: 5,
    });

    // Lấy thêm thông tin chi tiết cho các học liệu top
    const topMaterials = await Promise.all(
      topMaterialsAgg.map(async (agg) => {
        const material = await prisma.material.findUnique({
          where: { id: agg.material_id },
          select: { id: true, title: true, price: true, provider: { select: { username: true } } },
        });
        return {
          ...material,
          salesCount: agg._count.material_id,
        };
      })
    );

    res.status(200).json({
      message: 'Lấy thống kê thành công',
      data: {
        totals: {
          users: totalUsers,
          materials: totalMaterials,
          transactions: totalTransactions,
          revenue: totalRevenue,
        },
        transactionsByStatus,
        recentActivity: {
          newUsersLast7Days,
          newMaterialsLast7Days,
        },
        topMaterials,
      },
    });
  } catch (error) {
    console.error('Lỗi lấy thống kê dashboard:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * Lấy danh sách tất cả người dùng (Phân trang, Tìm kiếm)
 */
export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const keyword = req.query.keyword as string;
    const skip = (page - 1) * limit;

    const whereClause: any = {};
    if (keyword) {
      whereClause.OR = [
        { username: { contains: keyword } },
        { email: { contains: keyword } },
      ];
    }

    const total = await prisma.user.count({ where: whereClause });
    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        is_active: true,
        created_at: true,
        _count: {
          select: { materials: true, purchases: true },
        },
      },
      orderBy: { created_at: 'desc' },
      skip,
      take: limit,
    });

    res.status(200).json({
      message: 'Lấy danh sách người dùng thành công',
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Lỗi lấy danh sách người dùng:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * Khoá hoặc mở khoá tài khoản người dùng
 */
export const toggleUserStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const adminId = req.user?.id;
    const targetUserId = req.params.id as string;

    if (adminId === targetUserId) {
      res.status(400).json({ message: 'Không thể khoá tài khoản của chính mình.' });
      return;
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      res.status(404).json({ message: 'Không tìm thấy người dùng.' });
      return;
    }

    if (targetUser.role === 'Admin') {
      res.status(403).json({ message: 'Không thể khoá một Admin khác.' });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: { is_active: !targetUser.is_active },
      select: { id: true, username: true, is_active: true },
    });

    res.status(200).json({
      message: updatedUser.is_active ? 'Mở khoá tài khoản thành công' : 'Khoá tài khoản thành công',
      data: updatedUser,
    });
  } catch (error) {
    console.error('Lỗi khoá tài khoản:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * Xem tất cả giao dịch trên sàn (Phân trang, Lọc)
 */
export const getAllTransactions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string; // Pending, Completed, Failed, Cancelled
    const skip = (page - 1) * limit;

    const whereClause: any = {};
    if (status) {
      whereClause.status = status;
    }

    const total = await prisma.transaction.count({ where: whereClause });
    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      include: {
        buyer: { select: { id: true, username: true, email: true } },
        seller: { select: { id: true, username: true, email: true } },
        material: { select: { id: true, title: true, price: true } },
      },
      orderBy: { created_at: 'desc' },
      skip,
      take: limit,
    });

    res.status(200).json({
      message: 'Lấy danh sách giao dịch thành công',
      data: transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Lỗi lấy danh sách giao dịch:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * Hoàn tiền giao dịch (Refund)
 */
export const refundTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const transactionId = req.params.id as string;

    // Sử dụng transaction của Prisma để đảm bảo tính toàn vẹn dữ liệu
    const result = await prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.findUnique({
        where: { id: transactionId }
      });

      if (!transaction) {
        throw new Error('Không tìm thấy giao dịch');
      }

      if (transaction.status !== 'Completed') {
        throw new Error('Chỉ có thể hoàn tiền cho giao dịch đã hoàn thành');
      }

      const amount = Number(transaction.amount);

      // 1. Trừ tiền ví người bán
      const sellerWallet = await tx.wallet.findUnique({ where: { user_id: transaction.seller_id } });
      if (!sellerWallet || Number(sellerWallet.balance) < amount) {
        throw new Error('Ví người bán không đủ số dư để hoàn tiền');
      }

      await tx.wallet.update({
        where: { user_id: transaction.seller_id },
        data: { balance: { decrement: amount } }
      });

      // 2. Cộng tiền ví người mua
      await tx.wallet.update({
        where: { user_id: transaction.buyer_id },
        data: { balance: { increment: amount } }
      });

      // 3. Cập nhật trạng thái giao dịch
      const updatedTx = await tx.transaction.update({
        where: { id: transactionId },
        data: { status: 'Refunded' } // Cần đảm bảo schema cho phép status này hoặc ta lưu là 'Cancelled'
      });

      // 4. Tạo thông báo
      await tx.notification.create({
        data: {
          user_id: transaction.buyer_id,
          title: 'Hoàn tiền thành công',
          message: `Giao dịch mua tài liệu của bạn đã được Admin hoàn số tiền ${amount}đ.`
        }
      });
      await tx.notification.create({
        data: {
          user_id: transaction.seller_id,
          title: 'Giao dịch bị hoàn tiền',
          message: `Giao dịch tài liệu của bạn đã bị Admin hoàn tiền. Hệ thống đã trừ ${amount}đ từ ví.`
        }
      });

      return updatedTx;
    });

    res.status(200).json({
      message: 'Hoàn tiền thành công',
      data: result
    });
  } catch (error: any) {
    console.error('Lỗi hoàn tiền:', error);
    res.status(400).json({ message: error.message || 'Lỗi hệ thống khi hoàn tiền' });
  }
};

/**
 * Gửi thông báo hệ thống hàng loạt (Broadcast)
 */
export const broadcastNotification = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, message, segment } = req.body;

    if (!title || !message) {
      res.status(400).json({ message: 'Vui lòng cung cấp tiêu đề và nội dung' });
      return;
    }

    let userIds: string[] = [];

    if (segment === 'All') {
      const users = await prisma.user.findMany({ select: { id: true } });
      userIds = users.map(u => u.id);
    } else if (segment === 'Active') {
      const users = await prisma.user.findMany({ where: { is_active: true }, select: { id: true } });
      userIds = users.map(u => u.id);
    } else if (segment === 'Inactive') {
      const users = await prisma.user.findMany({ where: { is_active: false }, select: { id: true } });
      userIds = users.map(u => u.id);
    } else {
      res.status(400).json({ message: 'Phân khúc khách hàng không hợp lệ' });
      return;
    }

    if (userIds.length === 0) {
      res.status(400).json({ message: 'Không có người dùng nào trong nhóm này để gửi' });
      return;
    }

    // Tạo thông báo hàng loạt (bulk insert)
    const notifications = userIds.map(userId => ({
      user_id: userId,
      title,
      message,
    }));

    await prisma.notification.createMany({
      data: notifications
    });

    res.status(200).json({
      message: `Đã gửi thông báo thành công tới ${userIds.length} người dùng.`
    });
  } catch (error) {
    console.error('Lỗi gửi thông báo:', error);
    res.status(500).json({ message: 'Lỗi server khi gửi thông báo' });
  }
};

/**
 * Báo cáo doanh thu theo thời gian
 */
export const getRevenueReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    const whereClause: any = { status: 'Completed' };
    
    if (startDate || endDate) {
      whereClause.created_at = {};
      if (startDate) whereClause.created_at.gte = new Date(startDate as string);
      if (endDate) whereClause.created_at.lte = new Date(endDate as string);
    }

    // Do MySQL/Prisma không hỗ trợ groupBy theo hàm DATE dễ dàng, 
    // chúng ta sẽ lấy list giao dịch và group bằng Javascript cho linh hoạt trong bản MVP
    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      select: { created_at: true, amount: true },
      orderBy: { created_at: 'asc' },
    });

    const revenueByDate: Record<string, { date: string; total: number; count: number }> = {};

    transactions.forEach(t => {
      // Chuyển date thành chuỗi 'YYYY-MM-DD'
      const dateStr = t.created_at.toISOString().split('T')[0];
      
      if (!revenueByDate[dateStr]) {
        revenueByDate[dateStr] = { date: dateStr, total: 0, count: 0 };
      }
      
      revenueByDate[dateStr].total += Number(t.amount);
      revenueByDate[dateStr].count += 1;
    });

    const report = Object.values(revenueByDate);

    res.status(200).json({
      message: 'Lấy báo cáo doanh thu thành công',
      data: report,
    });
  } catch (error) {
    console.error('Lỗi lấy báo cáo doanh thu:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * Lấy danh sách tất cả học liệu (Admin)
 */
export const getAllMaterials = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const keyword = req.query.keyword as string;
    const status = req.query.status as string; // Pending, Approved, Rejected
    const skip = (page - 1) * limit;

    const whereClause: any = {};
    if (keyword) {
      whereClause.title = { contains: keyword };
    }
    if (status) {
      whereClause.status = status;
    }

    const total = await prisma.material.count({ where: whereClause });
    const materials = await prisma.material.findMany({
      where: whereClause,
      include: {
        provider: { select: { username: true, email: true } },
      },
      orderBy: { created_at: 'desc' },
      skip,
      take: limit,
    });

    res.status(200).json({
      message: 'Lấy danh sách học liệu thành công',
      data: materials,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Lỗi lấy danh sách học liệu:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * Duyệt hoặc từ chối học liệu
 */
export const updateMaterialStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { status } = req.body; // Pending, Approved, Rejected

    if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
      res.status(400).json({ message: 'Trạng thái không hợp lệ.' });
      return;
    }

    const material = await prisma.material.findUnique({
      where: { id },
    });

    if (!material) {
      res.status(404).json({ message: 'Không tìm thấy học liệu.' });
      return;
    }

    const updatedMaterial = await prisma.material.update({
      where: { id },
      data: { status },
    });

    // Gửi thông báo cho người đăng
    await prisma.notification.create({
      data: {
        user_id: material.provider_id,
        title: 'Cập nhật trạng thái học liệu',
        message: `Học liệu "${material.title}" của bạn đã được chuyển sang trạng thái: ${status}.`,
      }
    });

    res.status(200).json({
      message: 'Cập nhật trạng thái thành công',
      data: updatedMaterial,
    });
  } catch (error) {
    console.error('Lỗi cập nhật trạng thái học liệu:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * Lấy Hồ sơ 360 độ của một người dùng
 */
export const getUser360Detail = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        wallet: true,
        purchases: {
          include: {
            material: { select: { title: true, price: true } }
          },
          orderBy: { created_at: 'desc' },
          take: 10
        },
        sales: {
          include: {
            material: { select: { title: true, price: true } }
          },
          orderBy: { created_at: 'desc' },
          take: 10
        },
        interactions: {
          include: {
            material: { select: { title: true } }
          },
          orderBy: { created_at: 'desc' },
          take: 10
        },
        materials: {
          select: { id: true, title: true, price: true, status: true, created_at: true },
          orderBy: { created_at: 'desc' }
        },
        tickets: {
          orderBy: { created_at: 'desc' }
        }
      }
    });

    if (!user) {
      res.status(404).json({ message: 'Không tìm thấy người dùng' });
      return;
    }

    // Tính toán thêm một số chỉ số
    const totalSpentResult = await prisma.transaction.aggregate({
      where: { buyer_id: id, status: 'Completed' },
      _sum: { amount: true }
    });
    
    const totalEarnedResult = await prisma.transaction.aggregate({
      where: { seller_id: id, status: 'Completed' },
      _sum: { amount: true }
    });

    const totalSpent = totalSpentResult._sum.amount || 0;
    const totalEarned = totalEarnedResult._sum.amount || 0;

    res.status(200).json({
      data: {
        ...user,
        stats: {
          totalSpent,
          totalEarned
        }
      }
    });
  } catch (error) {
    console.error('Lỗi lấy hồ sơ 360 độ:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};
