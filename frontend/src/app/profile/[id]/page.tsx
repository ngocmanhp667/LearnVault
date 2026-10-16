'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { MaterialCard } from '@/components/shared/MaterialCard';
import { User, Star, BookOpen, ShoppingCart, CalendarDays, ArrowLeft, ShieldCheck } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface PublicProfile {
  id: string;
  username: string;
  created_at: string;
  totalMaterials: number;
  totalSales: number;
  averageRating: number;
  materials: any[];
}

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/users/${params.id}/public`);
        setProfile(res.data.data);
      } catch (error) {
        console.error('Không tìm thấy hồ sơ', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };
    if (params.id) fetchProfile();
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center min-h-[60vh] items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)]"></div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <Button 
        variant="ghost" 
        onClick={() => router.back()} 
        icon={<ArrowLeft className="w-4 h-4" />}
        className="mb-6 px-0 hover:bg-transparent text-[var(--color-text-muted)]"
      >
        Quay lại
      </Button>

      {/* Header Hồ sơ */}
      <div className="glass-panel p-8 rounded-3xl border border-[rgba(255,255,255,0.05)] relative overflow-hidden mb-10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--color-primary)]/10 rounded-full blur-[100px] pointer-events-none translate-x-1/3 -translate-y-1/3" />
        
        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center text-white font-bold text-5xl shadow-[0_0_30px_rgba(99,102,241,0.3)] shrink-0 border-4 border-[var(--color-bg-base)]">
            {profile.username?.charAt(0).toUpperCase()}
          </div>
          
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-white mb-2">{profile.username}</h1>
            <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-[var(--color-text-muted)] mb-6">
              <ShieldCheck className="w-4 h-4 text-green-500" />
              <span>Thành viên xác thực</span>
              <span className="w-1 h-1 rounded-full bg-[rgba(255,255,255,0.2)] mx-2"></span>
              <CalendarDays className="w-4 h-4" />
              <span>Tham gia từ {formatDate(profile.created_at)}</span>
            </div>

            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <div className="bg-[var(--color-bg-base)] px-5 py-3 rounded-xl border border-[rgba(255,255,255,0.05)] flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-500/20 text-yellow-400 flex items-center justify-center">
                  <Star className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-[var(--color-text-muted)]">Đánh giá</p>
                  <p className="text-lg font-bold text-white">{profile.averageRating > 0 ? profile.averageRating.toFixed(1) : 'Chưa có'} <span className="text-xs font-normal text-[var(--color-text-muted)]">/ 5.0</span></p>
                </div>
              </div>

              <div className="bg-[var(--color-bg-base)] px-5 py-3 rounded-xl border border-[rgba(255,255,255,0.05)] flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 text-green-400 flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-[var(--color-text-muted)]">Lượt bán</p>
                  <p className="text-lg font-bold text-white">{profile.totalSales}</p>
                </div>
              </div>

              <div className="bg-[var(--color-bg-base)] px-5 py-3 rounded-xl border border-[rgba(255,255,255,0.05)] flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-[var(--color-text-muted)]">Học liệu</p>
                  <p className="text-lg font-bold text-white">{profile.totalMaterials}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Danh sách học liệu */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-[var(--color-primary)]" />
          Học liệu của {profile.username}
        </h2>

        {profile.materials.length === 0 ? (
          <div className="glass-panel p-12 text-center rounded-2xl border border-[rgba(255,255,255,0.05)]">
            <User className="w-12 h-12 text-[var(--color-text-muted)] opacity-30 mx-auto mb-4" />
            <p className="text-[var(--color-text-muted)]">Người dùng này chưa chia sẻ học liệu nào.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {profile.materials.map((mat) => (
              <MaterialCard key={mat.id} material={{ ...mat, provider: { username: profile.username } }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
