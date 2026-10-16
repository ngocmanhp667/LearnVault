export interface PaymentStrategy {
  /**
   * Thực hiện thanh toán.
   * Trả về chuỗi mô tả trạng thái hoặc đường dẫn thanh toán.
   */
  pay(amount: number, userId: string, materialId: string): Promise<string>;
}
