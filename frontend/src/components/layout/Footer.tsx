import React from 'react';
import Link from 'next/link';
import { Globe, Send, MessageCircle } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-[var(--color-bg-base)] border-t border-[rgba(255,255,255,0.05)] pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <span className="text-2xl font-bold text-gradient">EduMarket</span>
            </Link>
            <p className="text-[var(--color-text-muted)] text-sm leading-relaxed">
              Nền tảng C2C giúp sinh viên dễ dàng trao đổi, mua bán tài liệu học tập và nhận đề xuất khóa học thông minh qua AI.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Khám phá</h3>
            <ul className="space-y-3">
              <li><Link href="/materials" className="text-sm text-[var(--color-text-muted)] hover:text-white transition-colors">Tất cả học liệu</Link></li>
              <li><Link href="/materials?tags=cntt" className="text-sm text-[var(--color-text-muted)] hover:text-white transition-colors">Công nghệ thông tin</Link></li>
              <li><Link href="/materials?tags=kinhte" className="text-sm text-[var(--color-text-muted)] hover:text-white transition-colors">Kinh tế</Link></li>
              <li><Link href="/materials?tags=ngoaingu" className="text-sm text-[var(--color-text-muted)] hover:text-white transition-colors">Ngoại ngữ</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">Hỗ trợ</h3>
            <ul className="space-y-3">
              <li><Link href="#" className="text-sm text-[var(--color-text-muted)] hover:text-white transition-colors">Trung tâm trợ giúp</Link></li>
              <li><Link href="#" className="text-sm text-[var(--color-text-muted)] hover:text-white transition-colors">Hướng dẫn thanh toán</Link></li>
              <li><Link href="#" className="text-sm text-[var(--color-text-muted)] hover:text-white transition-colors">Điều khoản dịch vụ</Link></li>
              <li><Link href="#" className="text-sm text-[var(--color-text-muted)] hover:text-white transition-colors">Chính sách bảo mật</Link></li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="text-white font-semibold mb-4">Kết nối</h3>
            <div className="flex gap-4 mb-6">
              <a href="#" className="w-10 h-10 rounded-full bg-[var(--color-bg-elevated)] flex items-center justify-center text-[var(--color-text-muted)] hover:bg-[var(--color-primary)] hover:text-white transition-all">
                <MessageCircle className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-[var(--color-bg-elevated)] flex items-center justify-center text-[var(--color-text-muted)] hover:bg-[var(--color-primary)] hover:text-white transition-all">
                <Send className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-[var(--color-bg-elevated)] flex items-center justify-center text-[var(--color-text-muted)] hover:bg-[var(--color-primary)] hover:text-white transition-all">
                <Globe className="w-5 h-5" />
              </a>
            </div>
            <p className="text-sm text-[var(--color-text-muted)]">
              Liên hệ: support@edumarket.vn
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-[rgba(255,255,255,0.05)] text-center">
          <p className="text-sm text-[var(--color-text-muted)]">
            © {new Date().getFullYear()} EduMarket. Mọi quyền được bảo lưu.
          </p>
        </div>
      </div>
    </footer>
  );
};
