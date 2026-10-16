'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, BookOpen, ShoppingBag, Star, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const { isLoggedIn, user } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    const fetchStats = async () => {
      try {
        const res = await api.get('/users/me/dashboard');
        setStats(res.data.data);
      } catch (error) {
        console.error('Lỗi tải dashboard stats', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [isLoggedIn, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-40">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--color-primary)]"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard Người Bán</h1>
          <p className="text-[var(--color-text-muted)]">Chào mừng trở lại, {user?.username}. Dưới đây là tổng quan hiệu suất của bạn.</p>
        </div>
        <Link href="/materials/create">
          <Button icon={<ArrowRight className="w-4 h-4" />}>
            Đăng tài liệu mới
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="glass-panel p-6 rounded-2xl border border-[rgba(255,255,255,0.05)] relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-[var(--color-primary)]/10 rounded-full blur-2xl group-hover:bg-[var(--color-primary)]/20 transition-all"></div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center border border-[var(--color-primary)]/20 text-[var(--color-primary)]">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="text-[var(--color-text-muted)] font-medium">Tổng doanh thu</div>
          </div>
          <div className="text-3xl font-bold text-white">
            {formatCurrency(stats?.totalRevenue || 0)}
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-[rgba(255,255,255,0.05)] relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-green-500/10 rounded-full blur-2xl group-hover:bg-green-500/20 transition-all"></div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center border border-green-500/20 text-green-400">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div className="text-[var(--color-text-muted)] font-medium">Lượt bán</div>
          </div>
          <div className="text-3xl font-bold text-white">
            {stats?.totalSalesCount || 0}
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-[rgba(255,255,255,0.05)] relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <div className="text-[var(--color-text-muted)] font-medium">Học liệu đã đăng</div>
          </div>
          <div className="text-3xl font-bold text-white">
            {stats?.totalMaterials || 0}
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-[rgba(255,255,255,0.05)] relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-yellow-500/10 rounded-full blur-2xl group-hover:bg-yellow-500/20 transition-all"></div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20 text-yellow-400">
              <Star className="w-6 h-6" />
            </div>
            <div className="text-[var(--color-text-muted)] font-medium">Đánh giá trung bình</div>
          </div>
          <div className="text-3xl font-bold text-white flex items-end gap-2">
            {stats?.averageRating > 0 ? stats?.averageRating.toFixed(1) : 'N/A'}
            {stats?.averageRating > 0 && <span className="text-sm text-[var(--color-text-muted)] mb-1">/ 5.0</span>}
          </div>
        </div>
      </div>

      <div className="glass-panel p-8 rounded-2xl border border-[rgba(255,255,255,0.05)]">
        <h2 className="text-xl font-bold text-white mb-6">Mẹo để tăng doanh thu</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 bg-[rgba(255,255,255,0.02)] rounded-xl border border-[rgba(255,255,255,0.05)]">
            <h3 className="font-semibold text-[var(--color-primary)] mb-2">1. Cập nhật ảnh bìa đẹp mắt</h3>
            <p className="text-sm text-[var(--color-text-muted)]">Tài liệu có ảnh minh họa rõ ràng và bắt mắt thường có tỷ lệ click cao hơn 60%.</p>
          </div>
          <div className="p-5 bg-[rgba(255,255,255,0.02)] rounded-xl border border-[rgba(255,255,255,0.05)]">
            <h3 className="font-semibold text-[var(--color-primary)] mb-2">2. Mô tả chi tiết</h3>
            <p className="text-sm text-[var(--color-text-muted)]">Hãy viết một mô tả dài liệt kê các mục lục và lợi ích mà người mua sẽ nhận được.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
