'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api';
import { Users, FileText, Activity, CreditCard, Ban, CheckCircle, Search } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function AdminDashboardPage() {
  const { user, isLoggedIn } = useAuthStore();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'materials'>('overview');
  const [stats, setStats] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [materialsList, setMaterialsList] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Bảo vệ Route
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    if (user?.role !== 'Admin') {
      toast.error('Bạn không có quyền truy cập trang này');
      router.push('/');
      return;
    }

    const fetchAdminData = async () => {
      setLoading(true);
      try {
        if (activeTab === 'overview') {
          const [statsRes, revenueRes] = await Promise.all([
            api.get('/admin/stats'),
            api.get('/admin/revenue')
          ]);
          setStats(statsRes.data.data);
          
          // Format revenue data for chart
          const rawRevenue = revenueRes.data.data;
          // Sort by date just in case
          rawRevenue.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
          // Take last 30 days or format
          const formattedRevenue = rawRevenue.map((item: any) => ({
            name: formatDate(item.date).substring(0, 5), // Only show DD/MM
            total: item.total
          }));
          setRevenueData(formattedRevenue);
        } else if (activeTab === 'users') {
          const res = await api.get('/admin/users');
          setUsersList(res.data.data);
        } else if (activeTab === 'materials') {
          const res = await api.get('/admin/materials');
          setMaterialsList(res.data.data);
        }
      } catch (error) {
        toast.error('Lỗi tải dữ liệu quản trị');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [activeTab, isLoggedIn, user, router]);

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      // Gọi API cập nhật trạng thái
      await api.put(`/admin/users/${userId}/toggle-status`);
      
      // Mock UI update
      setUsersList(prev => prev.map(u => u.id === userId ? { ...u, is_active: !currentStatus } : u));
      toast.success(currentStatus ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản');
    } catch (error) {
      toast.error('Không thể thay đổi trạng thái');
    }
  };

  const handleUpdateMaterialStatus = async (materialId: string, status: string) => {
    try {
      await api.put(`/admin/materials/${materialId}/status`, { status });
      setMaterialsList(prev => prev.map(m => m.id === materialId ? { ...m, status } : m));
      toast.success(`Đã cập nhật trạng thái thành ${status}`);
    } catch (error) {
      toast.error('Không thể cập nhật trạng thái');
    }
  };

  if (!isLoggedIn || user?.role !== 'Admin') return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Trung tâm Quản trị</h1>
          <p className="text-[var(--color-text-muted)]">Chào mừng Admin {user.username}, hệ thống đang hoạt động tốt.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Sidebar Nav */}
        <div className="lg:col-span-1">
          <div className="glass-panel p-3 rounded-2xl border border-[rgba(255,255,255,0.05)] sticky top-24 space-y-1">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'overview' ? 'bg-[var(--color-primary)] text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'text-[var(--color-text-muted)] hover:text-white hover:bg-[var(--color-bg-elevated)]'}`}
            >
              <Activity className="w-5 h-5" /> Tổng quan
            </button>
            <button 
              onClick={() => router.push('/admin/tickets')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors text-[var(--color-text-muted)] hover:text-white hover:bg-[var(--color-bg-elevated)]"
            >
              <Activity className="w-5 h-5" /> Hỗ trợ & Khiếu nại
            </button>
            <button 
              onClick={() => router.push('/admin/users')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors text-[var(--color-text-muted)] hover:text-white hover:bg-[var(--color-bg-elevated)]"
            >
              <Users className="w-5 h-5" /> Người dùng
            </button>
            <button 
              onClick={() => router.push('/admin/transactions')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors text-[var(--color-text-muted)] hover:text-white hover:bg-[var(--color-bg-elevated)]"
            >
              <CreditCard className="w-5 h-5" /> Giao dịch
            </button>
            <button 
              onClick={() => router.push('/admin/broadcast')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors text-[var(--color-text-muted)] hover:text-white hover:bg-[var(--color-bg-elevated)]"
            >
              <Activity className="w-5 h-5" /> Chiến dịch
            </button>
            <button 
              onClick={() => setActiveTab('materials')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'materials' ? 'bg-[var(--color-primary)] text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'text-[var(--color-text-muted)] hover:text-white hover:bg-[var(--color-bg-elevated)]'}`}
            >
              <FileText className="w-5 h-5" /> Học liệu
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-4 space-y-6">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--color-primary)]"></div>
            </div>
          ) : (
            <>
              {/* TAB: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-6 animate-slide-up">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glass-panel p-6 rounded-2xl border border-[rgba(255,255,255,0.05)]">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[var(--color-text-muted)] font-medium">Tổng người dùng</h3>
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
                          <Users className="w-5 h-5" />
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-white">{stats?.totals?.users || 0}</div>
                      <div className="text-sm text-green-400 mt-2">+{stats?.recentActivity?.newUsersLast7Days || 0} trong 7 ngày qua</div>
                    </div>

                    <div className="glass-panel p-6 rounded-2xl border border-[rgba(255,255,255,0.05)]">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[var(--color-text-muted)] font-medium">Tổng học liệu</h3>
                        <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center">
                          <FileText className="w-5 h-5" />
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-white">{stats?.totals?.materials || 0}</div>
                      <div className="text-sm text-green-400 mt-2">+{stats?.recentActivity?.newMaterialsLast7Days || 0} trong 7 ngày qua</div>
                    </div>

                    <div className="glass-panel p-6 rounded-2xl border border-[rgba(255,255,255,0.05)]">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[var(--color-text-muted)] font-medium">Doanh thu sàn</h3>
                        <div className="w-10 h-10 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center">
                          <CreditCard className="w-5 h-5" />
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-white">{formatCurrency(stats?.totals?.revenue || 0)}</div>
                      <div className="text-sm text-[var(--color-text-muted)] mt-2">{stats?.totals?.transactions || 0} giao dịch</div>
                    </div>
                  </div>
                  
                  <div className="glass-panel p-6 rounded-2xl border border-[rgba(255,255,255,0.05)]">
                    <h3 className="text-xl font-semibold text-white mb-6">Biểu đồ doanh thu</h3>
                    <div className="h-72 w-full">
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
                        <div className="w-full h-full flex items-center justify-center text-[var(--color-text-muted)] border border-dashed border-[rgba(255,255,255,0.1)] rounded-xl bg-[var(--color-bg-base)]">
                          Chưa có dữ liệu doanh thu
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: USERS */}
              {activeTab === 'users' && (
                <div className="glass-panel rounded-2xl border border-[rgba(255,255,255,0.05)] overflow-hidden animate-slide-up">
                  <div className="p-6 border-b border-[rgba(255,255,255,0.05)] flex justify-between items-center bg-[var(--color-bg-elevated)]/30">
                    <h3 className="text-xl font-semibold text-white">Quản lý Người dùng</h3>
                    <div className="relative">
                      <Search className="w-4 h-4 text-[var(--color-text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input 
                        type="text" 
                        placeholder="Tìm username, email..." 
                        className="bg-[var(--color-bg-base)] border border-[rgba(255,255,255,0.1)] rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[var(--color-primary)] w-64"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-[var(--color-text-muted)]">
                      <thead className="text-xs uppercase bg-[var(--color-bg-base)] text-[var(--color-text-muted)]">
                        <tr>
                          <th className="px-6 py-4 font-medium border-b border-[rgba(255,255,255,0.05)]">Username</th>
                          <th className="px-6 py-4 font-medium border-b border-[rgba(255,255,255,0.05)]">Email</th>
                          <th className="px-6 py-4 font-medium border-b border-[rgba(255,255,255,0.05)]">Ngày tham gia</th>
                          <th className="px-6 py-4 font-medium border-b border-[rgba(255,255,255,0.05)]">Trạng thái</th>
                          <th className="px-6 py-4 font-medium border-b border-[rgba(255,255,255,0.05)] text-right">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usersList
                          .filter(u => u.username.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()))
                          .map((user) => (
                          <tr key={user.id} className="border-b border-[rgba(255,255,255,0.05)] hover:bg-[var(--color-bg-elevated)]/50 transition-colors">
                            <td className="px-6 py-4 font-medium text-white">{user.username}</td>
                            <td className="px-6 py-4">{user.email}</td>
                            <td className="px-6 py-4">{formatDate(user.created_at)}</td>
                            <td className="px-6 py-4">
                              {user.is_active !== false ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400">
                                  <CheckCircle className="w-3 h-3" /> Hoạt động
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400">
                                  <Ban className="w-3 h-3" /> Đã khóa
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              {user.role !== 'Admin' && (
                                <button 
                                  onClick={() => handleToggleUserStatus(user.id, user.is_active !== false)}
                                  className={`text-sm font-medium hover:underline ${user.is_active !== false ? 'text-red-400 hover:text-red-300' : 'text-green-400 hover:text-green-300'}`}
                                >
                                  {user.is_active !== false ? 'Khóa tài khoản' : 'Mở khóa'}
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                        {usersList.length === 0 && (
                          <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-[var(--color-text-muted)]">
                              Không có dữ liệu người dùng
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB: MATERIALS */}
              {activeTab === 'materials' && (
                <div className="glass-panel rounded-2xl border border-[rgba(255,255,255,0.05)] overflow-hidden animate-slide-up">
                  <div className="p-6 border-b border-[rgba(255,255,255,0.05)] flex justify-between items-center bg-[var(--color-bg-elevated)]/30">
                    <h3 className="text-xl font-semibold text-white">Quản lý Học liệu</h3>
                    <div className="relative">
                      <Search className="w-4 h-4 text-[var(--color-text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input 
                        type="text" 
                        placeholder="Tìm tiêu đề..." 
                        className="bg-[var(--color-bg-base)] border border-[rgba(255,255,255,0.1)] rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[var(--color-primary)] w-64"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-[var(--color-text-muted)]">
                      <thead className="text-xs uppercase bg-[var(--color-bg-base)] text-[var(--color-text-muted)]">
                        <tr>
                          <th className="px-6 py-4 font-medium border-b border-[rgba(255,255,255,0.05)]">Tiêu đề</th>
                          <th className="px-6 py-4 font-medium border-b border-[rgba(255,255,255,0.05)]">Người đăng</th>
                          <th className="px-6 py-4 font-medium border-b border-[rgba(255,255,255,0.05)]">Giá</th>
                          <th className="px-6 py-4 font-medium border-b border-[rgba(255,255,255,0.05)]">Trạng thái</th>
                          <th className="px-6 py-4 font-medium border-b border-[rgba(255,255,255,0.05)] text-right">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {materialsList
                          .filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase()))
                          .map((material) => (
                          <tr key={material.id} className="border-b border-[rgba(255,255,255,0.05)] hover:bg-[var(--color-bg-elevated)]/50 transition-colors">
                            <td className="px-6 py-4 font-medium text-white">
                              <span className="line-clamp-1">{material.title}</span>
                            </td>
                            <td className="px-6 py-4">{material.provider?.username}</td>
                            <td className="px-6 py-4">{formatCurrency(material.price)}</td>
                            <td className="px-6 py-4">
                              {material.status === 'Approved' && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400">
                                  <CheckCircle className="w-3 h-3" /> Đã duyệt
                                </span>
                              )}
                              {material.status === 'Pending' && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400">
                                  <Activity className="w-3 h-3" /> Chờ duyệt
                                </span>
                              )}
                              {material.status === 'Rejected' && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400">
                                  <Ban className="w-3 h-3" /> Đã từ chối
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right space-x-3">
                              {material.status !== 'Approved' && (
                                <button 
                                  onClick={() => handleUpdateMaterialStatus(material.id, 'Approved')}
                                  className="text-sm font-medium text-green-400 hover:text-green-300 hover:underline"
                                >
                                  Duyệt
                                </button>
                              )}
                              {material.status !== 'Rejected' && (
                                <button 
                                  onClick={() => handleUpdateMaterialStatus(material.id, 'Rejected')}
                                  className="text-sm font-medium text-red-400 hover:text-red-300 hover:underline"
                                >
                                  Từ chối
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                        {materialsList.length === 0 && (
                          <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-[var(--color-text-muted)]">
                              Không có dữ liệu học liệu
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </>
          )}
        </div>
      </div>
    </div>
  );
}
