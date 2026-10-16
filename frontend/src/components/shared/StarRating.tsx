import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxStars = 5,
  size = 'md',
  interactive = false,
  onChange
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClass = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-8 h-8'
  }[size];

  return (
    <div className="flex items-center gap-1">
      {[...Array(maxStars)].map((_, i) => {
        const starValue = i + 1;
        const isFilled = interactive
          ? starValue <= (hoverRating || rating)
          : starValue <= Math.round(rating);

        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            className={`transition-colors ${interactive ? 'cursor-pointer' : 'cursor-default'}`}
            onMouseEnter={() => interactive && setHoverRating(starValue)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            onClick={() => interactive && onChange && onChange(starValue)}
          >
            <Star
              className={`${sizeClass} ${isFilled ? 'text-amber-400 fill-amber-400' : 'text-[rgba(255,255,255,0.2)]'}`}
            />
          </button>
        );
      })}
    </div>
  );
};
