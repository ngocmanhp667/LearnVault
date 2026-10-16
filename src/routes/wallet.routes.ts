import { Router } from 'express';
import { 
  getWalletBalance, 
  getWalletTransactions, 
  deposit, 
  withdraw 
} from '../controllers/wallet.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

// Tất cả API của Ví đều yêu cầu đăng nhập
router.use(authenticateJWT);

// Thông tin ví và lịch sử
router.get('/', getWalletBalance);
router.get('/transactions', getWalletTransactions);

// Giao dịch
router.post('/deposit', deposit);
router.post('/withdraw', withdraw);

export default router;
