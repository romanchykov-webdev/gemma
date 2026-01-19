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

	// ✅ Загружаем все необходимые данные параллельно
	const [product, sizes, doughTypes, allIngredients] = await Promise.all([
		prisma.product.findFirst({
			where: { id: Number(id) },
			select: {
				id: true,
				name: true,
				imageUrl: true,
				categoryId: true,
				baseIngredients: true, // JSON - может содержать или не содержать имена
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
		prisma.ingredient.findMany({
			select: {
				id: true,
				name: true,
				imageUrl: true,
				price: true,
			},
		}),
	]);

	if (!product) {
		return notFound();
	}

	// ✅ НОВОЕ - Обогащаем baseIngredients полными данными
	const baseIngrsFromDB = (product.baseIngredients as unknown as BaseIngredient[]) || [];

	// Обогащаем базовые ингредиенты данными из таблицы Ingredient
	const enrichedBaseIngredients: BaseIngredient[] = baseIngrsFromDB.map((baseIng) => {
		// Находим полные данные ингредиента
		const fullIngredient = allIngredients.find((ing) => ing.id === baseIng.id);

		// Если в БД уже есть name и imageUrl - используем их
		// Иначе берем из таблицы Ingredient
		return {
			id: baseIng.id,
			name: baseIng.name || fullIngredient?.name || `Ingredient ${baseIng.id}`,
			imageUrl: baseIng.imageUrl || fullIngredient?.imageUrl || "",
			removable: baseIng.removable ?? true,
			isDisabled: baseIng.isDisabled ?? false, // по умолчанию не удален
		};
	});

	// console.log("📦 [ProductPage] Enriched baseIngredients:", enrichedBaseIngredients);

	// ✅ Подготавливаем добавляемые ингредиенты для UI
	const productIngredients = allIngredients
		.filter((ing) => baseIngrsFromDB.some((bi) => bi.id === ing.id))
		.map((ing) => ({
			...ing,
			price: Number(ing.price),
		}));

	// ✅ Преобразуем JSON variants в массив items для UI
	const variants = (product.variants as unknown as ProductVariant[]) || [];
	const items: OptimizedProductItem[] = variants.map((v) => {
		const sizeObj = sizes.find((s) => s.id === v.sizeId);
		const typeObj = doughTypes.find((t) => t.id === v.typeId);
		return {
			id: v.variantId,
			price: Number(v.price),
			sizeId: v.sizeId,
			typeId: v.typeId,
			productId: product.id,
			size: sizeObj ? { value: sizeObj.value, name: sizeObj.name } : null,
			type: typeObj ? { value: typeObj.value, name: typeObj.name } : null,
		};
	});

	// ✅ Формируем финальный объект продукта с обогащенными baseIngredients
	const productWithNumbers: ProductWithRelations = {
		...product,
		ingredients: productIngredients,
		items: items,
		variants: variants as ProductVariant[],
		baseIngredients: enrichedBaseIngredients,
	};

	return <ChooseProductModal product={productWithNumbers} sizes={sizes} doughTypes={doughTypes} />;
}
