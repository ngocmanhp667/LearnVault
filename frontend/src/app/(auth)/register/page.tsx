'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Mail, Lock, UserPlus, User } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const registerSchema = z.object({
  username: z.string().min(3, 'Tên đăng nhập phải từ 3 ký tự trở lên'),
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải từ 6 ký tự trở lên'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu nhập lại không khớp",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      await api.post('/auth/register', {
        username: data.username,
        email: data.email,
        password: data.password,
      });
      
      toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
      router.push('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Đăng ký thất bại. Email hoặc Username có thể đã tồn tại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-20 px-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-[var(--color-primary)]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-[var(--color-accent)]/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md animate-slide-up">
        <div className="glass-panel p-8 rounded-2xl border border-[rgba(255,255,255,0.05)] shadow-2xl relative z-10">
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Tạo tài khoản</h1>
            <p className="text-[var(--color-text-muted)] text-sm">
              Tham gia cộng đồng EduMarket để mua bán tài liệu
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Tên hiển thị (Username)"
              placeholder="Ví dụ: student99"
              icon={<User className="w-5 h-5" />}
              {...register('username')}
              error={errors.username?.message}
            />

            <Input
              label="Email"
              placeholder="example@student.edu.vn"
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

            <Input
              label="Xác nhận mật khẩu"
              placeholder="••••••••"
              icon={<Lock className="w-5 h-5" />}
              type="password"
              {...register('confirmPassword')}
              error={errors.confirmPassword?.message}
            />

            <Button
              type="submit"
              className="w-full mt-6"
              loading={isLoading}
              icon={<UserPlus className="w-5 h-5" />}
            >
              Đăng ký
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-[var(--color-text-muted)]">
            Đã có tài khoản?{' '}
            <Link href="/login" className="text-white hover:text-[var(--color-primary)] font-medium transition-colors">
              Đăng nhập
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
