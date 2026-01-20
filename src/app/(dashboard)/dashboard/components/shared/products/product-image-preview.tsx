'use client';

import { cn } from '@/lib/utils';
import { ImageIcon } from 'lucide-react';
import React from 'react';

interface Props {
  imageUrl?: string;
  alt?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ProductImagePreview: React.FC<Props> = ({
  imageUrl,
  alt = '',
  className,
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  return (
    <div
      className={cn(
        'bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0',
        sizeClasses[size],
        className,
      )}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={alt}
          className="w-full h-full object-cover"
          onError={e => {
            e.currentTarget.style.display = 'none';
          }}
        />
      ) : (
        <ImageIcon className="w-8 h-8 text-gray-400" />
      )}
    </div>
  );
};
