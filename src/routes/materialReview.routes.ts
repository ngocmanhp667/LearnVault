import { Router } from 'express';
import { createMaterialReview, getMaterialReviews, deleteMaterialReview, replyToMaterialReview, getMyReceivedReviews } from '../controllers/materialReview.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

// Tạo đánh giá học liệu (yêu cầu đăng nhập, đã mua)
router.post('/', authenticateJWT, createMaterialReview);

// Lấy danh sách đánh giá mà seller nhận được
router.get('/me/received', authenticateJWT, getMyReceivedReviews);

// Lấy đánh giá của 1 học liệu (public)
router.get('/:materialId', getMaterialReviews);

// Xoá đánh giá (chủ đánh giá hoặc Admin)
router.delete('/:id', authenticateJWT, deleteMaterialReview);

// Seller trả lời đánh giá
router.put('/:id/reply', authenticateJWT, replyToMaterialReview);

export default router;
