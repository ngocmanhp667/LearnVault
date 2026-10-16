'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Search, Shield, User, UserX, UserCheck, MoreVertical, Ban, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface UserData {
  id: string;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
  _count: {
    materials: number;
    purchases: number;
  };
}

export default function AdminUsersPage() {
  const { isAuthenticated, isAdmin } = useAuthStore();
  const router = useRouter();
  
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!isAdmin) {
      router.push('/');
      return;
    }
    fetchUsers();
  }, [isAuthenticated, isAdmin, router, page, searchTerm]);

  const fetchUsers = async () => {
    try {
      const res = await api.get(`/admin/users?page=${page}&limit=10&keyword=${searchTerm}`);
      setUsers(res.data.data);
      setTotalPages(res.data.pagination.totalPages);
    } catch (error) {
      console.error('Lỗi tải danh sách người dùng:', error);
      toast.error('Không thể tải dữ liệu người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await api.put(`/admin/users/${userId}/toggle`);
      setUsers(users.map(u => u.id === userId ? { ...u, is_active: !currentStatus } : u));
      toast.success(currentStatus ? 'Đã khóa tài khoản thành công' : 'Đã mở khóa tài khoản thành công');
      setActionMenuOpen(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể thay đổi trạng thái tài khoản');
    }
  };

  if (loading && users.length === 0) {
    return <div className="min-h-screen pt-24 pb-12 px-4 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 font-outfit">Quản lý Khách hàng (User CRM)</h1>
            <p className="text-[var(--color-text-muted)]">Quản lý hồ sơ, trạng thái và hành vi của người dùng trên hệ thống</p>
          </div>
        </div>

        {/* Stats Mini */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-[rgba(255,255,255,0.05)] flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
              <User className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-[var(--color-text-muted)]">Tổng thành viên</p>
              <h3 className="text-2xl font-bold text-white">{users.length > 0 ? users.length + '+' : '---'}</h3>
            </div>
          </div>
          <div className="glass-panel p-6 rounded-2xl border border-[rgba(255,255,255,0.05)] flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-[var(--color-text-muted)]">Đang hoạt động</p>
              <h3 className="text-2xl font-bold text-white">{users.filter(u => u.is_active).length}</h3>
            </div>
          </div>
          <div className="glass-panel p-6 rounded-2xl border border-[rgba(255,255,255,0.05)] flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center text-red-400">
              <UserX className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-[var(--color-text-muted)]">Đã khóa</p>
              <h3 className="text-2xl font-bold text-white">{users.filter(u => !u.is_active).length}</h3>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="glass-panel p-4 rounded-xl flex flex-col md:flex-row gap-4 border border-[rgba(255,255,255,0.05)]">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên đăng nhập hoặc email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full bg-[var(--color-bg-elevated)] border border-[rgba(255,255,255,0.1)] rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="glass-panel rounded-2xl overflow-hidden border border-[rgba(255,255,255,0.05)] relative min-h-[400px]">
          {loading && (
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm z-10 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--color-bg-elevated)] border-b border-[rgba(255,255,255,0.05)] text-[var(--color-text-muted)] text-sm uppercase tracking-wider">
                  <th className="p-4 font-medium">Khách hàng</th>
                  <th className="p-4 font-medium">Vai trò</th>
                  <th className="p-4 font-medium text-center">Tài liệu (Đăng / Mua)</th>
                  <th className="p-4 font-medium">Ngày tham gia</th>
                  <th className="p-4 font-medium">Trạng thái</th>
                  <th className="p-4 font-medium text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
                {users.length > 0 ? (
                  users.map(u => (
                    <tr key={u.id} className="hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                      <td className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shrink-0">
                          {u.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-white font-medium">{u.username}</div>
                          <div className="text-xs text-[var(--color-text-muted)]">{u.email}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        {u.role === 'Admin' ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-400 bg-red-500/10 px-2 py-1 rounded border border-red-500/20">
                            <Shield className="w-3 h-3" /> Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-400 bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20">
                            <User className="w-3 h-3" /> User
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-4">
                          <div className="flex flex-col items-center">
                            <span className="text-white font-bold">{u._count.materials}</span>
                            <span className="text-[10px] text-[var(--color-text-muted)] uppercase">Đăng</span>
                          </div>
                          <div className="w-px h-6 bg-[rgba(255,255,255,0.1)]"></div>
                          <div className="flex flex-col items-center">
                            <span className="text-white font-bold">{u._count.purchases}</span>
                            <span className="text-[10px] text-[var(--color-text-muted)] uppercase">Mua</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-[var(--color-text-muted)]">{formatDate(u.created_at).split(' ')[0]}</td>
                      <td className="p-4">
                        {u.is_active ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-green-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span> Hoạt động
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-red-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span> Bị khóa
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right relative">
                        <button 
                          onClick={() => setActionMenuOpen(actionMenuOpen === u.id ? null : u.id)}
                          className="p-2 text-[var(--color-text-muted)] hover:text-white hover:bg-[rgba(255,255,255,0.1)] rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        
                        {actionMenuOpen === u.id && (
                          <div className="absolute right-8 top-12 z-20 w-48 bg-[var(--color-bg-elevated)] border border-[rgba(255,255,255,0.1)] rounded-xl shadow-2xl py-1 animate-slide-up">
                            <Link 
                              href={`/admin/users/${u.id}`}
                              className="flex items-center gap-2 px-4 py-2.5 text-sm text-white hover:bg-[rgba(255,255,255,0.05)] w-full text-left transition-colors"
                            >
                              <Activity className="w-4 h-4 text-blue-400" /> Hồ sơ 360°
                            </Link>
                            
                            {u.role !== 'Admin' && (
                              <button 
                                onClick={() => handleToggleStatus(u.id, u.is_active)}
                                className="flex items-center gap-2 px-4 py-2.5 text-sm text-white hover:bg-[rgba(255,255,255,0.05)] w-full text-left transition-colors border-t border-[rgba(255,255,255,0.05)]"
                              >
                                {u.is_active ? (
                                  <><Ban className="w-4 h-4 text-red-400" /> Khóa tài khoản</>
                                ) : (
                                  <><UserCheck className="w-4 h-4 text-green-400" /> Mở khóa tài khoản</>
                                )}
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-[var(--color-text-muted)]">
                      Không tìm thấy người dùng nào phù hợp
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-[rgba(255,255,255,0.05)] flex items-center justify-between">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-lg bg-[var(--color-bg-elevated)] text-white text-sm disabled:opacity-50 hover:bg-[rgba(255,255,255,0.1)] transition-colors"
              >
                Trang trước
              </button>
              <span className="text-sm text-[var(--color-text-muted)]">Trang {page} / {totalPages}</span>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-lg bg-[var(--color-bg-elevated)] text-white text-sm disabled:opacity-50 hover:bg-[rgba(255,255,255,0.1)] transition-colors"
              >
                Trang tiếp
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
