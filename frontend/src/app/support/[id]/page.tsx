'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, Send, User, ShieldCheck } from 'lucide-react';
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
  created_at: string;
  user: {
    username: string;
  };
  messages: TicketMessage[];
}

export default function TicketDetailPage() {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const params = useParams();
  
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchTicket();
  }, [isAuthenticated, router, params.id]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ticket?.messages]);

  const fetchTicket = async () => {
    try {
      const res = await api.get(`/tickets/${params.id}`);
      setTicket(res.data.data);
    } catch (error) {
      console.error('Lỗi lấy chi tiết ticket:', error);
      toast.error('Không tìm thấy yêu cầu hỗ trợ');
      router.push('/support');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !ticket) return;

    setSending(true);
    try {
      const res = await api.post(`/tickets/${ticket.id}/messages`, { message: newMessage });
      // Thêm message mới vào state để cập nhật UI ngay lập tức
      setTicket({
        ...ticket,
        messages: [...ticket.messages, {
          id: res.data.data.id,
          message: newMessage,
          created_at: new Date().toISOString(),
          sender: { username: user?.username || 'You', role: user?.role || 'User' }
        }]
      });
      setNewMessage('');
    } catch (error) {
      toast.error('Không thể gửi tin nhắn');
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

  const isClosed = ticket.status === 'Resolved' || ticket.status === 'Closed';

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-6 shrink-0">
          <Link href="/support" className="w-10 h-10 rounded-full bg-[var(--color-bg-elevated)] flex items-center justify-center border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.1)] transition-colors">
            <ArrowLeft className="w-5 h-5 text-white" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white font-outfit">{ticket.subject}</h1>
            <p className="text-[var(--color-text-muted)] text-sm">
              Mã YC: #{ticket.id.slice(0, 8)} • Tạo ngày {formatDate(ticket.created_at)}
            </p>
          </div>
          <div className="ml-auto">
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
              ticket.status === 'Open' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
              ticket.status === 'InProgress' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
              'bg-green-500/20 text-green-400 border-green-500/30'
            }`}>
              {ticket.status}
            </span>
          </div>
        </div>

        {/* Chat Box */}
        <div className="glass-panel flex-1 rounded-2xl flex flex-col overflow-hidden border border-[rgba(255,255,255,0.05)]">
          
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
            {/* Original Ticket Description */}
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/20 flex flex-shrink-0 items-center justify-center border border-[var(--color-primary)]/30">
                <User className="w-5 h-5 text-[var(--color-primary)]" />
              </div>
              <div className="flex-1 max-w-[80%]">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-semibold text-white">{ticket.user.username}</span>
                  <span className="text-xs text-[var(--color-text-muted)]">{formatDate(ticket.created_at)}</span>
                </div>
                <div className="bg-[var(--color-bg-elevated)] p-4 rounded-2xl rounded-tl-none border border-[rgba(255,255,255,0.05)] text-white whitespace-pre-wrap">
                  {ticket.description}
                </div>
              </div>
            </div>

            {/* Replies */}
            {ticket.messages.map((msg, idx) => {
              const isMe = msg.sender.username === user?.username;
              const isAdmin = msg.sender.role === 'Admin';
              
              return (
                <div key={idx} className={`flex gap-4 ${isMe ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-10 h-10 rounded-full flex flex-shrink-0 items-center justify-center border ${
                    isAdmin 
                      ? 'bg-red-500/20 border-red-500/30' 
                      : 'bg-[var(--color-primary)]/20 border-[var(--color-primary)]/30'
                  }`}>
                    {isAdmin ? <ShieldCheck className="w-5 h-5 text-red-400" /> : <User className="w-5 h-5 text-[var(--color-primary)]" />}
                  </div>
                  
                  <div className={`flex-1 max-w-[80%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-semibold text-white">
                        {isAdmin ? 'Quản trị viên' : msg.sender.username}
                      </span>
                      <span className="text-xs text-[var(--color-text-muted)]">{formatDate(msg.created_at)}</span>
                    </div>
                    <div className={`p-4 rounded-2xl border text-white whitespace-pre-wrap ${
                      isMe 
                        ? 'bg-[var(--color-primary)]/20 border-[var(--color-primary)]/30 rounded-tr-none'
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
            {isClosed ? (
              <div className="text-center p-4 text-[var(--color-text-muted)] bg-[var(--color-bg-base)] rounded-xl border border-[rgba(255,255,255,0.05)]">
                Yêu cầu hỗ trợ này đã được đóng lại. Nếu bạn vẫn cần trợ giúp, vui lòng tạo yêu cầu mới.
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="flex gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Nhập tin nhắn phản hồi..."
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
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
