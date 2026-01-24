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

  // ✅ Плавная прокрутка с использованием встроенного scroll-behavior: smooth
  const handleCategoryClick = (categoryName: string) => {
    const element = document.getElementById(categoryName);
    if (element) {
      // Используем scrollIntoView - он автоматически учитывает scrollMarginTop!
      element.scrollIntoView({
        behavior: 'smooth', // плавная прокрутка (уже настроена в CSS)
        block: 'start', // прокрутить к началу элемента
      });
    }
  };

  return (
    <div className={cn('inline-flex gap-1 bg-gray-50 p-1 rounded-2xl', className)}>
      {items.map(category => (
        <button
          key={category.id}
          className={cn(
            'flex items-center font-bold h-11 rounded-2xl px-5 hover:text-brand-primary md:text-sm',
            activeId === category.id && 'bg-white shadow-md shadow-gray-200 text-brand-primary',
          )}
          onClick={() => handleCategoryClick(category.name)}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
};
