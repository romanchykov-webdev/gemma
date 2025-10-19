import { Container, ProductFormClient } from '@/components/shared';
import { ReplyIcon } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '../../../../../prisma/prisma-client';

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;

  const product = await prisma.product.findFirst({
    where: {
      id: Number(id),
    },
    include: {
      ingredients: true,
      // TODO: вынести в отдельный запрос
      category: {
        include: {
          products: {
            include: {
              items: true,
            },
          },
        },
      },
      items: {
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          product: {
            include: {
              items: true,
            },
          },
        },
      },
    },
  });

  if (!product) {
    return notFound();
  }
  // console.log("ProductPage", JSON.stringify(product, null));

  return (
    <Container className="flex flex-col my-30 ">
      <Link
        href="/"
        className="mb-5 bg-gray-100 h-[50px] w-[50px] rounded-full 
        flex items-center justify-center border border-gray-200 shadow-sm hover:scale-105 transition-all duration-300"
      >
        <ReplyIcon size={20} />
      </Link>

      <ProductFormClient product={product} />
    </Container>
  );
}
