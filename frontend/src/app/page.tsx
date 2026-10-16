'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { MaterialCard } from '@/components/shared/MaterialCard';
import { RecommendationSection } from '@/components/shared/RecommendationSection';
import { BookOpen, Users, ShoppingBag, Star, Sparkles, ShieldCheck, Repeat } from 'lucide-react';
import api from '@/lib/api';
import { Material } from '@/types';

export default function HomePage() {
  const [latestMaterials, setLatestMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        // Fetch 6 recent materials
        const res = await api.get('/materials?limit=6');
        if (res.data && res.data.materials) {
          setLatestMaterials(res.data.materials.slice(0, 6));
        }
      } catch (error) {
        console.error('Failed to fetch materials', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMaterials();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--color-primary)]/20 rounded-full blur-[120px] -z-10 animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--color-accent)]/20 rounded-full blur-[120px] -z-10 animate-float" style={{ animationDelay: '2s' }} />
        
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-bg-elevated)] border border-[rgba(255,255,255,0.05)] text-sm font-medium text-[var(--color-accent)] mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4" />
            Nền tảng giao dịch tài liệu số 1 sinh viên
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 animate-slide-up">
            Sàn Trao đổi <br className="hidden md:block" />
            <span className="text-gradient">Học liệu Trực tuyến</span>
          </h1>
          
          <p className="text-lg md:text-xl text-[var(--color-text-muted)] max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Nơi sinh viên chia sẻ tài liệu học tập, kiếm thêm thu nhập và khám phá các khóa học phù hợp được đề xuất bởi AI thông minh.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Link href="/materials">
              <Button size="lg" className="w-full sm:w-auto px-8">Khám phá Học liệu</Button>
            </Link>
            <Link href="/materials/create">
              <Button variant="outline" size="lg" className="w-full sm:w-auto px-8 bg-[var(--color-bg-base)]">Đăng bán ngay</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-[rgba(255,255,255,0.05)] bg-[var(--color-bg-elevated)]/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: BookOpen, label: 'Học liệu', value: '500+' },
              { icon: Users, label: 'Sinh viên', value: '2,000+' },
              { icon: ShoppingBag, label: 'Giao dịch', value: '10,000+' },
              { icon: Star, label: 'Đánh giá', value: '4.8/5' },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center justify-center p-6 glass-panel rounded-2xl">
                <stat.icon className="w-8 h-8 text-[var(--color-primary)] mb-3" />
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-[var(--color-text-muted)]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Vì sao chọn <span className="text-gradient">EduMarket</span>?</h2>
            <p className="text-[var(--color-text-muted)] max-w-xl mx-auto">Hệ thống được thiết kế tối ưu hóa trải nghiệm học tập và trao đổi tài liệu.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Repeat, title: 'Trao đổi C2C Trực tiếp', desc: 'Mua bán tài liệu trực tiếp giữa sinh viên với sinh viên, không qua trung gian, giữ trọn doanh thu.' },
              { icon: Sparkles, title: 'AI Đề xuất Thông minh', desc: 'Hệ thống học máy phân tích sở thích để gợi ý những tài liệu phù hợp nhất dành riêng cho bạn.' },
              { icon: ShieldCheck, title: 'Thanh toán An toàn', desc: 'Tích hợp MoMo, VNPay và Ví nội bộ. Giao dịch được bảo vệ và hoàn tiền nếu có sự cố.' },
            ].map((feat, i) => (
              <div key={i} className="glass-panel p-8 rounded-2xl hover:-translate-y-2 transition-transform duration-300 border-t border-[rgba(255,255,255,0.05)]">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-accent)]/20 flex items-center justify-center mb-6">
                  <feat.icon className="w-7 h-7 text-[var(--color-primary)]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feat.title}</h3>
                <p className="text-[var(--color-text-muted)] leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Đề xuất AI */}
      <RecommendationSection />

      {/* Latest Materials */}
      <section className="py-24 bg-[var(--color-bg-elevated)]/20 relative">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-3">Học liệu Mới nhất</h2>
              <p className="text-[var(--color-text-muted)]">Khám phá các tài liệu vừa được đăng tải từ cộng đồng.</p>
            </div>
            <Link href="/materials" className="mt-4 md:mt-0 text-[var(--color-primary)] hover:text-[var(--color-accent)] font-medium inline-flex items-center transition-colors">
              Xem tất cả học liệu &rarr;
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-80 rounded-xl glass-panel animate-pulse flex flex-col">
                  <div className="h-40 bg-[rgba(255,255,255,0.05)] w-full" />
                  <div className="p-5 flex-1 flex flex-col gap-3">
                    <div className="h-6 bg-[rgba(255,255,255,0.05)] rounded w-3/4" />
                    <div className="h-4 bg-[rgba(255,255,255,0.05)] rounded w-full" />
                    <div className="h-4 bg-[rgba(255,255,255,0.05)] rounded w-5/6" />
                  </div>
                </div>
              ))}
            </div>
          ) : latestMaterials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestMaterials.map((material) => (
                <MaterialCard key={material.id} material={material} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 glass-panel rounded-2xl">
              <BookOpen className="w-16 h-16 text-[var(--color-text-muted)] mx-auto mb-4 opacity-30" />
              <p className="text-[var(--color-text-muted)]">Chưa có học liệu nào trên hệ thống.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)]/10 to-[var(--color-accent)]/10" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Bạn có tài liệu hay muốn chia sẻ?</h2>
          <p className="text-xl text-[var(--color-text-muted)] max-w-2xl mx-auto mb-10">
            Biến tri thức của bạn thành thu nhập. Gia nhập cộng đồng EduMarket ngay hôm nay!
          </p>
          <Link href="/register">
            <Button size="lg" className="px-10 shadow-[0_0_30px_rgba(99,102,241,0.3)]">Tạo tài khoản miễn phí</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
