'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Search, Filter, Clock, CheckCircle, HelpCircle, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface Ticket {
  id: string;
  subject: string;
  status: 'Open' | 'InProgress' | 'Resolved' | 'Closed';
  category?: string;
  updated_at: string;
  user: {
    username: string;
    email: string;
  };
}

export default function AdminTicketsPage() {
  const { user, isAuthenticated, isAdmin } = useAuthStore();
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!isAdmin) {
      router.push('/');
      return;
    }
    fetchTickets();
  }, [isAuthenticated, isAdmin, router]);

  const fetchTickets = async () => {
    try {
      const res = await api.get('/tickets'); // The admin endpoint returns all tickets
      setTickets(res.data.data);
    } catch (error) {
      console.error('Lỗi lấy danh sách ticket admin:', error);
      toast.error('Không thể tải danh sách khiếu nại/hỗ trợ');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Open':
        return <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-medium border border-yellow-500/30 flex items-center gap-1.5 w-fit"><Clock className="w-3.5 h-3.5" /> Chờ xử lý</span>;
      case 'InProgress':
        return <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium border border-blue-500/30 flex items-center gap-1.5 w-fit"><HelpCircle className="w-3.5 h-3.5" /> Đang giải quyết</span>;
      case 'Resolved':
      case 'Closed':
        return <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium border border-green-500/30 flex items-center gap-1.5 w-fit"><CheckCircle className="w-3.5 h-3.5" /> Đã đóng</span>;
      default:
        return <span className="px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs font-medium border border-gray-500/30 w-fit">{status}</span>;
    }
  };

  const filteredTickets = tickets.filter(t => {
    const matchSearch = t.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        t.user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        t.id.includes(searchTerm);
    const matchStatus = statusFilter === 'All' ? true : t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loading) {
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
            <h1 className="text-3xl font-bold text-white mb-2 font-outfit">Quản lý Yêu cầu hỗ trợ (CRM)</h1>
            <p className="text-[var(--color-text-muted)]">Tiếp nhận và xử lý các vấn đề từ khách hàng</p>
          </div>
        </div>

        {/* Filters */}
        <div className="glass-panel p-4 rounded-xl flex flex-col md:flex-row gap-4 border border-[rgba(255,255,255,0.05)]">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
            <input
              type="text"
              placeholder="Tìm theo mã YC, tiêu đề hoặc username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[var(--color-bg-elevated)] border border-[rgba(255,255,255,0.1)] rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>
          <div className="relative w-full md:w-48">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-[var(--color-bg-elevated)] border border-[rgba(255,255,255,0.1)] rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-[var(--color-primary)] appearance-none"
            >
              <option value="All">Tất cả trạng thái</option>
              <option value="Open">Chờ xử lý</option>
              <option value="InProgress">Đang giải quyết</option>
              <option value="Resolved">Đã đóng</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="glass-panel rounded-2xl overflow-hidden border border-[rgba(255,255,255,0.05)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--color-bg-elevated)] border-b border-[rgba(255,255,255,0.05)] text-[var(--color-text-muted)] text-sm uppercase tracking-wider">
                  <th className="p-4 font-medium">Mã YC</th>
                  <th className="p-4 font-medium">Người gửi</th>
                  <th className="p-4 font-medium">Phân loại (AI)</th>
                  <th className="p-4 font-medium">Tiêu đề</th>
                  <th className="p-4 font-medium">Trạng thái</th>
                  <th className="p-4 font-medium">Cập nhật</th>
                  <th className="p-4 font-medium text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
                {filteredTickets.length > 0 ? (
                  filteredTickets.map(ticket => (
                    <tr key={ticket.id} className="hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                      <td className="p-4 text-sm font-medium text-[var(--color-text-muted)]">#{ticket.id.slice(0, 8)}</td>
                      <td className="p-4">
                        <div className="text-white font-medium">{ticket.user.username}</div>
                        <div className="text-xs text-[var(--color-text-muted)]">{ticket.user.email}</div>
                      </td>
                      <td className="p-4 text-purple-400 text-xs font-semibold uppercase">{ticket.category || 'Khác'}</td>
                      <td className="p-4 text-white font-medium max-w-xs truncate">{ticket.subject}</td>
                      <td className="p-4">{getStatusBadge(ticket.status)}</td>
                      <td className="p-4 text-sm text-[var(--color-text-muted)]">{formatDate(ticket.updated_at)}</td>
                      <td className="p-4 text-right">
                        <Link 
                          href={`/admin/tickets/${ticket.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white rounded-lg transition-colors text-sm font-medium"
                        >
                          <Eye className="w-4 h-4" /> Xem
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-[var(--color-text-muted)]">
                      Không tìm thấy yêu cầu hỗ trợ nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
