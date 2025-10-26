import { ChooseProductModal } from "@/components/shared/modals/choose-product-modal";
import { notFound } from "next/navigation";
import { prisma } from "../../../../../../prisma/prisma-client";

// ✅ Генерируем все страницы продуктов на BUILD TIME (Pure SSG)
export async function generateStaticParams() {
	const products = await prisma.product.findMany({
		select: { id: true },
	});

	return products.map((product) => ({
		id: product.id.toString(),
	}));
}

// ✅ Страницы полностью статичные (не меняются после билда)
export const dynamic = "force-static";
export const dynamicParams = false; // 404 для несуществующих продуктов

type ProductPageProps = {
	params: Promise<{ id: string }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
	const { id } = await params;

	// ✅ Оптимизация: используем select вместо include для загрузки только нужных полей
	const product = await prisma.product.findFirst({
		where: {
			id: Number(id),
		},
		select: {
			id: true,
			name: true,
			imageUrl: true,
			categoryId: true,
			// Убираем createdAt, updatedAt для ускорения
			ingredients: {
				select: {
					id: true,
					name: true,
					price: true,
					imageUrl: true,
				},
			},
			items: {
				select: {
					id: true,
					price: true,
					size: true,
					pizzaType: true,
					productId: true,
				},
				orderBy: {
					createdAt: "desc",
				},
			},
		},
	});

	if (!product) {
		return notFound();
	}

	// ✅ Используем прямой импорт без lazy loading для быстрого открытия
	return <ChooseProductModal product={product} />;
}
