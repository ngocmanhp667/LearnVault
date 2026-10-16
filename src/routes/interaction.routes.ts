import { Router } from 'express';
import { trackInteraction, getUserInteractions } from '../controllers/interaction.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

// Ghi lại tương tác (cần đăng nhập)
router.post('/', authenticateJWT, trackInteraction);

// Lấy lịch sử tương tác của user đang đăng nhập (cần đăng nhập)
router.get('/my', authenticateJWT, getUserInteractions);

export default router;
