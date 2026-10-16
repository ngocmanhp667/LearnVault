'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../ui/Button';
import { LogOut, User, Menu, Wallet } from 'lucide-react';
import { NotificationDropdown } from '../shared/NotificationDropdown';

export const Header = () => {
  const pathname = usePathname();
  const { isLoggedIn, user, logout } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const navLinks = [
    { href: '/', label: 'Trang chủ' },
    { href: '/materials', label: 'Học liệu' },
  ];

  if (isLoggedIn) {
    navLinks.push({ href: '/dashboard', label: 'Dashboard' });
    navLinks.push({ href: '/wallet', label: 'Ví tiền' });
    navLinks.push({ href: '/materials/create', label: 'Đăng bán' });
    navLinks.push({ href: '/seller/dashboard', label: 'Kênh Người Bán' });
    navLinks.push({ href: '/support', label: 'Hỗ trợ' });
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[rgba(255,255,255,0.05)] bg-[var(--color-bg-base)]/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold text-gradient">EduMarket</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-white ${
                pathname === link.href ? 'text-white' : 'text-[var(--color-text-muted)]'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-4">
          {!isLoggedIn ? (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">Đăng nhập</Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="sm">Đăng ký</Button>
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <NotificationDropdown />
              <Link href="/profile">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center text-white font-semibold cursor-pointer">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
              </Link>
              {user?.role === 'Admin' && (
                <Link href="/admin">
                  <Button variant="outline" size="sm">Admin</Button>
                </Link>
              )}
              <Button variant="ghost" size="sm" onClick={logout} icon={<LogOut className="w-4 h-4" />}>
                Thoát
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden p-2 text-[var(--color-text-muted)]"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-[var(--color-bg-elevated)] border-b border-[rgba(255,255,255,0.05)] p-4 animate-slide-up">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="text-sm font-medium text-white"
              >
                {link.label}
              </Link>
            ))}
            {!isLoggedIn ? (
              <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-[rgba(255,255,255,0.05)]">
                <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" className="w-full">Đăng nhập</Button>
                </Link>
                <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="primary" className="w-full">Đăng ký</Button>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-[rgba(255,255,255,0.05)]">
                <Link href="/profile" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 text-sm text-white">
                  <User className="w-4 h-4" /> Hồ sơ cá nhân
                </Link>
                <Link href="/wallet" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 text-sm text-white">
                  <Wallet className="w-4 h-4" /> Ví tiền
                </Link>
                <Button variant="ghost" className="w-full justify-start px-0" onClick={() => { logout(); setIsMenuOpen(false); }}>
                  <LogOut className="w-4 h-4 mr-2" /> Đăng xuất
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};
