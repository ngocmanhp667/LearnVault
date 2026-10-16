'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { ArrowLeft, Send, Users, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function BroadcastPage() {
  const { isAuthenticated, isAdmin } = useAuthStore();
  const router = useRouter();
  
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [segment, setSegment] = useState('All');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!isAdmin) {
      router.push('/');
      return;
    }
  }, [isAuthenticated, isAdmin, router]);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast.error('Vui lòng nhập đầy đủ tiêu đề và nội dung');
      return;
    }

    if (!confirm('Hành động này sẽ gửi thông báo đến rất nhiều người. Bạn có chắc chắn?')) return;

    setLoading(true);
    try {
      const res = await api.post('/admin/broadcast', { title, message, segment });
      toast.success(res.data.message || 'Gửi thông báo thành công!');
      setTitle('');
      setMessage('');
      setSegment('All');
    } catch (error: any) {
      console.error('Lỗi gửi thông báo:', error);
      toast.error(error.response?.data?.message || 'Không thể gửi thông báo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Navigation */}
        <div className="flex items-center gap-4 bg-[var(--color-bg-elevated)] p-4 rounded-xl border border-[rgba(255,255,255,0.05)]">
          <Link href="/admin" className="w-10 h-10 rounded-full bg-[var(--color-bg-base)] flex items-center justify-center border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.1)] transition-colors">
            <ArrowLeft className="w-5 h-5 text-white" />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white font-outfit">Chiến dịch & Thông báo</h1>
            <p className="text-[var(--color-text-muted)] text-sm">Gửi thông báo đẩy hàng loạt tới khách hàng (Broadcast)</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <form onSubmit={handleBroadcast} className="glass-panel p-6 rounded-2xl border border-[rgba(255,255,255,0.05)] space-y-6">
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-[var(--color-primary)]" /> Đối tượng nhận
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setSegment('All')}
                    className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                      segment === 'All' 
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-white' 
                        : 'border-[rgba(255,255,255,0.1)] text-[var(--color-text-muted)] hover:border-[rgba(255,255,255,0.2)]'
                    }`}
                  >
                    Tất cả Users
                  </button>
                  <button
                    type="button"
                    onClick={() => setSegment('Active')}
                    className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                      segment === 'Active' 
                        ? 'border-green-500 bg-green-500/10 text-white' 
                        : 'border-[rgba(255,255,255,0.1)] text-[var(--color-text-muted)] hover:border-[rgba(255,255,255,0.2)]'
                    }`}
                  >
                    Đang hoạt động
                  </button>
                  <button
                    type="button"
                    onClick={() => setSegment('Inactive')}
                    className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                      segment === 'Inactive' 
                        ? 'border-red-500 bg-red-500/10 text-white' 
                        : 'border-[rgba(255,255,255,0.1)] text-[var(--color-text-muted)] hover:border-[rgba(255,255,255,0.2)]'
                    }`}
                  >
                    Bị khóa
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Tiêu đề thông báo</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Giảm giá 50% tất cả tài liệu môn Toán!"
                  className="w-full bg-[var(--color-bg-base)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Nội dung</label>
                <textarea 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Nhập nội dung chi tiết của chiến dịch hoặc thông báo..."
                  className="w-full bg-[var(--color-bg-base)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors min-h-[150px] resize-none"
                  required
                />
              </div>

              <div className="pt-2">
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white font-medium px-6 py-3.5 rounded-xl hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <><Send className="w-5 h-5" /> Gửi Thông Báo Hàng Loạt</>
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-6">
            <div className="glass-panel p-6 rounded-2xl border border-[rgba(255,255,255,0.05)] bg-[var(--color-bg-elevated)]">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-400" /> Lưu ý quan trọng
              </h3>
              <ul className="space-y-3 text-sm text-[var(--color-text-muted)] list-disc pl-4">
                <li>Thông báo sẽ được gửi trực tiếp vào <strong>Hộp thư (In-app Notification)</strong> của tất cả người dùng trong phân khúc đã chọn.</li>
                <li>Không nên gửi quá nhiều lần trong ngày để tránh làm phiền người dùng.</li>
                <li>Bạn không thể thu hồi thông báo sau khi đã ấn Gửi.</li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
