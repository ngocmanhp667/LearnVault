'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api';
import { Wallet, ArrowDownCircle, ArrowUpCircle, Clock, Plus, Minus, RefreshCw } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function WalletPage() {
  const { user, isLoggedIn } = useAuthStore();
  const router = useRouter();

  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [amount, setAmount] = useState('');

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    fetchWalletData();
  }, [isLoggedIn, router]);

  const fetchWalletData = async () => {
    setLoading(true);
    try {
      const [walletRes, txRes] = await Promise.all([
        api.get('/wallet'),
        api.get('/wallet/transactions')
      ]);
      setBalance(Number(walletRes.data.data?.balance || 0));
      setTransactions(txRes.data.data || []);
    } catch (error) {
      toast.error('Lỗi khi tải dữ liệu ví');
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      toast.error('Vui lòng nhập số tiền hợp lệ');
      return;
    }
    setActionLoading(true);
    try {
      await api.post('/wallet/deposit', { amount: numAmount });
      toast.success(`Nạp ${formatCurrency(numAmount)} thành công!`);
      setShowDepositModal(false);
      setAmount('');
      fetchWalletData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Nạp tiền thất bại');
    } finally {
      setActionLoading(false);
    }
  };

  const handleWithdraw = async () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      toast.error('Vui lòng nhập số tiền hợp lệ');
      return;
    }
    if (numAmount > balance) {
      toast.error('Số dư không đủ');
      return;
    }
    setActionLoading(true);
    try {
      await api.post('/wallet/withdraw', { amount: numAmount });
      toast.success(`Rút ${formatCurrency(numAmount)} thành công!`);
      setShowWithdrawModal(false);
      setAmount('');
      fetchWalletData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Rút tiền thất bại');
    } finally {
      setActionLoading(false);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'DEPOSIT': return { label: 'Nạp tiền', icon: <ArrowDownCircle className="w-4 h-4" />, color: 'text-green-400' };
      case 'WITHDRAWAL': return { label: 'Rút tiền', icon: <ArrowUpCircle className="w-4 h-4" />, color: 'text-red-400' };
      case 'PAYMENT': return { label: 'Thanh toán', icon: <ArrowUpCircle className="w-4 h-4" />, color: 'text-orange-400' };
      case 'EARNING': return { label: 'Thu nhập', icon: <ArrowDownCircle className="w-4 h-4" />, color: 'text-emerald-400' };
      default: return { label: type, icon: <Clock className="w-4 h-4" />, color: 'text-gray-400' };
    }
  };

  if (!isLoggedIn) return null;

  const quickAmounts = [50000, 100000, 200000, 500000];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center">
          <Wallet className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Ví điện tử</h1>
          <p className="text-[var(--color-text-muted)] text-sm">Quản lý số dư và giao dịch của bạn</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--color-primary)]" />
        </div>
      ) : (
        <div className="space-y-6 animate-slide-up">
          {/* Balance Card */}
          <div className="glass-panel p-8 rounded-2xl border border-[rgba(255,255,255,0.08)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-primary)]/5 rounded-full blur-[80px] pointer-events-none" />
            <p className="text-[var(--color-text-muted)] text-sm mb-1">Số dư hiện tại</p>
            <div className="text-4xl font-bold text-white mb-6">
              {formatCurrency(balance)}
            </div>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => { setShowDepositModal(true); setAmount(''); }}
                className="flex items-center gap-2 px-5 py-2.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-xl font-medium text-sm transition-colors"
              >
                <Plus className="w-4 h-4" /> Nạp tiền
              </button>
              <button
                onClick={() => { setShowWithdrawModal(true); setAmount(''); }}
                className="flex items-center gap-2 px-5 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl font-medium text-sm transition-colors"
              >
                <Minus className="w-4 h-4" /> Rút tiền
              </button>
              <button
                onClick={fetchWalletData}
                className="flex items-center gap-2 px-5 py-2.5 bg-[var(--color-bg-elevated)] hover:bg-[rgba(255,255,255,0.1)] text-[var(--color-text-muted)] rounded-xl font-medium text-sm transition-colors"
              >
                <RefreshCw className="w-4 h-4" /> Làm mới
              </button>
            </div>
          </div>

          {/* Transaction History */}
          <div className="glass-panel rounded-2xl border border-[rgba(255,255,255,0.05)] overflow-hidden">
            <div className="p-6 border-b border-[rgba(255,255,255,0.05)]">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-[var(--color-primary)]" />
                Lịch sử giao dịch
              </h3>
            </div>

            {transactions.length === 0 ? (
              <div className="p-12 text-center text-[var(--color-text-muted)]">
                <Wallet className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Chưa có giao dịch nào</p>
              </div>
            ) : (
              <div className="divide-y divide-[rgba(255,255,255,0.05)]">
                {transactions.map((tx) => {
                  const typeInfo = getTypeLabel(tx.type);
                  const isIncome = tx.type === 'DEPOSIT' || tx.type === 'EARNING';
                  return (
                    <div key={tx.id} className="px-6 py-4 flex items-center justify-between hover:bg-[var(--color-bg-elevated)]/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center ${isIncome ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                          <span className={typeInfo.color}>{typeInfo.icon}</span>
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{typeInfo.label}</p>
                          <p className="text-[var(--color-text-muted)] text-xs">{tx.description || '—'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold text-sm ${isIncome ? 'text-green-400' : 'text-red-400'}`}>
                          {isIncome ? '+' : '-'}{formatCurrency(Number(tx.amount))}
                        </p>
                        <p className="text-xs text-[var(--color-text-muted)]">{formatDate(tx.created_at)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowDepositModal(false)}>
          <div className="glass-panel p-6 rounded-2xl border border-[rgba(255,255,255,0.1)] w-full max-w-md animate-slide-up" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-white mb-4">Nạp tiền vào ví</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-[var(--color-text-muted)] mb-1 block">Số tiền (VNĐ)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Nhập số tiền..."
                  className="w-full bg-[var(--color-bg-base)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-primary)] text-lg"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {quickAmounts.map(q => (
                  <button key={q} onClick={() => setAmount(String(q))}
                    className="px-3 py-1.5 bg-[var(--color-bg-elevated)] hover:bg-[rgba(255,255,255,0.1)] text-sm text-[var(--color-text-muted)] hover:text-white rounded-lg transition-colors border border-[rgba(255,255,255,0.05)]">
                    {formatCurrency(q)}
                  </button>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowDepositModal(false)} className="flex-1 py-3 bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] rounded-xl font-medium hover:bg-[rgba(255,255,255,0.1)] transition-colors">
                  Hủy
                </button>
                <button onClick={handleDeposit} disabled={actionLoading}
                  className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50">
                  {actionLoading ? 'Đang xử lý...' : 'Xác nhận nạp'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowWithdrawModal(false)}>
          <div className="glass-panel p-6 rounded-2xl border border-[rgba(255,255,255,0.1)] w-full max-w-md animate-slide-up" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-white mb-4">Rút tiền từ ví</h3>
            <p className="text-sm text-[var(--color-text-muted)] mb-4">Số dư hiện tại: <span className="text-white font-medium">{formatCurrency(balance)}</span></p>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-[var(--color-text-muted)] mb-1 block">Số tiền (VNĐ)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Nhập số tiền muốn rút..."
                  className="w-full bg-[var(--color-bg-base)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-primary)] text-lg"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowWithdrawModal(false)} className="flex-1 py-3 bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] rounded-xl font-medium hover:bg-[rgba(255,255,255,0.1)] transition-colors">
                  Hủy
                </button>
                <button onClick={handleWithdraw} disabled={actionLoading}
                  className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50">
                  {actionLoading ? 'Đang xử lý...' : 'Xác nhận rút'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
