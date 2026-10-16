import { PaymentStrategy } from './PaymentStrategy';

export class MomoPayment implements PaymentStrategy {
  async pay(amount: number, userId: string, materialId: string): Promise<string> {
    // Logic gọi API của Momo giả lập
    console.log(`[Momo] Khởi tạo giao dịch ${amount} VND cho user ${userId}`);
    return 'Thanh toán thành công qua ví Momo';
  }
}
