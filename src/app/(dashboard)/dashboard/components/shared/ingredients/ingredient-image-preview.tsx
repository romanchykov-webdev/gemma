'use client';

import { cn } from '@/lib/utils';
import { ImageIcon } from 'lucide-react';
import Image from 'next/image';
import React from 'react';

interface Props {
  imageUrl?: string;
  alt?: string;
  className?: string;
}

export const IngredientImagePreview: React.FC<Props> = ({ imageUrl, alt = '', className }) => {
  return (
    <div
      className={cn(
        'w-full h-32 bg-gray-100 flex items-center justify-center overflow-hidden',
        className,
      )}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={alt || 'Ingredient preview'}
          width={128}
          height={128}
          className="w-full h-full object-cover"
          onError={e => {
            e.currentTarget.style.display = 'none';
          }}
        />
      ) : (
        <ImageIcon className="w-12 h-12 text-gray-400" />
      )}
    </div>
  );
};
