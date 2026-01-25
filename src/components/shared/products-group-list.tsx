'use client';

import React, { RefObject, useEffect, useRef } from 'react';
import { useIntersection } from 'react-use';

import { cn } from '@/lib/utils';
import { useCategoryStore } from '@/store/category';

import { ProductWithRelations } from '../../../@types/prisma';
import { ProductCard } from './product-card';
import { Title } from './title';

interface Props {
  title: string;

  items: ProductWithRelations[];
  categoryId: number;
  className?: string;
  isFirstCategory?: boolean; // ✅ Для оптимизации грузим первые 3 изображения сразу
}

export const ProductsGroupList: React.FC<Props> = ({
  title,
  items,
  categoryId,
  className,
  isFirstCategory = false,
}) => {
  //
  const HEADER_OFFSET = 100; // высота sticky-зоны (TopBar + отступы)

  // console.log("ProductsGroupList items", items);

  const setActiveCategoryId = useCategoryStore(state => state.setActiveId);

  // ✅ Достаем методы для работы с refs
  const registerRef = useCategoryStore(state => state.registerRef);
  const unregisterRef = useCategoryStore(state => state.unregisterRef);

  const intersectionRef = useRef<HTMLDivElement>(null);

  const intersection = useIntersection(intersectionRef as RefObject<HTMLElement>, {
    root: null,
    rootMargin: `-${HEADER_OFFSET}px 0px -60% 0px`,
    threshold: [0, 0.1, 0.25, 0.5],
  });

  // ✅ Регистрируем ref в сторе при монтировании
  useEffect(() => {
    if (intersectionRef.current) {
      registerRef(categoryId, intersectionRef as RefObject<HTMLElement>);
    }

    // Очищаем при размонтировании
    return () => {
      unregisterRef(categoryId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId]);

  // Отслеживание видимости для активной категории
  useEffect(() => {
    if (intersection?.isIntersecting) {
      setActiveCategoryId(categoryId);
    }
  }, [categoryId, intersection?.isIntersecting, setActiveCategoryId]);

  return (
    <div
      className={className}
      // id={title}
      ref={intersectionRef}
      style={{ scrollMarginTop: '120px' }}
    >
      <Title text={title} size="lg" className="font-extrabold mb-5" />

      <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4')}>
        {items
          .filter(product => product.items.length > 0)
          .map((product, index) => {
            const minPriceItem = product.items.reduce((min, item) =>
              item.price < min.price ? item : min,
            );
            const hasPriority = isFirstCategory && index < 3;

            return (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                imageUrl={product.imageUrl}
                price={minPriceItem.price}
                ingredients={product.ingredients}
                itemId={minPriceItem.id}
                baseIngredients={product.baseIngredients}
                size={minPriceItem.size?.value ?? null}
                type={minPriceItem.type?.value ?? null}
                priority={hasPriority}
              />
            );
          })}
      </div>
    </div>
  );
};
