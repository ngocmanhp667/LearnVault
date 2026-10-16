'use client';

import React, { useState, useEffect } from 'react';
import { MaterialCard } from '@/components/shared/MaterialCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, Filter, BookOpen } from 'lucide-react';
import api from '@/lib/api';
import { Material } from '@/types';

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  
  // States for filter
  const [activeCategory, setActiveCategory] = useState('');

  const categories = [
    { id: '', name: 'Tất cả' },
    { id: 'cntt', name: 'Công nghệ thông tin' },
    { id: 'kinhte', name: 'Kinh tế' },
    { id: 'ngoaingu', name: 'Ngoại ngữ' },
    { id: 'toan', name: 'Toán học' }
  ];

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      let url = '/materials?limit=20';
      if (keyword) url += `&keyword=${keyword}`;
      if (activeCategory) url += `&tags=${activeCategory}`;
      
      const res = await api.get(url);
      if (res.data && res.data.materials) {
        setMaterials(res.data.materials);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách học liệu:', error);
    } finally {
      setLoading(false);
    }
  };

  // Debounce search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchMaterials();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [keyword, activeCategory]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Khám phá <span className="text-gradient">Học liệu</span></h1>
        <p className="text-[var(--color-text-muted)] max-w-2xl">Tìm kiếm hàng ngàn tài liệu, đồ án, slide bài giảng được chia sẻ từ cộng đồng sinh viên toàn quốc.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 flex-shrink-0 space-y-6">
          <div className="glass-panel p-5 rounded-xl border border-[rgba(255,255,255,0.05)] sticky top-24">
            <div className="flex items-center gap-2 mb-4 font-semibold text-white border-b border-[rgba(255,255,255,0.05)] pb-3">
              <Filter className="w-5 h-5" /> Bộ lọc
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-[var(--color-text-muted)] mb-3">Danh mục</h3>
                <ul className="space-y-2">
                  {categories.map((cat) => (
                    <li key={cat.id}>
                      <button
                        onClick={() => setActiveCategory(cat.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeCategory === cat.id 
                            ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary)] font-medium' 
                            : 'text-white hover:bg-[var(--color-bg-elevated)]'
                        }`}
                      >
                        {cat.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* Search Bar */}
          <div className="mb-8">
            <Input 
              placeholder="Tìm kiếm theo tên tài liệu, môn học..." 
              icon={<Search className="w-5 h-5" />}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="bg-[var(--color-bg-elevated)]/50 border-[rgba(255,255,255,0.1)] focus:border-[var(--color-primary)]"
            />
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
          ) : materials.length > 0 ? (
            /* Materials Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {materials.map((material) => (
                <MaterialCard key={material.id} material={material} />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-20 glass-panel rounded-xl border border-[rgba(255,255,255,0.05)]">
              <BookOpen className="w-16 h-16 text-[var(--color-text-muted)] mx-auto mb-4 opacity-30" />
              <h3 className="text-xl font-medium text-white mb-2">Không tìm thấy học liệu nào</h3>
              <p className="text-[var(--color-text-muted)]">Hãy thử thay đổi từ khóa hoặc bộ lọc của bạn.</p>
              <Button 
                variant="outline" 
                className="mt-6"
                onClick={() => { setKeyword(''); setActiveCategory(''); }}
              >
                Xóa bộ lọc
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
