import { Router } from 'express';
import { createCoupon, getMyCoupons, toggleCouponStatus, validateCoupon } from '../controllers/coupon.controller';
import { authenticateJWT, authorizeRole } from '../middlewares/auth.middleware';

const router = Router();

// Lấy danh sách mã giảm giá của mình (Seller)
router.get('/', authenticateJWT, getMyCoupons);

// Tạo mã giảm giá mới (Seller)
router.post('/', authenticateJWT, createCoupon);

// Bật/tắt mã giảm giá (Seller)
router.put('/:id/toggle', authenticateJWT, toggleCouponStatus);

// Kiểm tra mã giảm giá (Buyer)
router.post('/validate', authenticateJWT, validateCoupon);

export default router;
