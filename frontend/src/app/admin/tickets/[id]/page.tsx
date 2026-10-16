'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, Send, User, ShieldCheck, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface TicketMessage {
  id: string;
  message: string;
  created_at: string;
  sender: {
    username: string;
    role: string;
  };
}

interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: 'Open' | 'InProgress' | 'Resolved' | 'Closed';
  category?: string;
  ai_suggested_reply?: string;
  created_at: string;
  user: {
    username: string;
    email: string;
  };
  messages: TicketMessage[];
}

export default function AdminTicketDetailPage() {
  const { isAuthenticated, user, isAdmin } = useAuthStore();
  const router = useRouter();
  const params = useParams();
  
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  
  // Status update
  const [status, setStatus] = useState<'Open' | 'InProgress' | 'Resolved' | 'Closed'>('Open');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!isAdmin) {
      router.push('/');
      return;
    }
    fetchTicket();
  }, [isAuthenticated, isAdmin, router, params.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ticket?.messages]);

  const fetchTicket = async () => {
    try {
      const res = await api.get(`/tickets/${params.id}`);
      setTicket(res.data.data);
      setStatus(res.data.data.status);
    } catch (error) {
      console.error('Lỗi lấy chi tiết ticket admin:', error);
      toast.error('Không tìm thấy yêu cầu hỗ trợ');
      router.push('/admin/tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!ticket || status === ticket.status) return;
    
    setUpdatingStatus(true);
    try {
      await api.put(`/tickets/${ticket.id}/status`, { status });
      setTicket({ ...ticket, status });
      toast.success('Cập nhật trạng thái thành công');
    } catch (error) {
      toast.error('Không thể cập nhật trạng thái');
      setStatus(ticket.status); // Reset on failure
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !ticket) return;

    setSending(true);
    try {
      const res = await api.post(`/tickets/${ticket.id}/messages`, { message: newMessage });
      
      // Auto update status to InProgress if it's currently Open
      if (ticket.status === 'Open') {
        setStatus('InProgress');
        await api.put(`/tickets/${ticket.id}/status`, { status: 'InProgress' });
      }

      setTicket({
        ...ticket,
        status: ticket.status === 'Open' ? 'InProgress' : ticket.status,
        messages: [...ticket.messages, {
          id: res.data.data.id,
          message: newMessage,
          created_at: new Date().toISOString(),
          sender: { username: user?.username || 'Admin', role: 'Admin' }
        }]
      });
      setNewMessage('');
    } catch (error) {
      toast.error('Không thể gửi phản hồi');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen pt-24 pb-12 px-4 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }

  if (!ticket) return null;

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
        
        {/* Header with Admin Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 shrink-0 bg-[var(--color-bg-elevated)] p-4 rounded-xl border border-[rgba(255,255,255,0.05)]">
          <Link href="/admin/tickets" className="w-10 h-10 rounded-full bg-[var(--color-bg-base)] flex items-center justify-center border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.1)] transition-colors">
            <ArrowLeft className="w-5 h-5 text-white" />
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white font-outfit truncate">{ticket.subject}</h1>
            <p className="text-[var(--color-text-muted)] text-sm">
              Gửi bởi: <span className="text-white">{ticket.user.username}</span> ({ticket.user.email})
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="bg-[var(--color-bg-base)] border border-[rgba(255,255,255,0.1)] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[var(--color-primary)] appearance-none"
            >
              <option value="Open">🔴 Chờ xử lý (Open)</option>
              <option value="InProgress">🟡 Đang xử lý (In Progress)</option>
              <option value="Resolved">🟢 Đã giải quyết (Resolved)</option>
              <option value="Closed">⚫ Đã đóng (Closed)</option>
            </select>
            {status !== ticket.status && (
              <button 
                onClick={handleUpdateStatus}
                disabled={updatingStatus}
                className="btn-primary py-2 px-3 text-sm flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" /> Lưu
              </button>
            )}
          </div>
        </div>

        {/* Chat Box */}
        <div className="glass-panel flex-1 rounded-2xl flex flex-col overflow-hidden border border-[rgba(255,255,255,0.05)]">
          
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
            {/* Original Ticket Description */}
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-[var(--color-bg-elevated)] flex flex-shrink-0 items-center justify-center border border-[rgba(255,255,255,0.1)]">
                <User className="w-5 h-5 text-[var(--color-text-muted)]" />
              </div>
              <div className="flex-1 max-w-[80%]">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-semibold text-[var(--color-text-muted)]">{ticket.user.username} (Khách)</span>
                  <span className="text-xs text-[var(--color-text-muted)] opacity-50">{formatDate(ticket.created_at)}</span>
                  {ticket.category && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 uppercase tracking-wider font-semibold border border-purple-500/30">
                      {ticket.category}
                    </span>
                  )}
                </div>
                <div className="bg-[var(--color-bg-elevated)] p-4 rounded-2xl rounded-tl-none border border-[rgba(255,255,255,0.05)] text-white whitespace-pre-wrap shadow-lg">
                  {ticket.description}
                </div>
                
                {/* AI Suggestion */}
                {ticket.ai_suggested_reply && (
                  <div className="mt-4 p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">🤖</span>
                      <span className="text-sm font-semibold text-purple-400">EduBot AI Đề Xuất Phản Hồi:</span>
                    </div>
                    <div className="text-sm text-purple-200/80 italic whitespace-pre-wrap mb-3">
                      "{ticket.ai_suggested_reply}"
                    </div>
                    <button 
                      onClick={() => setNewMessage(ticket.ai_suggested_reply!)}
                      className="text-xs font-medium bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 px-3 py-1.5 rounded-lg transition-colors border border-purple-500/30"
                    >
                      Dùng câu này
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Replies */}
            {ticket.messages.map((msg, idx) => {
              const isAdmin = msg.sender.role === 'Admin';
              
              return (
                <div key={idx} className={`flex gap-4 ${isAdmin ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-10 h-10 rounded-full flex flex-shrink-0 items-center justify-center border ${
                    isAdmin 
                      ? 'bg-red-500/20 border-red-500/30' 
                      : 'bg-[var(--color-bg-elevated)] border-[rgba(255,255,255,0.1)]'
                  }`}>
                    {isAdmin ? <ShieldCheck className="w-5 h-5 text-red-400" /> : <User className="w-5 h-5 text-[var(--color-text-muted)]" />}
                  </div>
                  
                  <div className={`flex-1 max-w-[80%] flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className={`font-semibold ${isAdmin ? 'text-red-400' : 'text-[var(--color-text-muted)]'}`}>
                        {isAdmin ? `Admin (${msg.sender.username})` : msg.sender.username}
                      </span>
                      <span className="text-xs text-[var(--color-text-muted)] opacity-50">{formatDate(msg.created_at)}</span>
                    </div>
                    <div className={`p-4 rounded-2xl border text-white whitespace-pre-wrap ${
                      isAdmin 
                        ? 'bg-red-500/10 border-red-500/20 rounded-tr-none'
                        : 'bg-[var(--color-bg-elevated)] border-[rgba(255,255,255,0.05)] rounded-tl-none'
                    }`}>
                      {msg.message}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-[var(--color-bg-elevated)]/50 border-t border-[rgba(255,255,255,0.05)]">
            <form onSubmit={handleSendMessage} className="flex gap-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Nhập câu trả lời cho khách hàng (nhấn Enter để gửi)..."
                className="flex-1 bg-[var(--color-bg-base)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-primary)]"
              />
              <button 
                type="submit" 
                disabled={!newMessage.trim() || sending}
                className="w-12 rounded-xl flex items-center justify-center bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
