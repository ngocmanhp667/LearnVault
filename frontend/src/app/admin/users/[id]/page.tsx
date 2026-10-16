'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import { formatDate, formatCurrency } from '@/lib/utils';
import { ArrowLeft, User, Mail, Calendar, Shield, Wallet, BookOpen, ShoppingBag, Store, Clock, Settings, Ban, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface User360 {
  id: string;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
  wallet?: {
    balance: number;
  };
  stats: {
    totalSpent: number;
    totalEarned: number;
  };
  purchases: Array<{
    id: string;
    amount: number;
    created_at: string;
    material: { title: string; price: number };
  }>;
  sales: Array<{
    id: string;
    amount: number;
    created_at: string;
    material: { title: string; price: number };
  }>;
  materials: Array<{
    id: string;
    title: string;
    price: number;
    status: string;
    created_at: string;
  }>;
  tickets: Array<{
    id: string;
    subject: string;
    status: string;
    created_at: string;
  }>;
}

export default function User360ProfilePage() {
  const { isAuthenticated, isAdmin } = useAuthStore();
  const router = useRouter();
  const params = useParams();
  
  const [user, setUser] = useState<User360 | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!isAdmin) {
      router.push('/');
      return;
    }
    fetchUser360();
  }, [isAuthenticated, isAdmin, router, params.id]);

  const fetchUser360 = async () => {
    try {
      const res = await api.get(`/admin/users/${params.id}/360`);
      setUser(res.data.data);
    } catch (error) {
      console.error('Lỗi lấy hồ sơ 360:', error);
      toast.error('Không tìm thấy thông tin người dùng');
      router.push('/admin/users');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!user) return;
    try {
      await api.put(`/admin/users/${user.id}/toggle-status`);
      setUser({ ...user, is_active: !user.is_active });
      toast.success(user.is_active ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể thay đổi trạng thái');
    }
  };

  if (loading) {
    return <div className="min-h-screen pt-24 pb-12 px-4 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }

  if (!user) return null;

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Navigation */}
        <div className="flex items-center gap-4 bg-[var(--color-bg-elevated)] p-4 rounded-xl border border-[rgba(255,255,255,0.05)]">
          <Link href="/admin/users" className="w-10 h-10 rounded-full bg-[var(--color-bg-base)] flex items-center justify-center border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.1)] transition-colors">
            <ArrowLeft className="w-5 h-5 text-white" />
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white font-outfit">Hồ sơ 360° Khách hàng</h1>
            <p className="text-[var(--color-text-muted)] text-sm">Xem chi tiết toàn bộ lịch sử tương tác và giao dịch</p>
          </div>
          
          {user.role !== 'Admin' && (
            <button 
              onClick={handleToggleStatus}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                user.is_active 
                  ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20' 
                  : 'bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20'
              }`}
            >
              {user.is_active ? (
                <><Ban className="w-4 h-4" /> Khóa tài khoản</>
              ) : (
                <><UserCheck className="w-4 h-4" /> Mở khóa tài khoản</>
              )}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cột trái: Thông tin cá nhân & Ví */}
          <div className="space-y-6">
            {/* Box User Info */}
            <div className="glass-panel p-6 rounded-2xl border border-[rgba(255,255,255,0.05)] relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                {user.role === 'Admin' && (
                  <span className="flex items-center gap-1 text-xs font-semibold text-red-400 bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/20">
                    <Shield className="w-3 h-3" /> Admin
                  </span>
                )}
              </div>
              
              <div className="flex flex-col items-center text-center mt-4">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center text-white font-bold text-4xl shadow-xl mb-4 relative">
                  {user.username.charAt(0).toUpperCase()}
                  <div className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-2 border-[var(--color-bg-base)] ${user.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-1">{user.username}</h2>
                <div className="flex items-center gap-2 text-[var(--color-text-muted)] mb-4">
                  <Mail className="w-4 h-4" /> {user.email}
                </div>
                
                <div className="w-full h-px bg-[rgba(255,255,255,0.05)] my-4"></div>
                
                <div className="w-full space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--color-text-muted)] flex items-center gap-2"><Calendar className="w-4 h-4" /> Ngày tham gia</span>
                    <span className="text-white font-medium">{formatDate(user.created_at).split(' ')[0]}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--color-text-muted)] flex items-center gap-2"><Settings className="w-4 h-4" /> ID</span>
                    <span className="text-white font-mono text-xs truncate max-w-[150px]">{user.id}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Box Ví & Tài chính */}
            <div className="glass-panel p-6 rounded-2xl border border-[rgba(255,255,255,0.05)] bg-gradient-to-br from-[var(--color-bg-elevated)] to-[rgba(99,102,241,0.05)]">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-[var(--color-primary)]" /> Ví tiền & Tài chính
              </h3>
              
              <div className="p-4 bg-[var(--color-bg-base)] rounded-xl border border-[rgba(255,255,255,0.05)] mb-4 flex items-center justify-between">
                <span className="text-[var(--color-text-muted)]">Số dư hiện tại</span>
                <span className="text-2xl font-bold text-green-400">{formatCurrency(user.wallet?.balance || 0)}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-[rgba(255,255,255,0.02)] rounded-xl border border-[rgba(255,255,255,0.02)]">
                  <span className="block text-xs text-[var(--color-text-muted)] mb-1">Tổng chi tiêu</span>
                  <span className="text-lg font-bold text-white">{formatCurrency(user.stats.totalSpent)}</span>
                </div>
                <div className="p-4 bg-[rgba(255,255,255,0.02)] rounded-xl border border-[rgba(255,255,255,0.02)]">
                  <span className="block text-xs text-[var(--color-text-muted)] mb-1">Tổng thu nhập</span>
                  <span className="text-lg font-bold text-[var(--color-primary)]">{formatCurrency(user.stats.totalEarned)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cột phải: Tabs Hoạt động */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Lịch sử mua hàng */}
            <div className="glass-panel p-6 rounded-2xl border border-[rgba(255,255,255,0.05)]">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-pink-400" /> Lịch sử mua hàng (10 gần nhất)
              </h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs uppercase text-[var(--color-text-muted)] bg-[rgba(255,255,255,0.02)]">
                    <tr>
                      <th className="p-3 font-medium rounded-l-lg">Học liệu</th>
                      <th className="p-3 font-medium">Số tiền</th>
                      <th className="p-3 font-medium rounded-r-lg">Thời gian</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
                    {user.purchases.length > 0 ? user.purchases.map(p => (
                      <tr key={p.id}>
                        <td className="p-3 text-white max-w-[200px] truncate" title={p.material?.title}>{p.material?.title || 'Đã xóa'}</td>
                        <td className="p-3 text-red-400 font-medium">-{formatCurrency(p.amount)}</td>
                        <td className="p-3 text-[var(--color-text-muted)]">{formatDate(p.created_at)}</td>
                      </tr>
                    )) : (
                      <tr><td colSpan={3} className="p-4 text-center text-[var(--color-text-muted)] text-sm">Chưa có lượt mua nào</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tài liệu đã đăng & Bán hàng */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Lịch sử đăng bán */}
              <div className="glass-panel p-6 rounded-2xl border border-[rgba(255,255,255,0.05)]">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-400" /> Học liệu đã đăng
                </h3>
                <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-thin pr-2">
                  {user.materials.length > 0 ? user.materials.map(m => (
                    <div key={m.id} className="p-3 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-xl">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="text-white text-sm font-medium line-clamp-1 flex-1">{m.title}</h4>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ml-2 ${
                          m.status === 'Approved' ? 'bg-green-500/10 text-green-400' :
                          m.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-red-500/10 text-red-400'
                        }`}>{m.status}</span>
                      </div>
                      <div className="flex justify-between text-xs text-[var(--color-text-muted)]">
                        <span>{m.price === 0 ? 'Miễn phí' : formatCurrency(m.price)}</span>
                        <span>{formatDate(m.created_at).split(' ')[0]}</span>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center text-[var(--color-text-muted)] py-4 text-sm">Chưa đăng học liệu nào</div>
                  )}
                </div>
              </div>

              {/* Giao dịch bán */}
              <div className="glass-panel p-6 rounded-2xl border border-[rgba(255,255,255,0.05)]">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Store className="w-5 h-5 text-green-400" /> Lượt bán (10 gần nhất)
                </h3>
                <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-thin pr-2">
                  {user.sales.length > 0 ? user.sales.map(s => (
                    <div key={s.id} className="p-3 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-xl flex items-center justify-between">
                      <div className="flex-1 overflow-hidden pr-2">
                        <div className="text-white text-sm truncate">{s.material?.title || 'Đã xóa'}</div>
                        <div className="text-xs text-[var(--color-text-muted)] mt-1">{formatDate(s.created_at)}</div>
                      </div>
                      <div className="text-green-400 text-sm font-bold whitespace-nowrap">+{formatCurrency(s.amount)}</div>
                    </div>
                  )) : (
                    <div className="text-center text-[var(--color-text-muted)] py-4 text-sm">Chưa có lượt bán nào</div>
                  )}
                </div>
              </div>

            </div>

            {/* Lịch sử Tickets */}
            <div className="glass-panel p-6 rounded-2xl border border-[rgba(255,255,255,0.05)]">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-400" /> Yêu cầu hỗ trợ (Tickets)
              </h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs uppercase text-[var(--color-text-muted)] bg-[rgba(255,255,255,0.02)]">
                    <tr>
                      <th className="p-3 font-medium rounded-l-lg">Mã YC</th>
                      <th className="p-3 font-medium">Tiêu đề</th>
                      <th className="p-3 font-medium">Trạng thái</th>
                      <th className="p-3 font-medium rounded-r-lg text-right">Chi tiết</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
                    {user.tickets.length > 0 ? user.tickets.map(t => (
                      <tr key={t.id}>
                        <td className="p-3 text-[var(--color-text-muted)] font-mono text-xs">#{t.id.slice(0, 6)}</td>
                        <td className="p-3 text-white max-w-[200px] truncate">{t.subject}</td>
                        <td className="p-3">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                            t.status === 'Resolved' || t.status === 'Closed' ? 'bg-green-500/10 text-green-400' :
                            t.status === 'InProgress' ? 'bg-blue-500/10 text-blue-400' : 'bg-yellow-500/10 text-yellow-400'
                          }`}>{t.status}</span>
                        </td>
                        <td className="p-3 text-right">
                          <Link href={`/admin/tickets/${t.id}`} className="text-blue-400 hover:text-blue-300 hover:underline text-xs">Xem</Link>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan={4} className="p-4 text-center text-[var(--color-text-muted)] text-sm">Không có yêu cầu hỗ trợ nào</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
