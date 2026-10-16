'use client';

import React, { useState, useEffect } from 'react';
import { MaterialCard } from './MaterialCard';
import { Material } from '@/types';
import api from '@/lib/api';
import { Sparkles } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

export const RecommendationSection = () => {
  const { isLoggedIn } = useAuthStore();
  const [recommendations, setRecommendations] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }

    const fetchRecommendations = async () => {
      try {
        const res = await api.get('/ai/recommend');
        if (res.data && res.data.data) {
          setRecommendations(res.data.data);
        }
      } catch (error) {
        console.error('Lỗi khi lấy đề xuất AI:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendations();
  }, [isLoggedIn]);

  if (!isLoggedIn) return null; // Chỉ hiện cho người đã đăng nhập
  
  if (loading) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="h-8 w-64 bg-[rgba(255,255,255,0.05)] rounded animate-pulse mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-72 rounded-xl glass-panel animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (recommendations.length === 0) return null;

  return (
    <section className="py-16 bg-gradient-to-b from-[var(--color-bg-base)] to-[var(--color-bg-elevated)]/30 border-t border-[rgba(255,255,255,0.05)] relative overflow-hidden">
      {/* Glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-32 bg-[var(--color-primary)]/10 blur-[100px] pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)]/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-[var(--color-accent)] animate-pulse" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Đề xuất dành riêng cho bạn</h2>
            <p className="text-sm text-[var(--color-text-muted)]">AI đã phân tích sở thích để chọn lọc các học liệu này</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {recommendations.map(material => (
            <div key={material.id} className="animate-slide-up hover:-translate-y-2 transition-transform duration-300">
              <MaterialCard material={material} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
