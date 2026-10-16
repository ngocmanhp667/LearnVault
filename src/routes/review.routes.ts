import { Router } from 'express';
import { createReview, getProviderReviews } from '../controllers/review.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

// Tạo đánh giá (yêu cầu đăng nhập + đã mua hàng)
router.post('/', authenticateJWT, createReview);

// Lấy đánh giá của provider (public)
router.get('/provider/:providerId', getProviderReviews);

export default router;
