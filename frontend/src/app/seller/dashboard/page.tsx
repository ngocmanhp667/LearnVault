'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { formatDate, formatCurrency } from '@/lib/utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, DollarSign, Package } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SellerDashboardPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalRevenue: 0, totalSales: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'coupons' | 'customers' | 'reviews'>('overview');
  
  // Coupon state
  const [coupons, setCoupons] = useState<any[]>([]);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [couponForm, setCouponForm] = useState({ code: '', discount: 10, maxUses: 0, validUntil: '' });
  const [savingCoupon, setSavingCoupon] = useState(false);

  // Customers state
  const [customers, setCustomers] = useState<any[]>([]);

  // Reviews state
  const [reviews, setReviews] = useState<any[]>([]);
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [submittingReply, setSubmittingReply] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const fetchSellerData = async () => {
      try {
        const res = await api.get('/transactions/revenue');
        const rawRevenue = res.data.data.chartData;
        setStats({
          totalRevenue: res.data.data.totalRevenue,
          totalSales: res.data.data.totalSales
        });
        
        rawRevenue.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const formattedRevenue = rawRevenue.map((item: any) => ({
          name: formatDate(item.date).substring(0, 5),
          total: item.total
        }));
        
        setRevenueData(formattedRevenue);
        
        // Fetch coupons
        const couponsRes = await api.get('/coupons');
        setCoupons(couponsRes.data.data);

        // Fetch customers
        const customersRes = await api.get('/users/me/customers');
        setCustomers(customersRes.data.data);

        // Fetch reviews
        const reviewsRes = await api.get('/material-reviews/me/received');
        setReviews(reviewsRes.data.data);
      } catch (error) {
        console.error('Lỗi lấy dữ liệu dashboard:', error);
        toast.error('Không thể tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    fetchSellerData();
  }, [isAuthenticated, router]);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCoupon(true);
    try {
      const res = await api.post('/coupons', {
        code: couponForm.code,
        discount_percent: couponForm.discount,
        max_uses: couponForm.maxUses,
        valid_until: couponForm.validUntil || null
      });
      setCoupons([res.data.data, ...coupons]);
      setShowCouponModal(false);
      toast.success('Tạo mã giảm giá thành công');
      setCouponForm({ code: '', discount: 10, maxUses: 0, validUntil: '' });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setSavingCoupon(false);
    }
  };

  const handleToggleCoupon = async (id: string, currentStatus: boolean) => {
    try {
      await api.put(`/coupons/${id}/toggle`);
      setCoupons(coupons.map(c => c.id === id ? { ...c, is_active: !currentStatus } : c));
      toast.success('Cập nhật trạng thái thành công');
    } catch (error) {
      toast.error('Không thể cập nhật trạng thái mã');
    }
  };

  const handleReplySubmit = async (reviewId: string) => {
    const text = replyText[reviewId];
    if (!text?.trim()) return;
    
    setSubmittingReply(reviewId);
    try {
      const res = await api.put(`/material-reviews/${reviewId}/reply`, { seller_reply: text });
      toast.success('Đã gửi phản hồi');
      setReviews(reviews.map(r => r.id === reviewId ? { ...r, seller_reply: text, replied_at: res.data.data.replied_at } : r));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể phản hồi');
    } finally {
      setSubmittingReply(null);
    }
  };

  if (loading) {
    return <div className="min-h-screen pt-24 pb-12 px-4 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 font-outfit">Seller Dashboard</h1>
            <p className="text-[var(--color-text-muted)]">Quản lý doanh thu và mã giảm giá của bạn</p>
          </div>
          <div className="flex bg-[var(--color-bg-elevated)] p-1 rounded-xl border border-[rgba(255,255,255,0.05)]">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'overview' 
                  ? 'bg-[var(--color-primary)] text-white shadow-lg' 
                  : 'text-[var(--color-text-muted)] hover:text-white'
              }`}
            >
              Tổng quan
            </button>
            <button
              onClick={() => setActiveTab('coupons')}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'coupons' 
                  ? 'bg-[var(--color-primary)] text-white shadow-lg' 
                  : 'text-[var(--color-text-muted)] hover:text-white'
              }`}
            >
              Mã giảm giá
            </button>
            <button
              onClick={() => setActiveTab('customers')}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'customers' 
                  ? 'bg-[var(--color-primary)] text-white shadow-lg' 
                  : 'text-[var(--color-text-muted)] hover:text-white'
              }`}
            >
              Khách hàng
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'reviews' 
                  ? 'bg-[var(--color-primary)] text-white shadow-lg' 
                  : 'text-[var(--color-text-muted)] hover:text-white'
              }`}
            >
              Đánh giá
            </button>
          </div>
        </div>

        {activeTab === 'overview' && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="glass-panel p-6 rounded-2xl border border-[rgba(255,255,255,0.05)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[var(--color-text-muted)] font-medium">Tổng doanh thu</h3>
              <div className="w-10 h-10 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-bold text-white text-gradient">{formatCurrency(stats.totalRevenue)}</div>
          </div>
          
          <div className="glass-panel p-6 rounded-2xl border border-[rgba(255,255,255,0.05)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[var(--color-text-muted)] font-medium">Số lượt bán</h3>
              <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-bold text-white">{stats.totalSales}</div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-[rgba(255,255,255,0.05)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[var(--color-text-muted)] font-medium">Khách hàng mới</h3>
              <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-bold text-white">{(stats.totalSales * 0.8).toFixed(0)}</div>
          </div>
          
          <div className="glass-panel p-6 rounded-2xl border border-[rgba(255,255,255,0.05)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[var(--color-text-muted)] font-medium">Đang bán</h3>
              <div className="w-10 h-10 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center">
                <Package className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-bold text-white">Hoạt động</div>
          </div>
        </div>

        {/* Charts */}
        <div className="glass-panel p-6 rounded-2xl border border-[rgba(255,255,255,0.05)]">
          <h3 className="text-xl font-semibold text-white mb-6">Biểu đồ doanh thu (30 ngày gần nhất)</h3>
          <div className="h-96 w-full">
            {revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="name" 
                    stroke="rgba(255,255,255,0.3)" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.3)" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `${value / 1000}k`}
                  />
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--color-bg-elevated)', 
                      borderColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: 'white'
                    }}
                    itemStyle={{ color: 'var(--color-primary)' }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="total" 
                    stroke="var(--color-primary)" 
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-[var(--color-text-muted)] border border-dashed border-[rgba(255,255,255,0.1)] rounded-xl bg-[var(--color-bg-base)]">
                <TrendingUp className="w-12 h-12 mb-4 opacity-50" />
                <p>Bạn chưa có giao dịch nào</p>
                <p className="text-sm">Hãy đăng bán thêm học liệu để tăng doanh thu!</p>
              </div>
            )}
          </div>
        </div>
        </>
        )}
        
        {activeTab === 'coupons' && (
          <div className="glass-panel rounded-2xl border border-[rgba(255,255,255,0.05)] overflow-hidden animate-slide-up">
            <div className="p-6 border-b border-[rgba(255,255,255,0.05)] flex justify-between items-center bg-[var(--color-bg-elevated)]/30">
              <h3 className="text-xl font-semibold text-white">Quản lý Mã Giảm Giá</h3>
              <button onClick={() => setShowCouponModal(true)} className="btn-primary py-2 px-4 text-sm">
                + Tạo mã mới
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-[var(--color-text-muted)]">
                <thead className="text-xs uppercase bg-[var(--color-bg-base)] text-[var(--color-text-muted)]">
                  <tr>
                    <th className="px-6 py-4 font-medium border-b border-[rgba(255,255,255,0.05)]">Mã Code</th>
                    <th className="px-6 py-4 font-medium border-b border-[rgba(255,255,255,0.05)]">Giảm giá</th>
                    <th className="px-6 py-4 font-medium border-b border-[rgba(255,255,255,0.05)]">Đã dùng / Tối đa</th>
                    <th className="px-6 py-4 font-medium border-b border-[rgba(255,255,255,0.05)]">Ngày tạo</th>
                    <th className="px-6 py-4 font-medium border-b border-[rgba(255,255,255,0.05)]">Trạng thái</th>
                    <th className="px-6 py-4 font-medium border-b border-[rgba(255,255,255,0.05)] text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((coupon) => (
                    <tr key={coupon.id} className="border-b border-[rgba(255,255,255,0.05)] hover:bg-[var(--color-bg-elevated)]/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-white tracking-wider">{coupon.code}</td>
                      <td className="px-6 py-4 text-green-400 font-medium">-{coupon.discount_percent}%</td>
                      <td className="px-6 py-4">{coupon.current_uses} / {coupon.max_uses === 0 ? '∞' : coupon.max_uses}</td>
                      <td className="px-6 py-4">{formatDate(coupon.created_at).split(' ')[0]}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${coupon.is_active ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                          {coupon.is_active ? 'Đang bật' : 'Đã tắt'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleToggleCoupon(coupon.id, coupon.is_active)}
                          className={`text-sm font-medium hover:underline ${coupon.is_active ? 'text-red-400' : 'text-green-400'}`}
                        >
                          {coupon.is_active ? 'Tắt mã' : 'Bật lại'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {coupons.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-[var(--color-text-muted)]">
                        Bạn chưa tạo mã giảm giá nào
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="glass-panel rounded-2xl border border-[rgba(255,255,255,0.05)] overflow-hidden animate-slide-up">
            <div className="p-6 border-b border-[rgba(255,255,255,0.05)] flex justify-between items-center bg-[var(--color-bg-elevated)]/30">
              <h3 className="text-xl font-semibold text-white">Khách hàng của tôi</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-[var(--color-text-muted)]">
                <thead className="text-xs uppercase bg-[var(--color-bg-base)] text-[var(--color-text-muted)]">
                  <tr>
                    <th className="px-6 py-4 font-medium border-b border-[rgba(255,255,255,0.05)]">Username</th>
                    <th className="px-6 py-4 font-medium border-b border-[rgba(255,255,255,0.05)]">Email</th>
                    <th className="px-6 py-4 font-medium border-b border-[rgba(255,255,255,0.05)]">Số tiền đã chi</th>
                    <th className="px-6 py-4 font-medium border-b border-[rgba(255,255,255,0.05)]">Số lượt mua</th>
                    <th className="px-6 py-4 font-medium border-b border-[rgba(255,255,255,0.05)]">Ngày gia nhập</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => (
                    <tr key={c.id} className="border-b border-[rgba(255,255,255,0.05)] hover:bg-[var(--color-bg-elevated)]/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-white">{c.username}</td>
                      <td className="px-6 py-4">{c.email}</td>
                      <td className="px-6 py-4 text-green-400 font-medium">{formatCurrency(c.totalSpent)}</td>
                      <td className="px-6 py-4">{c.totalPurchases} lượt</td>
                      <td className="px-6 py-4">{formatDate(c.joined_at).split(' ')[0]}</td>
                    </tr>
                  ))}
                  {customers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-[var(--color-text-muted)]">
                        Bạn chưa có khách hàng nào
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="glass-panel rounded-2xl border border-[rgba(255,255,255,0.05)] overflow-hidden animate-slide-up">
            <div className="p-6 border-b border-[rgba(255,255,255,0.05)] flex justify-between items-center bg-[var(--color-bg-elevated)]/30">
              <h3 className="text-xl font-semibold text-white">Đánh giá từ khách hàng</h3>
            </div>
            
            <div className="p-6 space-y-6">
              {reviews.map((r) => (
                <div key={r.id} className="bg-[var(--color-bg-base)] border border-[rgba(255,255,255,0.05)] p-5 rounded-xl">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium text-white">{r.user.username}</h4>
                      <p className="text-xs text-[var(--color-text-muted)] mt-1">Đã mua: {r.material.title}</p>
                    </div>
                    <div className="flex text-yellow-400">
                      {'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}
                    </div>
                  </div>
                  <p className="text-sm text-[var(--color-text-muted)] italic mb-4">"{r.comment || 'Không có bình luận'}"</p>
                  
                  {r.seller_reply ? (
                    <div className="mt-4 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 p-4 rounded-lg">
                      <p className="text-xs font-semibold text-[var(--color-primary)] mb-1">Phản hồi của bạn ({formatDate(r.replied_at).split(' ')[0]}):</p>
                      <p className="text-sm text-white">{r.seller_reply}</p>
                    </div>
                  ) : (
                    <div className="mt-4 flex gap-2">
                      <input 
                        type="text" 
                        value={replyText[r.id] || ''}
                        onChange={(e) => setReplyText({ ...replyText, [r.id]: e.target.value })}
                        placeholder="Nhập phản hồi của bạn..."
                        className="flex-1 bg-[var(--color-bg-elevated)] border border-[rgba(255,255,255,0.1)] rounded-lg px-3 py-2 text-sm text-white focus:border-[var(--color-primary)]"
                      />
                      <button 
                        onClick={() => handleReplySubmit(r.id)}
                        disabled={submittingReply === r.id || !replyText[r.id]?.trim()}
                        className="px-4 py-2 bg-[var(--color-primary)] text-white text-sm font-medium rounded-lg disabled:opacity-50 hover:bg-indigo-600 transition-colors"
                      >
                        {submittingReply === r.id ? 'Đang gửi...' : 'Phản hồi'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {reviews.length === 0 && (
                <div className="text-center py-12 text-[var(--color-text-muted)]">
                  Chưa có đánh giá nào cho học liệu của bạn
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal Tạo Coupon */}
        {showCouponModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <div className="bg-[var(--color-bg-base)] w-full max-w-md rounded-2xl border border-[rgba(255,255,255,0.1)] shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-[rgba(255,255,255,0.05)] flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Tạo Mã Giảm Giá</h2>
                <button onClick={() => setShowCouponModal(false)} className="text-[var(--color-text-muted)] hover:text-white">✕</button>
              </div>
              <form onSubmit={handleCreateCoupon} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1.5">Mã Code (Tự chọn)</label>
                  <input
                    type="text" required
                    value={couponForm.code}
                    onChange={(e) => setCouponForm({...couponForm, code: e.target.value.toUpperCase()})}
                    className="w-full bg-[var(--color-bg-elevated)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white focus:border-[var(--color-primary)] uppercase"
                    placeholder="VD: KHUYENMAI20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1.5">Phần trăm giảm (%)</label>
                  <input
                    type="number" required min="1" max="100"
                    value={couponForm.discount}
                    onChange={(e) => setCouponForm({...couponForm, discount: parseInt(e.target.value)})}
                    className="w-full bg-[var(--color-bg-elevated)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white focus:border-[var(--color-primary)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1.5">Lượt sử dụng tối đa (0 = Vô hạn)</label>
                  <input
                    type="number" min="0"
                    value={couponForm.maxUses}
                    onChange={(e) => setCouponForm({...couponForm, maxUses: parseInt(e.target.value)})}
                    className="w-full bg-[var(--color-bg-elevated)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white focus:border-[var(--color-primary)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1.5">Hạn sử dụng (Không bắt buộc)</label>
                  <input
                    type="date"
                    value={couponForm.validUntil}
                    onChange={(e) => setCouponForm({...couponForm, validUntil: e.target.value})}
                    className="w-full bg-[var(--color-bg-elevated)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white focus:border-[var(--color-primary)]"
                  />
                </div>
                <div className="flex gap-3 justify-end pt-4 border-t border-[rgba(255,255,255,0.05)]">
                  <button type="button" onClick={() => setShowCouponModal(false)} className="btn-secondary">Hủy</button>
                  <button type="submit" disabled={savingCoupon} className="btn-primary">
                    {savingCoupon ? 'Đang tạo...' : 'Lưu mã giảm giá'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
