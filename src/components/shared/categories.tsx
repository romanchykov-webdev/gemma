'use client';
import { cn } from '@/lib/utils';
import { useCategoryStore } from '@/store/category';
import { Category } from '@prisma/client';
import React, { JSX } from 'react';

interface ICategoriesProps {
  items: Category[];
  className?: string;
}

export const Categories: React.FC<ICategoriesProps> = ({ items, className }): JSX.Element => {
  const activeId = useCategoryStore(state => state.activeId);

  return (
    <div className={cn('inline-flex gap-1 bg-gray-50 p-1 rounded-2xl', className)}>
      {items.map(category => (
        <a
          key={category.id}
          className={cn(
            'flex items-center font-bold h-11 rounded-2xl px-5 hover:text-[#FE5F00] md:text-sm',
            activeId === category.id && 'bg-white shadow-md shadow-gray-200 text-[#FE5F00]',
          )}
          href={`/#${category.name}`}
        >
          {category.name}
        </a>
      ))}
    </div>
  );
};
