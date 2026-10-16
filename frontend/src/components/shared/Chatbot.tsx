'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, Loader2 } from 'lucide-react';
import api from '@/lib/api';

interface ChatMessage {
  role: 'user' | 'bot';
  content: string;
}

export const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'bot', content: 'Xin chào! Tôi là EduBot. Tôi có thể giúp gì cho bạn trong việc tìm kiếm tài liệu học tập?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const res = await api.post('/ai/chat', { message: userMessage });
      if (res.data && res.data.data) {
        setMessages(prev => [...prev, { role: 'bot', content: res.data.data }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', content: 'Xin lỗi, tôi đang gặp sự cố kết nối. Vui lòng thử lại sau.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Nút bật/tắt Chatbot */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.5)] hover:scale-110 transition-transform duration-300"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      )}

      {/* Cửa sổ Chat */}
      {isOpen && (
        <div className="w-80 sm:w-96 h-[500px] max-h-[80vh] flex flex-col bg-[var(--color-bg-base)] border border-[rgba(255,255,255,0.1)] rounded-2xl shadow-2xl overflow-hidden animate-slide-up origin-bottom-right">
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-[var(--color-primary)]/20 to-[var(--color-accent)]/20 border-b border-[rgba(255,255,255,0.05)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">EduBot</h3>
                <p className="text-xs text-[var(--color-text-muted)]">AI Trợ lý học tập</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-[var(--color-text-muted)] hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Vùng Tin nhắn */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[var(--color-bg-elevated)]/30 scrollbar-hide">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-[var(--color-primary)] text-white rounded-tr-sm' 
                      : 'glass-panel text-[var(--color-text-muted)] rounded-tl-sm border border-[rgba(255,255,255,0.05)]'
                  }`}
                  style={{ whiteSpace: 'pre-wrap' }}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="glass-panel p-3 rounded-2xl rounded-tl-sm border border-[rgba(255,255,255,0.05)] text-[var(--color-text-muted)]">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-[rgba(255,255,255,0.05)] bg-[var(--color-bg-base)]">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Hỏi tôi bất cứ điều gì..."
                className="flex-1 bg-[var(--color-bg-elevated)] border border-[rgba(255,255,255,0.05)] rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="w-10 h-10 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white hover:bg-[var(--color-primary)]/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </form>
          </div>
          
        </div>
      )}
    </div>
  );
};
