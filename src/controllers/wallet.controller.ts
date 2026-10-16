import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import prisma from '../config/prisma';

/**
 * Lấy số dư ví của người dùng hiện tại
 */
export const getWalletBalance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Chưa đăng nhập' });
      return;
    }

    let wallet = await prisma.wallet.findUnique({
      where: { user_id: userId }
    });

    // Tạo ví nếu chưa có
    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: { user_id: userId, balance: 0 }
      });
    }

    res.status(200).json({
      message: 'Lấy thông tin ví thành công',
      data: wallet
    });
  } catch (error) {
    console.error('Lỗi lấy số dư ví:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * Lấy lịch sử giao dịch của ví
 */
export const getWalletTransactions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Chưa đăng nhập' });
      return;
    }

    const wallet = await prisma.wallet.findUnique({
      where: { user_id: userId }
    });

    if (!wallet) {
      res.status(200).json({ data: [] });
      return;
    }

    const transactions = await prisma.walletTransaction.findMany({
      where: { wallet_id: wallet.id },
      orderBy: { created_at: 'desc' },
      take: 50 // Lấy 50 giao dịch gần nhất
    });

    res.status(200).json({
      message: 'Lấy lịch sử giao dịch thành công',
      data: transactions
    });
  } catch (error) {
    console.error('Lỗi lấy lịch sử ví:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * Yêu cầu nạp tiền (Mock - thực tế cần gọi API cổng thanh toán)
 */
export const deposit = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { amount } = req.body;

    if (!userId) {
      res.status(401).json({ message: 'Chưa đăng nhập' });
      return;
    }
    if (!amount || isNaN(amount) || amount <= 0) {
      res.status(400).json({ message: 'Số tiền không hợp lệ' });
      return;
    }

    let wallet = await prisma.wallet.findUnique({ where: { user_id: userId } });
    if (!wallet) {
      wallet = await prisma.wallet.create({ data: { user_id: userId, balance: 0 } });
    }

    // Mock: Cộng tiền ngay lập tức
    const updatedWallet = await prisma.wallet.update({
      where: { id: wallet.id },
      data: { balance: { increment: amount } }
    });

    // Lưu log
    const transaction = await prisma.walletTransaction.create({
      data: {
        wallet_id: wallet.id,
        type: 'DEPOSIT',
        amount,
        status: 'Completed',
        description: 'Nạp tiền vào ví'
      }
    });

    res.status(200).json({
      message: 'Nạp tiền thành công',
      data: {
        wallet: updatedWallet,
        transaction
      }
    });
  } catch (error) {
    console.error('Lỗi nạp tiền:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * Yêu cầu rút tiền (Mock)
 */
export const withdraw = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { amount } = req.body;

    if (!userId) {
      res.status(401).json({ message: 'Chưa đăng nhập' });
      return;
    }
    if (!amount || isNaN(amount) || amount <= 0) {
      res.status(400).json({ message: 'Số tiền không hợp lệ' });
      return;
    }

    const wallet = await prisma.wallet.findUnique({ where: { user_id: userId } });
    if (!wallet || Number(wallet.balance) < amount) {
      res.status(400).json({ message: 'Số dư không đủ' });
      return;
    }

    // Trừ tiền
    const updatedWallet = await prisma.wallet.update({
      where: { id: wallet.id },
      data: { balance: { decrement: amount } }
    });

    // Lưu log
    const transaction = await prisma.walletTransaction.create({
      data: {
        wallet_id: wallet.id,
        type: 'WITHDRAWAL',
        amount,
        status: 'Completed',
        description: 'Rút tiền từ ví'
      }
    });

    res.status(200).json({
      message: 'Rút tiền thành công',
      data: {
        wallet: updatedWallet,
        transaction
      }
    });
  } catch (error) {
    console.error('Lỗi rút tiền:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};
