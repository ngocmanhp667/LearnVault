'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { UploadCloud, File, Image as ImageIcon, CheckCircle, ArrowLeft } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const uploadSchema = z.object({
  title: z.string().min(5, 'Tiêu đề phải dài hơn 5 ký tự'),
  description: z.string().min(20, 'Mô tả ít nhất 20 ký tự để người mua dễ hiểu'),
  price: z.string().min(1, 'Vui lòng nhập giá'),
  tags: z.string().optional(),
});

type UploadForm = z.infer<typeof uploadSchema>;

export default function EditMaterialPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isLoggedIn } = useAuthStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [materialFile, setMaterialFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [existingMaterial, setExistingMaterial] = useState<any>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<UploadForm>({
    resolver: zodResolver(uploadSchema),
  });

  useEffect(() => {
    if (!isLoggedIn) {
      toast.error('Bạn cần đăng nhập để sử dụng tính năng này');
      router.push('/login');
      return;
    }

    const fetchMaterial = async () => {
      try {
        const res = await api.get(`/materials/${params.id}`);
        const material = res.data.data;
        
        // Check ownership
        if (material.provider_id !== user?.id) {
          toast.error('Bạn không có quyền chỉnh sửa học liệu này');
          router.push(`/materials/${params.id}`);
          return;
        }

        setExistingMaterial(material);
        reset({
          title: material.title,
          description: material.description,
          price: material.price.toString(),
          tags: material.tags ? JSON.parse(material.tags).join(', ') : '',
        });
      } catch (error) {
        toast.error('Không tìm thấy học liệu');
        router.push('/materials');
      } finally {
        setIsFetching(false);
      }
    };

    if (params.id) {
      fetchMaterial();
    }
  }, [isLoggedIn, params.id, router, reset, user?.id]);

  const onSubmit = async (data: UploadForm) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('price', data.price.toString());
      
      if (data.tags) {
        formData.append('tags', JSON.stringify(data.tags.split(',').map(t => t.trim())));
      }

      if (materialFile) {
        formData.append('material_file', materialFile);
      }
      if (thumbnailFile) {
        formData.append('thumbnail', thumbnailFile);
      }

      await api.put(`/materials/${params.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success('Cập nhật học liệu thành công!');
      router.push('/profile');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'material' | 'thumbnail') => {
    if (e.target.files && e.target.files[0]) {
      if (type === 'material') {
        setMaterialFile(e.target.files[0]);
      } else {
        setThumbnailFile(e.target.files[0]);
      }
    }
  };

  if (!isLoggedIn || isFetching) {
    return (
      <div className="flex justify-center items-center py-40">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--color-primary)]"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <Button 
        variant="ghost" 
        onClick={() => router.back()} 
        icon={<ArrowLeft className="w-4 h-4" />}
        className="mb-6 px-0 hover:bg-transparent"
      >
        Quay lại
      </Button>

      <div className="glass-panel p-8 rounded-2xl border border-[rgba(255,255,255,0.05)]">
        <div className="mb-8 border-b border-[rgba(255,255,255,0.05)] pb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Chỉnh sửa Học liệu</h1>
          <p className="text-[var(--color-text-muted)]">Cập nhật thông tin tài liệu của bạn.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-5">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-[var(--color-primary)]/20 text-[var(--color-primary)] flex items-center justify-center text-sm">1</span>
              Thông tin cơ bản
            </h3>
            
            <Input
              label="Tiêu đề học liệu *"
              {...register('title')}
              error={errors.title?.message}
            />

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1.5">Mô tả chi tiết *</label>
              <textarea
                className={`w-full rounded-lg bg-[var(--color-bg-elevated)] border border-[rgba(255,255,255,0.05)] text-white px-4 py-3 transition-all outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] min-h-[120px] ${errors.description ? 'border-red-500' : ''}`}
                {...register('description')}
              />
              {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="Giá bán (VNĐ) *"
                type="number"
                {...register('price')}
                error={errors.price?.message}
              />
              
              <Input
                label="Từ khóa (Tags)"
                placeholder="Phân cách bằng dấu phẩy"
                {...register('tags')}
              />
            </div>
          </div>

          <div className="space-y-5 pt-6 border-t border-[rgba(255,255,255,0.05)]">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-[var(--color-accent)]/20 text-[var(--color-accent)] flex items-center justify-center text-sm">2</span>
              Cập nhật Tệp đính kèm (Tùy chọn)
            </h3>
            <p className="text-[var(--color-text-muted)] text-sm mb-4">Để trống nếu bạn không muốn thay đổi file cũ.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">Tệp tài liệu chính (PDF, DOCX, ZIP)</label>
                <div className="relative group">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    onChange={(e) => handleFileChange(e, 'material')}
                  />
                  <div className={`w-full h-32 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-colors ${materialFile ? 'border-green-500 bg-green-500/5' : 'border-[rgba(255,255,255,0.1)] bg-[var(--color-bg-elevated)] group-hover:border-[var(--color-primary)] group-hover:bg-[var(--color-primary)]/5'}`}>
                    {materialFile ? (
                      <>
                        <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
                        <p className="text-sm text-green-500 font-medium text-center px-4 truncate w-full">{materialFile.name}</p>
                      </>
                    ) : (
                      <>
                        <File className="w-8 h-8 text-[var(--color-text-muted)] mb-2 group-hover:text-[var(--color-primary)] transition-colors" />
                        <p className="text-sm text-[var(--color-text-muted)]">Kéo thả hoặc click để chọn file mới</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">Ảnh bìa minh họa (JPG, PNG)</label>
                <div className="relative group">
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    onChange={(e) => handleFileChange(e, 'thumbnail')}
                  />
                  <div className={`w-full h-32 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-colors ${thumbnailFile ? 'border-green-500 bg-green-500/5' : 'border-[rgba(255,255,255,0.1)] bg-[var(--color-bg-elevated)] group-hover:border-[var(--color-primary)] group-hover:bg-[var(--color-primary)]/5'}`}>
                    {thumbnailFile ? (
                      <>
                        <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
                        <p className="text-sm text-green-500 font-medium text-center px-4 truncate w-full">{thumbnailFile.name}</p>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-8 h-8 text-[var(--color-text-muted)] mb-2 group-hover:text-[var(--color-primary)] transition-colors" />
                        <p className="text-sm text-[var(--color-text-muted)]">Kéo thả ảnh bìa mới</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 flex justify-end gap-4 border-t border-[rgba(255,255,255,0.05)]">
            <Button type="button" variant="ghost" onClick={() => router.back()}>Hủy bỏ</Button>
            <Button type="submit" loading={isLoading} icon={<UploadCloud className="w-5 h-5" />}>
              Lưu Thay Đổi
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
