import { PaymentStrategy } from './PaymentStrategy';
import { MomoPayment } from './MomoPayment';
import { VNPayPayment } from './VNPayPayment';
import { SystemWalletPayment } from './SystemWalletPayment';

export class PaymentContext {
  private strategy: PaymentStrategy;

  constructor(method: string) {
    switch (method.toLowerCase()) {
      case 'momo':
        this.strategy = new MomoPayment();
        break;
      case 'vnpay':
        this.strategy = new VNPayPayment();
        break;
      case 'wallet':
        this.strategy = new SystemWalletPayment();
        break;
      default:
        throw new Error('Phương thức thanh toán không được hỗ trợ');
    }
  }

  public executePayment(amount: number, userId: string, materialId: string): Promise<string> {
    return this.strategy.pay(amount, userId, materialId);
  }
}
