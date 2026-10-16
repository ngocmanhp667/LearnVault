import React from 'react';
import { useRouter } from 'next/navigation';
import { Material } from '../../types';
import { formatCurrency, truncateText } from '../../lib/utils';
import { FileText, User } from 'lucide-react';

interface MaterialCardProps {
  material: Material;
}

export const MaterialCard: React.FC<MaterialCardProps> = ({ material }) => {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/materials/${material.id}`);
  };

  const handleSellerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (material.provider_id) {
      router.push(`/profile/${material.provider_id}`);
    }
  };

  return (
    <div 
      onClick={handleCardClick}
      className="block h-full cursor-pointer"
    >
      <div className="glass-panel glass-panel-hover rounded-xl overflow-hidden h-full flex flex-col group transition-all duration-300">
        {/* Thumbnail */}
        <div className="relative aspect-video w-full bg-[var(--color-bg-base)] flex items-center justify-center overflow-hidden border-b border-[rgba(255,255,255,0.05)]">
          {material.thumbnail_url ? (
            <img 
              src={material.thumbnail_url} 
              alt={material.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[var(--color-bg-elevated)] to-[var(--color-bg-base)] flex items-center justify-center">
              <FileText className="w-12 h-12 text-[var(--color-text-muted)] opacity-50" />
            </div>
          )}
          
          {/* Format Badge */}
          <div className="absolute top-3 right-3 bg-[var(--color-bg-base)]/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-[rgba(255,255,255,0.1)] text-xs font-medium text-white uppercase shadow-lg">
            {material.file_format}
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          <h3 className="font-semibold text-lg text-white mb-2 line-clamp-2 group-hover:text-[var(--color-primary)] transition-colors">
            {material.title}
          </h3>
          
          <p className="text-sm text-[var(--color-text-muted)] mb-4 flex-1">
            {truncateText(material.description, 80)}
          </p>

          <div className="flex items-center justify-between mt-auto pt-4 border-t border-[rgba(255,255,255,0.05)]">
            <div 
              onClick={handleSellerClick}
              className="flex items-center gap-2 hover:text-[var(--color-primary)] transition-colors group/seller"
            >
              <div className="w-6 h-6 rounded-full bg-[var(--color-bg-elevated)] flex items-center justify-center border border-[rgba(255,255,255,0.1)] group-hover/seller:border-[var(--color-primary)]/50">
                <User className="w-3 h-3 text-[var(--color-text-muted)] group-hover/seller:text-[var(--color-primary)]" />
              </div>
              <span className="text-xs text-[var(--color-text-muted)] group-hover/seller:text-[var(--color-primary)]">
                {material.provider?.username || 'Người bán'}
              </span>
            </div>
            
            <div className="font-bold text-gradient">
              {material.price === 0 ? 'Miễn phí' : formatCurrency(material.price)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
