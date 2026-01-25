import { Container, ProductFormClient } from '@/components/shared';
import { enrichProductData, getReferences } from '@/lib/enrich-product';
import { ReplyIcon } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '../../../../../prisma/prisma-client';

// ✅ Генерируем статические страницы для всех продуктов
export async function generateStaticParams() {
  const products = await prisma.product.findMany({
    select: { id: true },
  });

  return products.map(product => ({
    id: product.id.toString(),
  }));
}

// ✅ Унифицированные настройки с модальным окном
export const dynamic = 'force-static';
export const revalidate = false;

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
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
    getReferences(),
  ]);

  if (!productData) {
    return notFound();
  }

  // ✅ функция обогащения
  const product = enrichProductData(
    productData,
    references.ingredients,
    references.sizes,
    references.types,
  );

  return (
    <Container className="flex flex-col my-10">
      <Link
        href="/"
        className="mb-5 bg-gray-100 h-[50px] w-[50px] rounded-full 
                   flex items-center justify-center border border-gray-200 
                   shadow-sm hover:scale-105 transition-all duration-300"
      >
        <ReplyIcon size={20} />
      </Link>

      <ProductFormClient product={product} />
    </Container>
  );
}
