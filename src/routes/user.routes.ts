import { Router } from 'express';
import { 
  getProfile, 
  getMyMaterials, 
  getMyPurchases, 
  updatePassword,
  updateProfile,
  getPublicProfile,
  getDashboardStats,
  getMyCustomers
} from '../controllers/user.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

// Lấy thông tin cá nhân (Yêu cầu đăng nhập)
router.get('/profile', authenticateJWT, getProfile);

// Các route liên quan đến hồ sơ (Yêu cầu đăng nhập)
router.get('/me/materials', authenticateJWT, getMyMaterials);
router.get('/me/purchases', authenticateJWT, getMyPurchases);
router.put('/me/password', authenticateJWT, updatePassword);
router.put('/me/profile', authenticateJWT, updateProfile);
router.get('/me/dashboard', authenticateJWT, getDashboardStats);
router.get('/me/customers', authenticateJWT, getMyCustomers);

// Hồ sơ công khai (Không yêu cầu đăng nhập)
router.get('/:id/public', getPublicProfile);

export default router;
