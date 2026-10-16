'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Mail, Lock, LogIn } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải từ 6 ký tự trở lên'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', data);
      
      const user = response.data?.user || response.data?.data?.user;
      const token = response.data?.token || response.data?.data?.token;

      if (!user || !token) {
        throw new Error('Dữ liệu phản hồi từ máy chủ không hợp lệ');
      }

      login(user, token);
      
      toast.success('Đăng nhập thành công!');
      
      if (user.role === 'Admin') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || error.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-20 px-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-[var(--color-primary)]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-[var(--color-accent)]/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md animate-slide-up">
        <div className="glass-panel p-8 rounded-2xl border border-[rgba(255,255,255,0.05)] shadow-2xl relative z-10">
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Chào mừng trở lại!</h1>
            <p className="text-[var(--color-text-muted)] text-sm">
              Đăng nhập để tiếp tục khám phá EduMarket
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Email"
              placeholder="example@gmail.com"
              icon={<Mail className="w-5 h-5" />}
              type="email"
              {...register('email')}
              error={errors.email?.message}
            />

            <Input
              label="Mật khẩu"
              placeholder="••••••••"
              icon={<Lock className="w-5 h-5" />}
              type="password"
              {...register('password')}
              error={errors.password?.message}
            />

            <div className="flex items-center justify-end text-sm">
              <Link href="#" className="text-[var(--color-primary)] hover:text-[var(--color-accent)] transition-colors">
                Quên mật khẩu?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full mt-2"
              loading={isLoading}
              icon={<LogIn className="w-5 h-5" />}
            >
              Đăng nhập
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-[var(--color-text-muted)]">
            Chưa có tài khoản?{' '}
            <Link href="/register" className="text-white hover:text-[var(--color-primary)] font-medium transition-colors">
              Đăng ký ngay
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
