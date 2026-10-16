import { Router } from 'express';
import { 
  getDashboardStats, 
  getAllUsers, 
  toggleUserStatus, 
  getAllTransactions, 
  getRevenueReport,
  getAllMaterials,
  updateMaterialStatus,
  getUser360Detail,
  refundTransaction,
  broadcastNotification
} from '../controllers/admin.controller';
import { authenticateJWT, authorizeRole } from '../middlewares/auth.middleware';

const router = Router();

// Tất cả API của Admin đều yêu cầu đăng nhập và có role là 'Admin'
router.use(authenticateJWT);
router.use(authorizeRole(['Admin']));

// Thống kê tổng quan
router.get('/stats', getDashboardStats);

// Quản lý người dùng
router.get('/users', getAllUsers);
router.get('/users/:id/360', getUser360Detail);
router.put('/users/:id/toggle-status', toggleUserStatus);

// Gửi thông báo
router.post('/broadcast', broadcastNotification);

// Quản lý giao dịch
router.get('/transactions', getAllTransactions);
router.post('/transactions/:id/refund', refundTransaction);
router.get('/revenue', getRevenueReport);

// Quản lý học liệu
router.get('/materials', getAllMaterials);
router.put('/materials/:id/status', updateMaterialStatus);

export default router;
