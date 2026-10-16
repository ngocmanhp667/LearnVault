'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Material } from '@/types';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ArrowLeft, BookOpen, Clock, Tag, User, Star, Download, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/stores/authStore';
import { ReviewSection } from '@/components/shared/ReviewSection';
import { RecommendationSection } from '@/components/shared/RecommendationSection';
import Link from 'next/link';

export default function MaterialDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isLoggedIn, user } = useAuthStore();
  
  const [material, setMaterial] = useState<Material | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [providerStats, setProviderStats] = useState<{ totalSales: number, averageRating: number } | null>(null);

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [couponApplied, setCouponApplied] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await api.get(`/materials/${params.id}`);
        const fetchedMaterial = res.data.data || res.data.material;
        setMaterial(fetchedMaterial);
        
        if (isLoggedIn) {
           try {
             const checkRes = await api.get(`/transactions/check-purchase/${params.id}`);
             setHasPurchased(checkRes.data.hasPurchased);
           } catch (err) {
             console.error('Lỗi khi kiểm tra trạng thái mua hàng', err);
             // Axios interceptor sẽ tự động xử lý nếu là 401
           }
        }

        // Fetch provider public profile to get stats
        if (fetchedMaterial?.provider_id) {
          try {
            const providerRes = await api.get(`/users/${fetchedMaterial.provider_id}/public`);
            setProviderStats({
              totalSales: providerRes.data.data.totalSales || 0,
              averageRating: providerRes.data.data.averageRating || 0
            });
          } catch (err) {
            console.error('Không thể tải thông tin tác giả');
          }
        }
      } catch (error) {
        toast.error('Không tìm thấy học liệu hoặc đã bị xóa');
        router.push('/materials');
      } finally {
        setLoading(false);
      }
    };
    if (params.id) {
      fetchDetail();
    }
  }, [params.id, router, isLoggedIn]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    try {
      const res = await api.post('/coupons/validate', {
        code: couponCode,
        material_id: material?.id
      });
      setDiscountAmount(res.data.data.discount_amount);
      setDiscountPercent(res.data.data.discount_percent);
      setCouponApplied(true);
      toast.success(`Áp dụng mã thành công! Giảm ${res.data.data.discount_percent}%`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Mã giảm giá không hợp lệ');
      setCouponApplied(false);
      setDiscountAmount(0);
      setDiscountPercent(0);
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handlePurchase = async () => {
    if (!isLoggedIn) {
      toast.error('Vui lòng đăng nhập để mua tài liệu này');
      router.push('/login');
      return;
    }

    if (user?.id === material?.provider_id) {
      toast.error('Bạn không thể mua tài liệu do chính mình đăng bán');
      return;
    }

    if (hasPurchased || material?.price === 0) {
       // Xử lý tải xuống nếu đã mua hoặc miễn phí
       if (material?.file_url) {
          window.open(material.file_url, '_blank');
       } else {
          toast.error('Link tải không tồn tại');
       }
       return;
    }

    setIsPurchasing(true);
    try {
      // Gọi API thanh toán thực tế (Giai đoạn 7)
      await api.post('/transactions/checkout', { 
        material_id: material?.id,
        payment_method: 'wallet',
        coupon_code: couponApplied ? couponCode : undefined
      });
      
      toast.success('Giao dịch thành công! Bạn có thể tải tài liệu về máy.');
      setHasPurchased(true);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Giao dịch thất bại');
    } finally {
      setIsPurchasing(false);
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

  return (
    <div className="container mx-auto px-4 py-8">
      <Button 
        variant="ghost" 
        onClick={() => router.back()} 
        icon={<ArrowLeft className="w-4 h-4" />}
        className="mb-6 px-0 hover:bg-transparent"
      >
        Quay lại
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cột trái: Hình ảnh & Thông tin chi tiết */}
        <div className="lg:col-span-2 space-y-8">
          {/* Thumbnail */}
          <div className="aspect-video w-full rounded-2xl overflow-hidden glass-panel border border-[rgba(255,255,255,0.05)] bg-[var(--color-bg-elevated)] flex items-center justify-center">
            {material.thumbnail_url ? (
              <img 
                src={material.thumbnail_url} 
                alt={material.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <BookOpen className="w-20 h-20 text-[var(--color-text-muted)] opacity-50" />
            )}
          </div>

          {/* Mô tả */}
          <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-[rgba(255,255,255,0.05)]">
            <h2 className="text-2xl font-bold text-white mb-4">Mô tả học liệu</h2>
            <div className="prose prose-invert max-w-none text-[var(--color-text-muted)] whitespace-pre-wrap leading-relaxed">
              {material.description}
            </div>
          </div>
        </div>

        {/* Cột phải: Giá, Action & Meta */}
        <div className="space-y-6">
          <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-[rgba(255,255,255,0.05)] sticky top-24">
            <h1 className="text-2xl font-bold text-white mb-4 leading-tight">{material.title}</h1>
            
            <div className="mb-6">
              {couponApplied ? (
                <div className="space-y-1">
                  <div className="text-xl text-[var(--color-text-muted)] line-through decoration-red-500/50">
                    {formatCurrency(material.price)}
                  </div>
                  <div className="text-4xl font-extrabold text-gradient">
                    {formatCurrency(material.price - discountAmount)}
                  </div>
                </div>
              ) : (
                <div className="text-4xl font-extrabold text-gradient">
                  {material.price === 0 ? 'Miễn phí' : formatCurrency(material.price)}
                </div>
              )}
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-[var(--color-bg-base)] border border-[rgba(255,255,255,0.05)]">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center text-white font-bold text-xl shadow-lg shrink-0">
                  {material.provider?.username?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-xs text-[var(--color-text-muted)] mb-1 uppercase tracking-wider font-semibold">Tác giả</p>
                  <Link href={`/profile/${material.provider_id}`} className="text-white font-semibold text-lg hover:text-[var(--color-primary)] transition-colors block mb-1">
                    {material.provider?.username}
                  </Link>
                  {providerStats && (
                    <div className="flex items-center gap-3 text-xs text-[var(--color-text-muted)]">
                      <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400" /> {providerStats.averageRating > 0 ? providerStats.averageRating.toFixed(1) : 'Mới'}</span>
                      <span className="w-1 h-1 rounded-full bg-[rgba(255,255,255,0.2)]"></span>
                      <span>{providerStats.totalSales} lượt bán</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center text-sm text-[var(--color-text-muted)]">
                <Clock className="w-5 h-5 mr-3 text-[var(--color-primary)]" />
                Ngày đăng: <span className="text-white ml-1">{formatDate(material.created_at)}</span>
              </div>
              <div className="flex items-center text-sm text-[var(--color-text-muted)]">
                <BookOpen className="w-5 h-5 mr-3 text-[var(--color-primary)]" />
                Định dạng: <span className="text-white ml-1 uppercase bg-[var(--color-bg-base)] px-2 py-0.5 rounded border border-[rgba(255,255,255,0.1)]">{material.file_format}</span>
              </div>
              <div className="flex items-center text-sm text-[var(--color-text-muted)]">
                <Star className="w-5 h-5 mr-3 text-[var(--color-accent)]" />
                Đánh giá: <span className="text-white ml-1">Chưa có đánh giá</span>
              </div>
            </div>

            {!hasPurchased && material.price > 0 && user?.id !== material.provider_id && (
              <div className="mb-6 space-y-3">
                <label className="text-sm font-medium text-[var(--color-text-muted)]">Mã giảm giá (Nếu có)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nhập mã..."
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    disabled={couponApplied}
                    className="flex-1 bg-[var(--color-bg-base)] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-2 text-white focus:border-[var(--color-primary)] outline-none uppercase text-sm"
                  />
                  {!couponApplied ? (
                    <Button 
                      variant="outline" 
                      onClick={handleApplyCoupon} 
                      disabled={!couponCode || applyingCoupon}
                      loading={applyingCoupon}
                    >
                      Áp dụng
                    </Button>
                  ) : (
                    <Button 
                      variant="ghost" 
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      onClick={() => { setCouponApplied(false); setDiscountAmount(0); setCouponCode(''); }}
                    >
                      Hủy mã
                    </Button>
                  )}
                </div>
              </div>
            )}

            <Button 
              size="lg" 
              className="w-full text-lg shadow-[0_0_20px_rgba(99,102,241,0.2)]"
              onClick={handlePurchase}
              loading={isPurchasing}
              icon={<Download className="w-5 h-5" />}
            >
              {hasPurchased || material.price === 0 ? 'Tải xuống ngay' : 'Mua bằng Ví'}
            </Button>

            <div className="mt-6 pt-6 border-t border-[rgba(255,255,255,0.05)] flex items-center justify-center gap-2 text-xs text-[var(--color-text-muted)] text-center">
              <ShieldCheck className="w-4 h-4 text-green-500" />
              Thanh toán an toàn, bảo vệ quyền lợi người mua
            </div>
          </div>

          {/* Tags */}
          {material.tags && material.tags.length > 0 && (
            <div className="glass-panel p-6 rounded-2xl border border-[rgba(255,255,255,0.05)]">
              <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                <Tag className="w-4 h-4 text-[var(--color-primary)]" /> Từ khóa
              </h3>
              <div className="flex flex-wrap gap-2">
                {material.tags.map(tag => (
                  <span key={tag} className="text-xs text-[var(--color-text-muted)] bg-[var(--color-bg-base)] border border-[rgba(255,255,255,0.05)] px-3 py-1.5 rounded-full hover:border-[var(--color-primary)] transition-colors cursor-pointer">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Review Section */}
      <ReviewSection materialId={material.id} />
      
      {/* AI Recommendations */}
      <div className="mt-8">
        <RecommendationSection />
      </div>
    </div>
  );
}
