import { PaymentStrategy } from './PaymentStrategy';
import prisma from '../../config/prisma';

export class SystemWalletPayment implements PaymentStrategy {
  async pay(amount: number, userId: string, materialId: string): Promise<string> {
    // Tìm ví người mua
    const buyerWallet = await prisma.wallet.findUnique({
      where: { user_id: userId }
    });

    if (!buyerWallet || Number(buyerWallet.balance) < amount) {
      throw new Error('Số dư ví không đủ để thanh toán. Vui lòng nạp thêm tiền.');
    }

    // Tìm seller từ material
    const material = await prisma.material.findUnique({
      where: { id: materialId },
      select: { provider_id: true }
    });

    if (!material) {
      throw new Error('Học liệu không tồn tại');
    }

    // Trừ tiền người mua
    await prisma.wallet.update({
      where: { user_id: userId },
      data: { balance: { decrement: amount } }
    });

    // Ghi log giao dịch người mua
    await prisma.walletTransaction.create({
      data: {
        wallet_id: buyerWallet.id,
        type: 'PAYMENT',
        amount,
        status: 'Completed',
        description: `Thanh toán học liệu`
      }
    });

    // Tìm hoặc tạo ví người bán và cộng tiền
    let sellerWallet = await prisma.wallet.findUnique({
      where: { user_id: material.provider_id }
    });

    if (!sellerWallet) {
      sellerWallet = await prisma.wallet.create({
        data: { user_id: material.provider_id, balance: 0 }
      });
    }

    await prisma.wallet.update({
      where: { user_id: material.provider_id },
      data: { balance: { increment: amount } }
    });

    // Ghi log giao dịch người bán
    await prisma.walletTransaction.create({
      data: {
        wallet_id: sellerWallet.id,
        type: 'EARNING',
        amount,
        status: 'Completed',
        description: `Thu nhập từ bán học liệu`
      }
    });

    return 'Thanh toán thành công qua Ví Hệ Thống';
  }
}
