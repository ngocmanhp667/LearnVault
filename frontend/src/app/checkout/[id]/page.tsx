'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Material } from '@/types';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import { ArrowLeft, CreditCard, Wallet, Smartphone, ShieldCheck, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/stores/authStore';

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const { isLoggedIn } = useAuthStore();
  
  const [material, setMaterial] = useState<Material | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('wallet');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      toast.error('Vui lòng đăng nhập để thanh toán');
      router.push('/login');
      return;
    }

    const fetchDetail = async () => {
      try {
        const res = await api.get(`/materials/${params.id}`);
        setMaterial(res.data.data);
      } catch (error) {
        toast.error('Không tìm thấy học liệu');
        router.push('/materials');
      } finally {
        setLoading(false);
      }
    };
    if (params.id) fetchDetail();
  }, [params.id, router, isLoggedIn]);

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      // Mock API call for payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real app, this would call /api/transactions
      // await api.post('/transactions', { material_id: material?.id, method: paymentMethod });
      
      setIsSuccess(true);
      toast.success('Thanh toán thành công!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Giao dịch thất bại. Vui lòng thử lại.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)]"></div>
      </div>
    );
  }

  if (!material) return null;

  if (isSuccess) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-2xl text-center">
        <div className="glass-panel p-10 rounded-3xl border border-[rgba(255,255,255,0.05)] flex flex-col items-center animate-slide-up">
          <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Thanh toán thành công!</h1>
          <p className="text-[var(--color-text-muted)] mb-8">
            Bạn đã mua thành công <strong>{material.title}</strong>. Tài liệu đã được lưu vào thư viện của bạn.
          </p>
          
          <div className="flex gap-4">
            <Button onClick={() => router.push('/profile')} variant="outline">
              Về Trang cá nhân
            </Button>
            <Button onClick={() => router.push(`/materials/${material.id}`)}>
              Tải tài liệu ngay
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      <Button 
        variant="ghost" 
        onClick={() => router.back()} 
        icon={<ArrowLeft className="w-4 h-4" />}
        className="mb-6 px-0 hover:bg-transparent"
      >
        Quay lại
      </Button>

      <h1 className="text-3xl font-bold text-white mb-8">Thanh toán an toàn</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Phương thức thanh toán */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-[rgba(255,255,255,0.05)]">
            <h2 className="text-xl font-semibold text-white mb-6">Chọn phương thức thanh toán</h2>
            
            <div className="space-y-4">
              {/* Wallet */}
              <label className={`flex items-center p-4 rounded-xl cursor-pointer border transition-all ${paymentMethod === 'wallet' ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10' : 'border-[rgba(255,255,255,0.1)] hover:bg-[var(--color-bg-elevated)]'}`}>
                <input 
                  type="radio" 
                  name="payment" 
                  value="wallet" 
                  checked={paymentMethod === 'wallet'}
                  onChange={() => setPaymentMethod('wallet')}
                  className="hidden"
                />
                <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center ${paymentMethod === 'wallet' ? 'border-[var(--color-primary)]' : 'border-[rgba(255,255,255,0.2)]'}`}>
                  {paymentMethod === 'wallet' && <div className="w-3 h-3 rounded-full bg-[var(--color-primary)]" />}
                </div>
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400">
                    <Wallet className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">Ví EduMarket</div>
                    <div className="text-sm text-[var(--color-text-muted)]">Số dư: {formatCurrency(500000)}</div>
                  </div>
                </div>
              </label>

              {/* MoMo */}
              <label className={`flex items-center p-4 rounded-xl cursor-pointer border transition-all ${paymentMethod === 'momo' ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10' : 'border-[rgba(255,255,255,0.1)] hover:bg-[var(--color-bg-elevated)]'}`}>
                <input 
                  type="radio" 
                  name="payment" 
                  value="momo" 
                  checked={paymentMethod === 'momo'}
                  onChange={() => setPaymentMethod('momo')}
                  className="hidden"
                />
                <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center ${paymentMethod === 'momo' ? 'border-[var(--color-primary)]' : 'border-[rgba(255,255,255,0.2)]'}`}>
                  {paymentMethod === 'momo' && <div className="w-3 h-3 rounded-full bg-[var(--color-primary)]" />}
                </div>
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 bg-[#A50064]/20 rounded-lg flex items-center justify-center text-[#A50064]">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">Ví điện tử MoMo</div>
                    <div className="text-sm text-[var(--color-text-muted)]">Quét mã QR qua ứng dụng</div>
                  </div>
                </div>
              </label>

              {/* VNPay */}
              <label className={`flex items-center p-4 rounded-xl cursor-pointer border transition-all ${paymentMethod === 'vnpay' ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10' : 'border-[rgba(255,255,255,0.1)] hover:bg-[var(--color-bg-elevated)]'}`}>
                <input 
                  type="radio" 
                  name="payment" 
                  value="vnpay" 
                  checked={paymentMethod === 'vnpay'}
                  onChange={() => setPaymentMethod('vnpay')}
                  className="hidden"
                />
                <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center ${paymentMethod === 'vnpay' ? 'border-[var(--color-primary)]' : 'border-[rgba(255,255,255,0.2)]'}`}>
                  {paymentMethod === 'vnpay' && <div className="w-3 h-3 rounded-full bg-[var(--color-primary)]" />}
                </div>
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center text-blue-500">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">Thẻ ATM / VNPAY</div>
                    <div className="text-sm text-[var(--color-text-muted)]">Thẻ nội địa hoặc quét mã VNPAY</div>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Cột Tổng quan đơn hàng */}
        <div>
          <div className="glass-panel p-6 rounded-2xl border border-[rgba(255,255,255,0.05)] sticky top-24">
            <h2 className="text-xl font-semibold text-white mb-6">Tóm tắt đơn hàng</h2>
            
            <div className="flex gap-4 mb-6 pb-6 border-b border-[rgba(255,255,255,0.05)]">
              {material.thumbnail_url ? (
                <img src={material.thumbnail_url} className="w-20 h-20 rounded-lg object-cover" alt="thumb" />
              ) : (
                <div className="w-20 h-20 rounded-lg bg-[var(--color-bg-elevated)] flex-shrink-0" />
              )}
              <div>
                <h3 className="font-medium text-white line-clamp-2">{material.title}</h3>
                <p className="text-sm text-[var(--color-text-muted)] mt-1">Cung cấp bởi: {material.provider?.username}</p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-[var(--color-text-muted)]">
                <span>Tạm tính</span>
                <span>{formatCurrency(material.price)}</span>
              </div>
              <div className="flex justify-between text-[var(--color-text-muted)]">
                <span>Phí giao dịch</span>
                <span>Miễn phí</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-white pt-4 border-t border-[rgba(255,255,255,0.05)]">
                <span>Tổng cộng</span>
                <span className="text-gradient">{formatCurrency(material.price)}</span>
              </div>
            </div>

            <Button 
              className="w-full text-lg shadow-[0_0_20px_rgba(99,102,241,0.2)]" 
              onClick={handlePayment}
              loading={isProcessing}
            >
              Thanh toán ngay
            </Button>

            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[var(--color-text-muted)]">
              <ShieldCheck className="w-4 h-4 text-green-500" /> Được mã hóa SSL 256-bit
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
