import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import prisma from '../config/prisma';
import { PaymentContext } from '../strategies/payment/PaymentContext';

export const checkout = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const buyerId = req.user?.id;
    if (!buyerId) {
      res.status(401).json({ message: 'Chưa đăng nhập' });
      return;
    }

    const { material_id, payment_method, coupon_code } = req.body;

    if (!material_id || !payment_method) {
      res.status(400).json({ message: 'Thiếu thông tin material_id hoặc payment_method' });
      return;
    }

    // 1. Kiểm tra học liệu có tồn tại không
    const material = await prisma.material.findUnique({
      where: { id: material_id }
    });

    if (!material) {
      res.status(404).json({ message: 'Học liệu không tồn tại' });
      return;
    }

    // 2. Không cho phép tự mua học liệu của mình
    if (material.provider_id === buyerId) {
      res.status(400).json({ message: 'Bạn không thể tự mua học liệu của chính mình' });
      return;
    }

    // 2b. Kiểm tra đã mua chưa
    const existingPurchase = await prisma.transaction.findFirst({
      where: {
        buyer_id: buyerId,
        material_id: material_id,
        status: 'Completed'
      }
    });

    if (existingPurchase) {
      res.status(409).json({ message: 'Bạn đã mua học liệu này rồi.' });
      return;
    }

    // Xử lý Coupon
    let finalAmount = Number(material.price);
    let discountAmount = 0;
    let appliedCoupon: any = null;

    if (coupon_code) {
      const coupon = await prisma.coupon.findUnique({ where: { code: coupon_code.toUpperCase() } });
      if (coupon && coupon.is_active && coupon.seller_id === material.provider_id) {
        if (coupon.max_uses === 0 || coupon.current_uses < coupon.max_uses) {
          if (!coupon.valid_until || new Date() <= coupon.valid_until) {
            appliedCoupon = coupon;
            discountAmount = (finalAmount * coupon.discount_percent) / 100;
            finalAmount = Math.max(0, finalAmount - discountAmount);
          }
        }
      }
    }

    // 3. Khởi tạo Giao dịch (Pending)
    const transaction = await prisma.transaction.create({
      data: {
        buyer_id: buyerId,
        seller_id: material.provider_id,
        material_id: material.id,
        amount: finalAmount,
        status: 'Pending',
        payment_method: payment_method,
        coupon_code: appliedCoupon ? appliedCoupon.code : null,
        discount_amount: appliedCoupon ? discountAmount : null
      }
    });

    // 4. Áp dụng Strategy Pattern để thanh toán
    try {
      const paymentContext = new PaymentContext(payment_method);
      const paymentResult = await paymentContext.executePayment(finalAmount, buyerId, material.id);

      // 5. Cập nhật trạng thái giao dịch sau khi thanh toán thành công
      const completedTransaction = await prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: 'Completed' }
      });

      // Tăng số lần sử dụng coupon
      if (appliedCoupon) {
        await prisma.coupon.update({
          where: { id: appliedCoupon.id },
          data: { current_uses: { increment: 1 } }
        });
      }

      // Lưu lại log tương tác mua hàng (Dùng cho hệ thống đề xuất)
      await prisma.userInteraction.create({
        data: {
          user_id: buyerId,
          material_id: material.id,
          interaction_type: 'purchase'
        }
      });

      res.status(200).json({
        message: 'Giao dịch thành công',
        transaction: completedTransaction,
        paymentDetails: paymentResult
      });

    } catch (paymentError: any) {
      // Thanh toán thất bại hoặc phương thức không hỗ trợ
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: 'Failed' }
      });

      res.status(400).json({ message: 'Thanh toán thất bại', error: paymentError.message });
    }

  } catch (error) {
    console.error('Lỗi quá trình checkout:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const checkPurchase = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const buyerId = req.user?.id;
    const materialId = req.params.materialId as string;

    if (!buyerId) {
       res.status(401).json({ message: 'Chưa đăng nhập' });
       return;
    }

    const transaction = await prisma.transaction.findFirst({
      where: {
        buyer_id: buyerId,
        material_id: materialId,
        status: 'Completed'
      }
    });

    res.status(200).json({ hasPurchased: !!transaction });
  } catch (error) {
    console.error('Lỗi kiểm tra purchase:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const getSellerRevenue = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sellerId = req.user?.id;
    if (!sellerId) {
      res.status(401).json({ message: 'Chưa đăng nhập' });
      return;
    }

    const transactions = await prisma.transaction.findMany({
      where: { 
        seller_id: sellerId,
        status: 'Completed'
      },
      select: { created_at: true, amount: true },
      orderBy: { created_at: 'asc' },
    });

    const revenueByDate: Record<string, { date: string; total: number; count: number }> = {};
    let totalRevenue = 0;
    let totalSales = 0;

    transactions.forEach(t => {
      const dateStr = t.created_at.toISOString().split('T')[0];
      
      if (!revenueByDate[dateStr]) {
        revenueByDate[dateStr] = { date: dateStr, total: 0, count: 0 };
      }
      
      const amt = Number(t.amount);
      revenueByDate[dateStr].total += amt;
      revenueByDate[dateStr].count += 1;
      
      totalRevenue += amt;
      totalSales += 1;
    });

    const chartData = Object.values(revenueByDate);

    res.status(200).json({ 
      data: {
        chartData,
        totalRevenue,
        totalSales
      }
    });
  } catch (error) {
    console.error('Lỗi lấy báo cáo doanh thu cá nhân:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};
