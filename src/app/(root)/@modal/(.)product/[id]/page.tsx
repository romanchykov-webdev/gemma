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

	// ✅ Загружаем продукт, размеры и типы теста параллельно (один раз на сервере)
	const [product, sizes, doughTypes] = await Promise.all([
		prisma.product.findFirst({
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
					sizeId: true,
					doughTypeId: true,
					productId: true,
					size: {
						select: {
							value: true,
						},
					},
					doughType: {
						select: {
							value: true,
						},
					},
				},
				orderBy: {
					createdAt: "desc",
				},
			},
		},
		}),
		// 🔥 Загружаем все размеры
		prisma.productSize.findMany({
			orderBy: { sortOrder: "asc" },
			select: {
				id: true,
				name: true,
				value: true,
			},
		}),
		// 🔥 Загружаем все типы теста
		prisma.doughType.findMany({
			orderBy: { sortOrder: "asc" },
			select: {
				id: true,
				name: true,
				value: true,
			},
		}),
	]);

	if (!product) {
		return notFound();
	}

	// ✅ Конвертируем Decimal в number для передачи в Client Component
	const productWithNumbers = {
		...product,
		ingredients: product.ingredients.map((ing) => ({
			...ing,
			price: Number(ing.price),
		})),
		items: product.items.map((item) => ({
			...item,
			price: Number(item.price),
		})),
	};

	// ✅ Передаем sizes и doughTypes в модальное окно
	console.log("ProductPage sizes:", sizes);
	console.log("ProductPage doughTypes:", doughTypes);
	return <ChooseProductModal product={productWithNumbers} sizes={sizes} doughTypes={doughTypes} />;
}
