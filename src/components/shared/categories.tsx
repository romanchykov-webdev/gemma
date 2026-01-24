'use client';
import { CategoryWithProducts } from '@/lib';
import { cn } from '@/lib/utils';
import { useCategoryStore } from '@/store/category';

import React, { JSX } from 'react';

interface ICategoriesProps {
  // items: Category[];
  items: CategoryWithProducts[];
  className?: string;
  showCount?: boolean;
}

export const Categories: React.FC<ICategoriesProps> = ({
  items,
  className,
  showCount = false,
}): JSX.Element => {
  const activeId = useCategoryStore(state => state.activeId);

  console.log('showCount', showCount);

  // ✅ Плавная прокрутка с использованием встроенного scroll-behavior: smooth
  const handleCategoryClick = (category: CategoryWithProducts) => {
    if (category.products.length === 0) return;

    const element = document.getElementById(category.name);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  return (
    <div className={cn('inline-flex gap-1 bg-gray-50 p-1 rounded-2xl', className)}>
      {items.map(category => {
        // 🔥 вычисление состояния
        const isEmpty = category.products.length === 0;
        const productsCount = category.products.length;

        return (
          <button
            key={category.id}
            disabled={isEmpty}
            className={cn(
              'flex items-center font-bold h-11 rounded-2xl px-5 transition-all duration-200 relative',
              isEmpty // 🔥 стили для пустых категорий
                ? 'opacity-40 cursor-not-allowed text-gray-400'
                : 'hover:text-brand-primary md:text-sm',
              activeId === category.id &&
                !isEmpty &&
                'bg-white shadow-md shadow-gray-200 text-brand-primary',
            )}
            onClick={() => handleCategoryClick(category)}
          >
            <span>{category.name}</span>

            {/* 🔥 счётчик товаров */}
            {isEmpty && (
              <span
                className={cn(
                  'ml-1.5 text-xs opacity-60 font-normal absolute -right-1 -top-1',
                  'bg-brand-primary text-black',
                  'p-1 rounded-full w-5 h-5 flex items-center justify-center',
                )}
              >
                {productsCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
