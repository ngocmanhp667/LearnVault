'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, ExternalLink } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';

export const NotificationDropdown = () => {
  const { isLoggedIn } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications');
        setNotifications(res.data.data);
        setUnreadCount(res.data.unreadCount);
      } catch (error) {
        console.error('Lỗi tải thông báo', error);
      }
    };

    fetchNotifications();
    
    // Polling every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error(error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put('/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error(error);
    }
  };

  if (!isLoggedIn) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        className="relative p-2 rounded-full hover:bg-[var(--color-bg-elevated)] transition-colors text-[var(--color-text-muted)] hover:text-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[var(--color-bg-base)] animate-pulse"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 glass-panel rounded-2xl border border-[rgba(255,255,255,0.05)] shadow-2xl z-50 overflow-hidden animate-slide-up">
          <div className="p-4 border-b border-[rgba(255,255,255,0.05)] flex items-center justify-between bg-[var(--color-bg-base)]/50">
            <h3 className="font-bold text-white flex items-center gap-2">
              Thông báo {unreadCount > 0 && <span className="bg-red-500/20 text-red-400 text-xs px-2 py-0.5 rounded-full">{unreadCount} mới</span>}
            </h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllAsRead}
                className="text-xs text-[var(--color-primary)] hover:text-white transition-colors flex items-center gap-1"
              >
                <Check className="w-3 h-3" /> Đánh dấu đã đọc
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={`p-4 border-b border-[rgba(255,255,255,0.02)] transition-colors hover:bg-[rgba(255,255,255,0.02)] ${!notification.is_read ? 'bg-[var(--color-primary)]/5' : ''}`}
                >
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <h4 className={`text-sm font-medium mb-1 ${!notification.is_read ? 'text-white' : 'text-[var(--color-text-muted)]'}`}>
                        {notification.title}
                      </h4>
                      <p className="text-xs text-[var(--color-text-muted)] mb-2 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-[var(--color-text-muted)] opacity-70">
                          {formatDate(notification.created_at)}
                        </span>
                        
                        <div className="flex items-center gap-2">
                          {!notification.is_read && (
                            <button 
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="text-[10px] text-[var(--color-primary)] hover:text-white"
                            >
                              Đã đọc
                            </button>
                          )}
                          {notification.link && (
                            <Link 
                              href={notification.link}
                              onClick={() => {
                                setIsOpen(false);
                                if (!notification.is_read) handleMarkAsRead(notification.id);
                              }}
                              className="text-[10px] text-blue-400 hover:text-white flex items-center gap-1"
                            >
                              Xem <ExternalLink className="w-3 h-3" />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                    {!notification.is_read && (
                      <div className="w-2 h-2 rounded-full bg-[var(--color-primary)] mt-1.5 flex-shrink-0"></div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-[var(--color-text-muted)]">
                <Bell className="w-8 h-8 mx-auto mb-3 opacity-20" />
                <p className="text-sm">Bạn không có thông báo nào.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
