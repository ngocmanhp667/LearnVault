import { PaymentStrategy } from './PaymentStrategy';

export class VNPayPayment implements PaymentStrategy {
  async pay(amount: number, userId: string, materialId: string): Promise<string> {
    // Logic gọi API của VNPay giả lập
    console.log(`[VNPay] Khởi tạo giao dịch ${amount} VND cho user ${userId}`);
    return 'Thanh toán thành công qua cổng VNPay';
  }
}
