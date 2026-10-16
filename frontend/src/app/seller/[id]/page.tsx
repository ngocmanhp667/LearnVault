'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { MaterialCard } from '@/components/shared/MaterialCard';
import { StarRating } from '@/components/shared/StarRating';
import { Calendar, BookOpen, ShoppingBag, ShieldCheck } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function SellerProfilePage() {
  const params = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/users/${params.id}/public`);
        setProfile(res.data.data);
      } catch (error) {
        toast.error('Không tìm thấy người dùng');
      } finally {
        setLoading(false);
      }
    };
    
    if (params.id) fetchProfile();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-40">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--color-primary)]"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-white mb-4">Không tìm thấy người bán</h2>
        <p className="text-[var(--color-text-muted)]">Người dùng này có thể không tồn tại hoặc đã bị xóa.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      <div className="glass-panel p-8 rounded-2xl border border-[rgba(255,255,255,0.05)] mb-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-primary)]/10 rounded-full blur-[80px]" />
        
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start relative z-10">
          <div className="w-32 h-32 flex-shrink-0 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center text-5xl text-white font-bold shadow-[0_0_30px_rgba(99,102,241,0.3)]">
            {profile.username?.charAt(0).toUpperCase()}
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center md:justify-start gap-3">
              {profile.username}
              {profile.averageRating >= 4.0 && (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                  <ShieldCheck className="w-3 h-3" /> Người bán Uy tín
                </span>
              )}
            </h1>
            
            <div className="flex flex-wrap gap-6 mt-6 justify-center md:justify-start">
              <div className="flex flex-col items-center md:items-start">
                <div className="text-[var(--color-text-muted)] text-sm mb-1 flex items-center gap-2"><BookOpen className="w-4 h-4"/> Tổng học liệu</div>
                <div className="text-xl font-semibold text-white">{profile.totalMaterials}</div>
              </div>
              <div className="w-px h-10 bg-[rgba(255,255,255,0.1)] hidden md:block"></div>
              
              <div className="flex flex-col items-center md:items-start">
                <div className="text-[var(--color-text-muted)] text-sm mb-1 flex items-center gap-2"><ShoppingBag className="w-4 h-4"/> Đã bán</div>
                <div className="text-xl font-semibold text-white">{profile.totalSales}</div>
              </div>
              <div className="w-px h-10 bg-[rgba(255,255,255,0.1)] hidden md:block"></div>
              
              <div className="flex flex-col items-center md:items-start">
                <div className="text-[var(--color-text-muted)] text-sm mb-1 flex items-center gap-2"><Calendar className="w-4 h-4"/> Tham gia</div>
                <div className="text-lg font-medium text-white mt-0.5">{formatDate(profile.created_at)}</div>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-xl border border-[rgba(255,255,255,0.05)] text-center min-w-[200px]">
            <div className="text-4xl font-bold text-white mb-2">{profile.averageRating > 0 ? profile.averageRating.toFixed(1) : 'N/A'}</div>
            <div className="flex justify-center mb-2">
              <StarRating rating={profile.averageRating} size="sm" />
            </div>
            <div className="text-xs text-[var(--color-text-muted)]">Đánh giá trung bình</div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-white mb-6 border-b border-[rgba(255,255,255,0.05)] pb-4">
          Học liệu đang bán ({profile.materials?.length || 0})
        </h2>
        
        {profile.materials && profile.materials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profile.materials.map((m: any) => (
              <MaterialCard 
                key={m.id} 
                material={{
                  ...m,
                  provider: { username: profile.username }
                }} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 glass-panel rounded-xl">
            <BookOpen className="w-16 h-16 text-[var(--color-text-muted)] mx-auto mb-4 opacity-30" />
            <p className="text-[var(--color-text-muted)]">Người bán này hiện chưa có học liệu nào.</p>
          </div>
        )}
      </div>
    </div>
  );
}
