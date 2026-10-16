import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import prisma from '../config/prisma';

export const createCoupon = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sellerId = req.user?.id;
    if (!sellerId) {
      res.status(401).json({ message: 'Chưa đăng nhập' });
      return;
    }

    const { code, discount_percent, max_uses, valid_until } = req.body;

    if (!code || !discount_percent) {
      res.status(400).json({ message: 'Vui lòng cung cấp mã code và phần trăm giảm giá' });
      return;
    }

    if (discount_percent <= 0 || discount_percent > 100) {
      res.status(400).json({ message: 'Phần trăm giảm giá phải từ 1 đến 100' });
      return;
    }

    // Kiểm tra trùng code (Global)
    const existingCoupon = await prisma.coupon.findUnique({
      where: { code }
    });

    if (existingCoupon) {
      res.status(400).json({ message: 'Mã giảm giá này đã tồn tại, vui lòng chọn mã khác' });
      return;
    }

    const newCoupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        seller_id: sellerId,
        discount_percent: parseInt(discount_percent),
        max_uses: max_uses ? parseInt(max_uses) : 0,
        valid_until: valid_until ? new Date(valid_until) : null,
      }
    });

    res.status(201).json({
      message: 'Tạo mã giảm giá thành công',
      data: newCoupon
    });
  } catch (error) {
    console.error('Lỗi tạo mã giảm giá:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const getMyCoupons = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sellerId = req.user?.id;
    if (!sellerId) {
      res.status(401).json({ message: 'Chưa đăng nhập' });
      return;
    }

    const coupons = await prisma.coupon.findMany({
      where: { seller_id: sellerId },
      orderBy: { created_at: 'desc' }
    });

    res.status(200).json({
      message: 'Lấy danh sách mã giảm giá thành công',
      data: coupons
    });
  } catch (error) {
    console.error('Lỗi lấy danh sách mã giảm giá:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const toggleCouponStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sellerId = req.user?.id;
    const id = req.params.id as string;

    if (!sellerId) {
      res.status(401).json({ message: 'Chưa đăng nhập' });
      return;
    }

    const coupon = await prisma.coupon.findUnique({
      where: { id }
    });

    if (!coupon) {
      res.status(404).json({ message: 'Không tìm thấy mã giảm giá' });
      return;
    }

    if (coupon.seller_id !== sellerId) {
      res.status(403).json({ message: 'Bạn không có quyền sửa mã này' });
      return;
    }

    const updatedCoupon = await prisma.coupon.update({
      where: { id },
      data: { is_active: !coupon.is_active }
    });

    res.status(200).json({
      message: 'Cập nhật trạng thái thành công',
      data: updatedCoupon
    });
  } catch (error) {
    console.error('Lỗi cập nhật trạng thái mã giảm giá:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const validateCoupon = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { code, material_id } = req.body;

    if (!code || !material_id) {
      res.status(400).json({ message: 'Thiếu mã giảm giá hoặc mã học liệu' });
      return;
    }

    // 1. Tìm coupon
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() }
    });

    if (!coupon || !coupon.is_active) {
      res.status(400).json({ message: 'Mã giảm giá không tồn tại hoặc đã bị khóa' });
      return;
    }

    // 2. Tìm học liệu
    const material = await prisma.material.findUnique({
      where: { id: material_id }
    });

    if (!material) {
      res.status(404).json({ message: 'Không tìm thấy học liệu' });
      return;
    }

    // 3. Kiểm tra xem coupon này có phải của người bán học liệu không
    if (coupon.seller_id !== material.provider_id) {
      res.status(400).json({ message: 'Mã giảm giá này không áp dụng cho học liệu của tác giả này' });
      return;
    }

    // 4. Kiểm tra giới hạn số lần sử dụng
    if (coupon.max_uses > 0 && coupon.current_uses >= coupon.max_uses) {
      res.status(400).json({ message: 'Mã giảm giá đã hết lượt sử dụng' });
      return;
    }

    // 5. Kiểm tra thời hạn
    if (coupon.valid_until && new Date() > coupon.valid_until) {
      res.status(400).json({ message: 'Mã giảm giá đã hết hạn' });
      return;
    }

    // Tính toán số tiền được giảm
    const discountAmount = (Number(material.price) * coupon.discount_percent) / 100;
    const finalPrice = Math.max(0, Number(material.price) - discountAmount);

    res.status(200).json({
      message: 'Áp dụng mã giảm giá thành công',
      data: {
        discount_percent: coupon.discount_percent,
        discount_amount: discountAmount,
        final_price: finalPrice
      }
    });
  } catch (error) {
    console.error('Lỗi kiểm tra mã giảm giá:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};
