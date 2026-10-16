import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { FileQuestion, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="glass-panel p-10 md:p-16 rounded-3xl text-center max-w-lg w-full border border-[rgba(255,255,255,0.05)] relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-[var(--color-primary)]/20 rounded-full blur-[60px]" />
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-[var(--color-accent)]/20 rounded-full blur-[60px]" />
        
        <div className="relative z-10">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-accent)]/20 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-[var(--color-primary)]/10 border border-[rgba(255,255,255,0.1)]">
            <FileQuestion className="w-12 h-12 text-[var(--color-primary)] animate-pulse" />
          </div>
          
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-4">
            404
          </h1>
          <h2 className="text-2xl font-bold text-white mb-4">
            Không tìm thấy trang
          </h2>
          
          <p className="text-[var(--color-text-muted)] mb-8 text-lg">
            Đường dẫn bạn truy cập có thể đã bị thay đổi, xóa bỏ hoặc không tồn tại.
          </p>
          
          <Link href="/">
            <Button size="lg" className="w-full sm:w-auto px-8" icon={<Home className="w-5 h-5" />}>
              Về Trang chủ
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
