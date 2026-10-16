'use client';

import React, { useState, useEffect } from 'react';
import { StarRating } from './StarRating';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api';
import { Button } from '../ui/Button';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

interface ReviewSectionProps {
  materialId: string;
}

export const ReviewSection: React.FC<ReviewSectionProps> = ({ materialId }) => {
  const { user, isLoggedIn } = useAuthStore();
  const [reviews, setReviews] = useState<any[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await api.get(`/material-reviews/${materialId}`);
        setReviews(res.data.data);
        setAverageRating(res.data.averageRating);
        setTotalReviews(res.data.totalReviews);
      } catch (error) {
        console.error('Lỗi tải đánh giá', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [materialId]);

  useEffect(() => {
    const checkPurchase = async () => {
      if (!isLoggedIn) return;
      try {
        const res = await api.get('/users/me/purchases');
        const purchases = res.data.data;
        const bought = purchases.some((p: any) => p.material_id === materialId);
        setHasPurchased(bought);
      } catch (error) {
        console.error('Lỗi kiểm tra mua hàng', error);
      }
    };
    
    checkPurchase();
  }, [isLoggedIn, materialId]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.post('/material-reviews', {
        materialId,
        rating,
        comment
      });
      toast.success('Gửi đánh giá thành công');
      
      // Cập nhật state
      const newReview = res.data.data;
      setReviews([newReview, ...reviews]);
      setTotalReviews(totalReviews + 1);
      setAverageRating(((averageRating * totalReviews) + rating) / (totalReviews + 1));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi gửi đánh giá');
    } finally {
      setIsSubmitting(false);
    }
  };

  const userReview = reviews.find(r => r.user_id === user?.id);

  if (isLoading) {
    return <div className="animate-pulse h-32 bg-[rgba(255,255,255,0.05)] rounded-2xl" />;
  }

  return (
    <div className="mt-12 glass-panel p-8 rounded-2xl border border-[rgba(255,255,255,0.05)]">
      <h3 className="text-2xl font-bold text-white mb-8">Đánh giá từ người mua</h3>
      
      <div className="flex flex-col md:flex-row gap-8 mb-10">
        <div className="flex-shrink-0 text-center flex flex-col items-center justify-center p-6 bg-[var(--color-bg-elevated)] rounded-xl border border-[rgba(255,255,255,0.05)] min-w-[200px]">
          <div className="text-5xl font-bold text-white mb-2">{averageRating.toFixed(1)}</div>
          <StarRating rating={averageRating} />
          <div className="text-[var(--color-text-muted)] text-sm mt-2">{totalReviews} đánh giá</div>
        </div>

        <div className="flex-1 w-full">
          {!isLoggedIn ? (
            <div className="p-6 bg-[rgba(255,255,255,0.02)] rounded-xl text-center h-full flex flex-col justify-center items-center">
              <p className="text-[var(--color-text-muted)] mb-4">Bạn cần đăng nhập và mua học liệu để đánh giá.</p>
            </div>
          ) : !hasPurchased ? (
            <div className="p-6 bg-[rgba(255,255,255,0.02)] rounded-xl text-center h-full flex flex-col justify-center items-center">
              <p className="text-[var(--color-text-muted)]">Chỉ người đã mua mới có thể đánh giá học liệu này.</p>
            </div>
          ) : userReview ? (
            <div className="p-6 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 rounded-xl h-full flex flex-col justify-center">
              <p className="text-white font-medium mb-2">Bạn đã đánh giá học liệu này</p>
              <StarRating rating={userReview.rating} size="sm" />
              {userReview.comment && <p className="text-[var(--color-text-muted)] text-sm mt-2">"{userReview.comment}"</p>}
            </div>
          ) : (
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <h4 className="font-semibold text-white">Viết đánh giá của bạn</h4>
              <StarRating rating={rating} interactive onChange={setRating} />
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full rounded-lg bg-[var(--color-bg-elevated)] border border-[rgba(255,255,255,0.05)] text-white px-4 py-3 min-h-[100px] outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
                placeholder="Chia sẻ cảm nhận của bạn về tài liệu này..."
              />
              <Button type="submit" loading={isSubmitting}>Gửi đánh giá</Button>
            </form>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review.id} className="pb-6 border-b border-[rgba(255,255,255,0.05)] last:border-0 last:pb-0">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-bg-elevated)] flex items-center justify-center font-bold text-[var(--color-primary)]">
                    {review.user?.username?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{review.user?.username}</div>
                    <div className="text-xs text-[var(--color-text-muted)]">{formatDate(review.created_at)}</div>
                  </div>
                </div>
                <StarRating rating={review.rating} size="sm" />
              </div>
              {review.comment && (
                <p className="text-[var(--color-text-muted)] text-sm ml-13 whitespace-pre-line pl-13">
                  {review.comment}
                </p>
              )}
              {review.seller_reply && (
                <div className="mt-4 ml-13 pl-4 border-l-2 border-[var(--color-primary)] bg-[var(--color-bg-elevated)] p-3 rounded-r-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-[var(--color-primary)]">Phản hồi từ Tác giả</span>
                    <span className="text-xs text-[var(--color-text-muted)]">{formatDate(review.replied_at)}</span>
                  </div>
                  <p className="text-sm text-white whitespace-pre-line">{review.seller_reply}</p>
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-center text-[var(--color-text-muted)] py-10">
            Chưa có đánh giá nào cho học liệu này.
          </p>
        )}
      </div>
    </div>
  );
};
