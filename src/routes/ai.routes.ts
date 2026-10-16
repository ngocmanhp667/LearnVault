import { Router } from 'express';
import { getRecommendations, chatWithAI } from '../controllers/ai.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

// Endpoint lấy danh sách học liệu được AI đề xuất cho người dùng
// Yêu cầu đăng nhập để phân tích lịch sử
router.get('/recommend', authenticateJWT, getRecommendations);

// Endpoint chat với AI (EduBot)
router.post('/chat', chatWithAI);

export default router;
