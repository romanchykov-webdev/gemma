'use client';

import { CategoryWithProducts } from '@/lib';
import { useProductsStore } from '@/store';
import React, { useEffect } from 'react';
import { ProductsGroupList } from './products-group-list';
import { TopBar } from './top-bar';

interface ClientProductsWrapperProps {
  allCategories: CategoryWithProducts[];
  showTopBar?: boolean;
}

export const ClientProductsWrapper: React.FC<ClientProductsWrapperProps> = ({
  allCategories,
  showTopBar = false,
}) => {
  const { filteredCategories, isHydrated, setAllCategories } = useProductsStore();

  // ✅ Гидратация стора при монтировании
  useEffect(() => {
    if (!isHydrated && allCategories.length > 0) {
      setAllCategories(allCategories);
    }
  }, [allCategories, isHydrated, setAllCategories]);

  // ✅ Для первого рендера используем SSR данные (пока стор не готов)
  const categories = isHydrated ? filteredCategories : allCategories;

  // Вычисляем индекс первой категории с продуктами
  const firstCategoryWithProductsIndex = categories.findIndex(cat => cat.products.length > 0);

  // Если нужно отрисовать TopBar
  if (showTopBar) {
    // return <TopBar categories={categories.filter(c => c.products.length > 0)} />;
    return <TopBar categories={categories} />;
  }

  // Отрисовка списка продуктов
  return (
    <div className="flex flex-col gap-16">
      {categories.map((category, categoryIndex) => {
        const isFirstCategory = categoryIndex === firstCategoryWithProductsIndex;

        return (
          category.products.length > 0 && (
            <article id={`category-${category.id}`} key={category.id}>
              <ProductsGroupList
                categoryId={category.id}
                title={category.name}
                items={category.products}
                isFirstCategory={isFirstCategory}
              />
            </article>
          )
        );
      })}
    </div>
  );
};
