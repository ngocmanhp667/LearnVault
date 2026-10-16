'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { PlusCircle, Search, MessageSquare, Clock, CheckCircle, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface Ticket {
  id: string;
  subject: string;
  status: 'Open' | 'InProgress' | 'Resolved' | 'Closed';
  updated_at: string;
}

export default function SupportPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // Form state
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchTickets();
  }, [isAuthenticated, router]);

  const fetchTickets = async () => {
    try {
      const res = await api.get('/tickets/my-tickets');
      setTickets(res.data.data);
    } catch (error) {
      console.error('Lỗi lấy danh sách ticket:', error);
      toast.error('Không thể tải lịch sử hỗ trợ');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      toast.error('Vui lòng nhập đầy đủ tiêu đề và nội dung');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/tickets', { subject, description });
      toast.success('Gửi yêu cầu hỗ trợ thành công');
      setShowModal(false);
      setSubject('');
      setDescription('');
      fetchTickets();
    } catch (error) {
      toast.error('Có lỗi xảy ra khi gửi yêu cầu');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Open':
        return <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-medium border border-yellow-500/30 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Chờ xử lý</span>;
      case 'InProgress':
        return <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium border border-blue-500/30 flex items-center gap-1.5"><HelpCircle className="w-3.5 h-3.5" /> Đang xử lý</span>;
      case 'Resolved':
      case 'Closed':
        return <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium border border-green-500/30 flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" /> Đã giải quyết</span>;
      default:
        return <span className="px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs font-medium border border-gray-500/30">{status}</span>;
    }
  };

  if (loading) {
    return <div className="min-h-screen pt-24 pb-12 px-4 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 font-outfit">Trung tâm hỗ trợ</h1>
            <p className="text-[var(--color-text-muted)]">Gửi yêu cầu và theo dõi tiến trình hỗ trợ từ EduMarket</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <PlusCircle className="w-5 h-5" />
            Tạo yêu cầu mới
          </button>
        </div>

        {/* Tickets List */}
        <div className="glass-panel p-6 rounded-2xl">
          {tickets.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-[var(--color-bg-elevated)] rounded-full flex items-center justify-center mx-auto mb-4 border border-[rgba(255,255,255,0.05)]">
                <MessageSquare className="w-8 h-8 text-[var(--color-text-muted)]" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Bạn chưa có yêu cầu hỗ trợ nào</h3>
              <p className="text-[var(--color-text-muted)] mb-6">Nếu bạn gặp vấn đề với giao dịch hoặc tài khoản, hãy gửi yêu cầu cho chúng tôi.</p>
              <button 
                onClick={() => setShowModal(true)}
                className="btn-secondary"
              >
                Gửi yêu cầu đầu tiên
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map(ticket => (
                <Link 
                  href={`/support/${ticket.id}`} 
                  key={ticket.id}
                  className="block glass-panel-hover p-5 rounded-xl border border-[rgba(255,255,255,0.05)] transition-all duration-300"
                >
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-medium text-[var(--color-text-muted)]">#{ticket.id.slice(0, 8)}</span>
                        {getStatusBadge(ticket.status)}
                      </div>
                      <h3 className="text-lg font-semibold text-white group-hover:text-[var(--color-primary)] transition-colors">{ticket.subject}</h3>
                    </div>
                    <div className="text-sm text-[var(--color-text-muted)] sm:text-right">
                      <p>Cập nhật lần cuối</p>
                      <p className="font-medium text-white">{formatDate(ticket.updated_at)}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Create Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <div className="bg-[var(--color-bg-base)] w-full max-w-lg rounded-2xl border border-[rgba(255,255,255,0.1)] shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-[rgba(255,255,255,0.05)] flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Gửi Yêu Cầu Hỗ Trợ</h2>
                <button onClick={() => setShowModal(false)} className="text-[var(--color-text-muted)] hover:text-white">✕</button>
              </div>
              <form onSubmit={handleCreateTicket} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1.5">Chủ đề cần hỗ trợ</label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-[var(--color-bg-elevated)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-primary)]"
                    placeholder="Ví dụ: Lỗi nạp tiền qua VNPay..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1.5">Mô tả chi tiết vấn đề</label>
                  <textarea
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={5}
                    className="w-full bg-[var(--color-bg-elevated)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-primary)] resize-none"
                    placeholder="Vui lòng cung cấp mã giao dịch hoặc email nếu có để chúng tôi xử lý nhanh nhất..."
                  />
                </div>
                <div className="flex gap-3 justify-end pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Hủy</button>
                  <button type="submit" disabled={submitting} className="btn-primary">
                    {submitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
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
