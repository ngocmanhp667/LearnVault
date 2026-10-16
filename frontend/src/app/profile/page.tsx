'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { MaterialCard } from '@/components/shared/MaterialCard';
import api from '@/lib/api';
import { User, Mail, Shield, BookOpen, Clock, Settings, FileText, Lock, CheckCircle } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại'),
  newPassword: z.string().min(6, 'Mật khẩu mới phải từ 6 ký tự'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Mật khẩu nhập lại không khớp",
  path: ["confirmPassword"],
});

type PasswordForm = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const { user, isLoggedIn, logout, setUser } = useAuthStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'purchased' | 'posted' | 'settings'>('purchased');
  
  // States
  const [purchasedMaterials, setPurchasedMaterials] = useState<any[]>([]);
  const [postedMaterials, setPostedMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [newUsername, setNewUsername] = useState(user?.username || '');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    setNewUsername(user?.username || '');
  }, [isLoggedIn, router, user]);

  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeTab === 'posted') {
          const res = await api.get('/users/me/materials');
          setPostedMaterials(res.data.data);
        } else if (activeTab === 'purchased') {
          const res = await api.get('/users/me/purchases');
          setPurchasedMaterials(res.data.data);
        }
      } catch (error) {
        console.error('Lỗi tải dữ liệu profile', error);
        toast.error('Lỗi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    if (activeTab !== 'settings') {
      fetchData();
    }
  }, [activeTab, isLoggedIn]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim()) return;
    setIsUpdatingProfile(true);
    try {
      await api.put('/users/me/profile', { username: newUsername });
      setUser({ ...user!, username: newUsername });
      toast.success('Cập nhật tên hiển thị thành công');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Cập nhật thất bại');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const onUpdatePassword = async (data: PasswordForm) => {
    setIsUpdatingPassword(true);
    try {
      await api.put('/users/me/password', { 
        currentPassword: data.currentPassword, 
        newPassword: data.newPassword 
      });
      toast.success('Đổi mật khẩu thành công');
      reset();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Đổi mật khẩu thất bại');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleDeleteMaterial = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa học liệu này?')) return;
    try {
      await api.delete(`/materials/${id}`);
      setPostedMaterials(prev => prev.filter(m => m.id !== id));
      toast.success('Đã xóa học liệu');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Xóa thất bại');
    }
  };

  if (!isLoggedIn || !user) return null;

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Sidebar Thông tin User */}
        <div className="md:col-span-1 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-[rgba(255,255,255,0.05)] text-center">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center text-3xl text-white font-bold mb-4 shadow-[0_0_20px_rgba(99,102,241,0.4)]">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-xl font-bold text-white mb-1">{user.username}</h2>
            <div className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-[var(--color-bg-base)] border border-[rgba(255,255,255,0.1)] text-[var(--color-text-muted)] mb-6">
              {user.role === 'Admin' ? <Shield className="w-3 h-3 text-red-400" /> : <User className="w-3 h-3 text-[var(--color-primary)]" />}
              {user.role}
            </div>

            <div className="space-y-3 text-sm text-left border-t border-[rgba(255,255,255,0.05)] pt-6">
              <div className="flex items-center gap-3 text-[var(--color-text-muted)]">
                <Mail className="w-4 h-4" />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-3 text-[var(--color-text-muted)]">
                <Clock className="w-4 h-4" />
                <span>Tham gia: {formatDate(user.created_at || new Date().toISOString())}</span>
              </div>
            </div>

            <Button variant="outline" className="w-full mt-6" onClick={logout}>
              Đăng xuất
            </Button>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-[rgba(255,255,255,0.05)]">
            <nav className="space-y-1">
              <button 
                onClick={() => setActiveTab('purchased')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'purchased' ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary)]' : 'text-[var(--color-text-muted)] hover:text-white hover:bg-[var(--color-bg-elevated)]'}`}
              >
                <BookOpen className="w-4 h-4" /> Đã mua
              </button>
              <button 
                onClick={() => setActiveTab('posted')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'posted' ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary)]' : 'text-[var(--color-text-muted)] hover:text-white hover:bg-[var(--color-bg-elevated)]'}`}
              >
                <FileText className="w-4 h-4" /> Đã đăng bán
              </button>
              <button 
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'settings' ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary)]' : 'text-[var(--color-text-muted)] hover:text-white hover:bg-[var(--color-bg-elevated)]'}`}
              >
                <Settings className="w-4 h-4" /> Cài đặt tài khoản
              </button>
            </nav>
          </div>
        </div>

        {/* Vùng Nội dung */}
        <div className="md:col-span-3">
          <div className="glass-panel p-8 rounded-2xl border border-[rgba(255,255,255,0.05)] min-h-[500px]">
            <h2 className="text-2xl font-bold text-white mb-6 pb-4 border-b border-[rgba(255,255,255,0.05)]">
              {activeTab === 'purchased' && 'Học liệu đã mua'}
              {activeTab === 'posted' && 'Học liệu đã đăng bán'}
              {activeTab === 'settings' && 'Cài đặt tài khoản'}
            </h2>

            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--color-primary)]"></div>
              </div>
            ) : (
              <>
                {/* TAB: PURCHASED */}
                {activeTab === 'purchased' && (
                  purchasedMaterials.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {purchasedMaterials.map(tx => (
                        <div key={tx.id} className="glass-panel p-4 rounded-xl flex flex-col gap-3">
                          <img src={tx.material.thumbnail_url || 'https://via.placeholder.com/300x200'} alt={tx.material.title} className="w-full h-40 object-cover rounded-lg" />
                          <h3 className="font-bold text-white line-clamp-1">{tx.material.title}</h3>
                          <div className="text-sm text-[var(--color-text-muted)]">Mua từ: {tx.seller.username}</div>
                          <div className="text-sm text-[var(--color-text-muted)]">Ngày mua: {formatDate(tx.created_at)}</div>
                          <div className="text-[var(--color-primary)] font-bold">{formatCurrency(Number(tx.material.price))}</div>
                          <Button className="w-full mt-2" onClick={() => window.open(tx.material.file_url, '_blank')}>
                            Tải xuống ({tx.material.file_format})
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20">
                      <div className="w-20 h-20 mx-auto rounded-full bg-[var(--color-bg-elevated)] flex items-center justify-center mb-4 border border-[rgba(255,255,255,0.05)]">
                        <BookOpen className="w-10 h-10 text-[var(--color-text-muted)] opacity-50" />
                      </div>
                      <h3 className="text-lg font-medium text-white mb-2">Chưa có dữ liệu</h3>
                      <p className="text-[var(--color-text-muted)] max-w-sm mx-auto mb-6">Bạn chưa mua bất kỳ học liệu nào trên hệ thống.</p>
                      <Button onClick={() => router.push('/materials')}>Khám phá ngay</Button>
                    </div>
                  )
                )}

                {/* TAB: POSTED */}
                {activeTab === 'posted' && (
                  postedMaterials.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {postedMaterials.map(material => (
                        <div key={material.id} className="glass-panel p-4 rounded-xl flex flex-col gap-3 relative">
                          <img src={material.thumbnail_url || 'https://via.placeholder.com/300x200'} alt={material.title} className="w-full h-40 object-cover rounded-lg" />
                          <h3 className="font-bold text-white line-clamp-1">{material.title}</h3>
                          <div className="text-sm text-[var(--color-text-muted)]">Ngày đăng: {formatDate(material.created_at)}</div>
                          <div className="text-[var(--color-primary)] font-bold">{formatCurrency(Number(material.price))}</div>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <Button variant="outline" onClick={() => router.push(`/materials/edit/${material.id}`)}>Sửa</Button>
                            <Button variant="outline" className="text-red-400 hover:bg-red-500/10 border-red-500/30" onClick={() => handleDeleteMaterial(material.id)}>Xóa</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20">
                      <div className="w-20 h-20 mx-auto rounded-full bg-[var(--color-bg-elevated)] flex items-center justify-center mb-4 border border-[rgba(255,255,255,0.05)]">
                        <FileText className="w-10 h-10 text-[var(--color-text-muted)] opacity-50" />
                      </div>
                      <h3 className="text-lg font-medium text-white mb-2">Chưa có dữ liệu</h3>
                      <p className="text-[var(--color-text-muted)] max-w-sm mx-auto mb-6">Bạn chưa đăng bán học liệu nào.</p>
                      <Button onClick={() => router.push('/materials/create')}>Đăng bán học liệu</Button>
                    </div>
                  )
                )}

                {/* TAB: SETTINGS */}
                {activeTab === 'settings' && (
                  <div className="max-w-md space-y-10 animate-fade-in">
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                      <h3 className="text-lg font-medium text-white">Thông tin cá nhân</h3>
                      <Input 
                        label="Tên hiển thị" 
                        value={newUsername} 
                        onChange={(e) => setNewUsername(e.target.value)} 
                        icon={<User className="w-5 h-5" />} 
                      />
                      <Button type="submit" loading={isUpdatingProfile} icon={<CheckCircle className="w-4 h-4"/>}>Lưu thông tin</Button>
                    </form>
                    
                    <form onSubmit={handleSubmit(onUpdatePassword)} className="space-y-4 pt-6 border-t border-[rgba(255,255,255,0.05)]">
                      <h3 className="text-lg font-medium text-white">Đổi mật khẩu</h3>
                      <Input 
                        label="Mật khẩu hiện tại" 
                        type="password" 
                        placeholder="••••••"
                        {...register('currentPassword')}
                        error={errors.currentPassword?.message}
                        icon={<Lock className="w-5 h-5" />}
                      />
                      <Input 
                        label="Mật khẩu mới" 
                        type="password" 
                        placeholder="••••••"
                        {...register('newPassword')}
                        error={errors.newPassword?.message}
                        icon={<Lock className="w-5 h-5" />}
                      />
                      <Input 
                        label="Xác nhận mật khẩu mới" 
                        type="password" 
                        placeholder="••••••"
                        {...register('confirmPassword')}
                        error={errors.confirmPassword?.message}
                        icon={<Lock className="w-5 h-5" />}
                      />
                      <Button type="submit" loading={isUpdatingPassword} variant="outline">Đổi mật khẩu</Button>
                    </form>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
