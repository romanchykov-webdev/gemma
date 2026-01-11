import { ChooseProductModal } from "@/components/shared/modals/choose-product-modal";
import { notFound } from "next/navigation";
import {
	BaseIngredient,
	OptimizedProductItem,
	ProductVariant,
	ProductWithRelations,
} from "../../../../../../@types/prisma";
import { prisma } from "../../../../../../prisma/prisma-client";

export async function generateStaticParams() {
	const products = await prisma.product.findMany({
		select: { id: true },
	});

	return products.map((product) => ({
		id: product.id.toString(),
	}));
}

export const dynamic = "force-static";
export const dynamicParams = false;

type ProductPageProps = {
	params: Promise<{ id: string }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
	const { id } = await params;

	// ✅ Используем правильные имена моделей: Size и Type вместо productSize и doughType
	const [product, sizes, doughTypes, allIngredients] = await Promise.all([
		prisma.product.findFirst({
			where: { id: Number(id) },
			// Поля из новой схемы
			select: {
				id: true,
				name: true,
				imageUrl: true,
				categoryId: true,
				baseIngredients: true, // JSON
				variants: true, // JSON
				addableIngredientIds: true,
			},
		}),
		prisma.size.findMany({
			orderBy: { sortOrder: "asc" },
		}),
		prisma.type.findMany({
			orderBy: { sortOrder: "asc" },
		}),
		prisma.ingredient.findMany(),
	]);

	if (!product) {
		return notFound();
	}

	// ✅ Подготавливаем данные для модалки (имитируем старую структуру)
	// Извлекаем базовые ингредиенты из общего списка по ID из JSON
	const baseIngrs = (product.baseIngredients as any[]) || [];
	const productIngredients = allIngredients
		.filter((ing) => baseIngrs.some((bi) => bi.id === ing.id))
		.map((ing) => ({
			...ing,
			price: Number(ing.price),
		}));

	// Преобразуем JSON variants в массив items для UI
	const variants = (product.variants as any[]) || [];
	const items: OptimizedProductItem[] = variants.map((v) => {
		const sizeObj = sizes.find((s) => s.id === v.sizeId);
		const typeObj = doughTypes.find((t) => t.id === v.typeId);
		return {
			id: v.variantId,
			price: Number(v.price),
			sizeId: v.sizeId,
			doughTypeId: v.typeId,
			productId: product.id,
			// ✅ Добавляем названия из справочников
			size: sizeObj
				? {
						value: sizeObj.value,
						name: sizeObj.name, // ✅ Добавляем name
					}
				: null,
			doughType: typeObj
				? {
						value: typeObj.value,
						name: typeObj.name, // ✅ Добавляем name
					}
				: null,
		};
	});

	// ✅ Формируем финальный объект продукта с правильными типами
	const productWithNumbers: ProductWithRelations = {
		...product,
		ingredients: productIngredients,
		items: items,
		variants: variants as ProductVariant[], // ✅ Сохраняем оригинальные variants
		baseIngredients: baseIngrs as BaseIngredient[], // ✅ Сохраняем baseIngredients
	};

	return <ChooseProductModal product={productWithNumbers} sizes={sizes} doughTypes={doughTypes} />;
}
