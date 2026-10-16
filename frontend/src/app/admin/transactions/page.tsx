'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { formatDate, formatCurrency } from '@/lib/utils';
import { ArrowLeft, Search, Filter, RefreshCcw, CheckCircle, XCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface Transaction {
  id: string;
  amount: number;
  status: string; // 'Pending' | 'Completed' | 'Failed' | 'Refunded'
  created_at: string;
  buyer: { id: string, username: string, email: string };
  seller: { id: string, username: string, email: string };
  material: { id: string, title: string, price: number };
}

export default function AdminTransactionsPage() {
  const { isAuthenticated, isAdmin } = useAuthStore();
  const router = useRouter();
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refundingId, setRefundingId] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!isAdmin) {
      router.push('/');
      return;
    }
    fetchTransactions();
  }, [isAuthenticated, isAdmin, router, page, statusFilter]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/transactions?page=${page}&limit=15${statusFilter ? `&status=${statusFilter}` : ''}`);
      setTransactions(res.data.data);
      setTotalPages(res.data.pagination.totalPages);
    } catch (error) {
      console.error('Lỗi lấy danh sách giao dịch:', error);
      toast.error('Không thể tải dữ liệu giao dịch');
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn hoàn tiền cho giao dịch này? Số tiền sẽ được trả lại cho người mua và trừ đi từ người bán.')) {
      return;
    }
    
    setRefundingId(id);
    try {
      await api.post(`/admin/transactions/${id}/refund`);
      toast.success('Hoàn tiền thành công');
      fetchTransactions(); // Refresh
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể hoàn tiền');
    } finally {
      setRefundingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Completed': return <span className="inline-flex items-center gap-1 text-xs font-medium bg-green-500/10 text-green-400 px-2 py-1 rounded-md"><CheckCircle className="w-3 h-3"/> Hoàn thành</span>;
      case 'Refunded': return <span className="inline-flex items-center gap-1 text-xs font-medium bg-purple-500/10 text-purple-400 px-2 py-1 rounded-md"><RefreshCcw className="w-3 h-3"/> Đã hoàn tiền</span>;
      case 'Pending': return <span className="inline-flex items-center gap-1 text-xs font-medium bg-yellow-500/10 text-yellow-400 px-2 py-1 rounded-md"><Clock className="w-3 h-3"/> Chờ xử lý</span>;
      case 'Failed':
      case 'Cancelled': return <span className="inline-flex items-center gap-1 text-xs font-medium bg-red-500/10 text-red-400 px-2 py-1 rounded-md"><XCircle className="w-3 h-3"/> Thất bại</span>;
      default: return <span className="text-[var(--color-text-muted)] text-xs">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Navigation */}
        <div className="flex items-center gap-4 bg-[var(--color-bg-elevated)] p-4 rounded-xl border border-[rgba(255,255,255,0.05)]">
          <Link href="/admin" className="w-10 h-10 rounded-full bg-[var(--color-bg-base)] flex items-center justify-center border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.1)] transition-colors">
            <ArrowLeft className="w-5 h-5 text-white" />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white font-outfit">Quản lý Giao dịch & Hoàn tiền</h1>
            <p className="text-[var(--color-text-muted)] text-sm">Theo dõi dòng tiền và giải quyết khiếu nại</p>
          </div>
        </div>

        {/* Filters */}
        <div className="glass-panel p-4 rounded-xl flex gap-4 border border-[rgba(255,255,255,0.05)]">
          <div className="relative w-64">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
            <select 
              className="w-full bg-[var(--color-bg-elevated)] border border-[rgba(255,255,255,0.1)] rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-[var(--color-primary)] appearance-none text-sm"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="Completed">Đã hoàn thành</option>
              <option value="Refunded">Đã hoàn tiền</option>
              <option value="Pending">Chờ xử lý</option>
              <option value="Cancelled">Đã hủy</option>
            </select>
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
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[var(--color-bg-elevated)] border-b border-[rgba(255,255,255,0.05)] text-[var(--color-text-muted)] text-xs uppercase tracking-wider">
                  <th className="p-4 font-medium">Mã GD</th>
                  <th className="p-4 font-medium">Học liệu</th>
                  <th className="p-4 font-medium">Người mua</th>
                  <th className="p-4 font-medium">Người bán</th>
                  <th className="p-4 font-medium">Số tiền</th>
                  <th className="p-4 font-medium">Thời gian</th>
                  <th className="p-4 font-medium">Trạng thái</th>
                  <th className="p-4 font-medium text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
                {transactions.length > 0 ? (
                  transactions.map(t => (
                    <tr key={t.id} className="hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                      <td className="p-4 text-[var(--color-text-muted)] font-mono text-xs">#{t.id.slice(0,8)}</td>
                      <td className="p-4 text-white max-w-[150px] truncate" title={t.material?.title}>{t.material?.title || 'N/A'}</td>
                      <td className="p-4">
                        <Link href={`/admin/users/${t.buyer?.id}`} className="text-white hover:text-[var(--color-primary)] font-medium">
                          {t.buyer?.username}
                        </Link>
                      </td>
                      <td className="p-4">
                        <Link href={`/admin/users/${t.seller?.id}`} className="text-white hover:text-[var(--color-primary)] font-medium">
                          {t.seller?.username}
                        </Link>
                      </td>
                      <td className="p-4 font-bold text-white">{formatCurrency(t.amount)}</td>
                      <td className="p-4 text-[var(--color-text-muted)]">{formatDate(t.created_at)}</td>
                      <td className="p-4">{getStatusBadge(t.status)}</td>
                      <td className="p-4 text-right">
                        {t.status === 'Completed' && (
                          <button 
                            onClick={() => handleRefund(t.id)}
                            disabled={refundingId === t.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors text-xs font-medium border border-red-500/20 disabled:opacity-50"
                          >
                            <RefreshCcw className={`w-3.5 h-3.5 ${refundingId === t.id ? 'animate-spin' : ''}`} /> Hoàn tiền
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-[var(--color-text-muted)]">
                      Không tìm thấy giao dịch nào
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
