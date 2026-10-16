import { Router } from 'express';
import { checkout, checkPurchase, getSellerRevenue } from '../controllers/transactions.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

// Khởi tạo thanh toán (Yêu cầu đăng nhập)
router.post('/checkout', authenticateJWT, checkout);

// Kiểm tra xem user đã mua học liệu chưa
router.get('/check-purchase/:materialId', authenticateJWT, checkPurchase);

// Thống kê doanh thu người bán
router.get('/revenue', authenticateJWT, getSellerRevenue);

export default router;
