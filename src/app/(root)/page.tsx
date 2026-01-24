import {
  CartButtonSticky,
  Container,
  FilterDrawer,
  SkeletonFollbackFilters,
  SkeletonFollbackTopBar,
  Stories,
  Title,
} from '@/components/shared';
import { Suspense } from 'react';

import { ClientProductsWrapper } from '@/components/shared/client-products-wrapper';
import { LazyFilters } from '@/components/shared/lazy-filters';
import { StructuredData } from '@/components/shared/structured-data';
import { Skeleton } from '@/components/ui';
import { findAllPizzas } from '@/lib';

// ✅ SEO: импорт metadata из отдельного файла
export { generateMetadata } from './metadata';

// ✅ Кеширование главной страницы
export const revalidate = false;

export default async function Home() {
  // ✅ Загружаем ВСЕ данные без фильтров
  const allCategories = await findAllPizzas();

  return (
    <>
      <StructuredData
        products={allCategories.flatMap(cat => cat.products)}
        categories={allCategories}
      />
      <Container className="mt-10 flex items-center justify-between relative">
        <Title text="Tutte le pizze" size="lg" className="font-extrabold" />

        {/* Фильтрация на мобильных устройствах */}
        <Suspense fallback={<Skeleton className="w-10 h-10 rounded-sm bg-gray-200" />}>
          <FilterDrawer />
        </Suspense>
      </Container>

      {/* TopBar с категориями - управляется клиентским компонентом */}
      <Suspense fallback={<SkeletonFollbackTopBar count={6} />}>
        <ClientProductsWrapper allCategories={allCategories} showTopBar />
      </Suspense>

      <Stories />

      <Container className="mt-10 pb-16">
        <div className="flex gap-[80px]">
          {/* Фильтрация на десктопах */}
          <div className="w-[250px] hidden lg:block relative">
            <Suspense
              fallback={
                <SkeletonFollbackFilters
                  countSizes={2}
                  countPizzaTypes={3}
                  countIngredients={4}
                  className="absolute top-0 left-0"
                />
              }
            >
              <LazyFilters />
            </Suspense>
          </div>

          {/* Список товаров - управляется ClientProductsWrapper */}
          <div className="flex-1">
            <ClientProductsWrapper allCategories={allCategories} />
          </div>
        </div>

        {/* кнопка корзины для мобильных устройств */}
        <CartButtonSticky />
      </Container>
    </>
  );
}
