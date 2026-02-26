import { ChooseProductModal } from '@/components/shared/modals/choose-product-modal';

import { enrichProductData } from '@/lib';
import { getReferences } from '@/lib/enrich-product';
import { notFound } from 'next/navigation';
import { prisma } from '../../../../../../prisma/prisma-client';

export async function generateStaticParams() {
  const products = await prisma.product.findMany({
    select: { id: true },
  });

  return products.map(product => ({
    id: product.id.toString(),
  }));
}

export const dynamic = 'force-static';
export const dynamicParams = false;

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductModalPage({ params }: ProductPageProps) {
  const { id } = await params;

  // ✅ Загружаем данные параллельно
  const [productData, references] = await Promise.all([
    prisma.product.findFirst({
      where: { id: Number(id) },
      select: {
        id: true,
        name: true,
        imageUrl: true,
        categoryId: true,
        baseIngredients: true,
        variants: true,
        addableIngredientIds: true,
      },
    }),
    getReferences(), // ✅ Кешируется через React.cache
  ]);

  if (!productData) {
    return notFound();
  }

  // ✅ Обогащаем данные продукта для UI
  const product = enrichProductData(
    productData,
    references.ingredients,
    references.sizes,
    references.types,
  );

  return <ChooseProductModal product={product} />;
}
