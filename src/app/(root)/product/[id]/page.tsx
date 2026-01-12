import { Container, ProductFormClient } from "@/components/shared";
import { ReplyIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "../../../../../prisma/prisma-client";

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

	// 1. Загружаем данные. Учтите, что ingredients и items больше не являются реляциями
	const [productData, sizesRaw, doughTypesRaw, allIngredients] = await Promise.all([
		prisma.product.findFirst({
			where: { id: Number(id) },
			select: {
				id: true,
				name: true,
				imageUrl: true,
				categoryId: true,
				baseIngredients: true, // JSON [{id, removable}]
				variants: true, // JSON [{variantId, price, sizeId, typeId}]
			},
		}),
		prisma.size.findMany({
			// Модель переименована в Size
			select: { id: true, name: true, value: true, sortOrder: true },
			orderBy: { sortOrder: "asc" },
		}),
		prisma.type.findMany({
			// Модель переименована в Type
			select: { id: true, name: true, value: true, sortOrder: true },
			orderBy: { sortOrder: "asc" },
		}),
		prisma.ingredient.findMany(),
	]);

	if (!productData) {
		return notFound();
	}

	// 2. Обработка ингредиентов (сопоставляем ID из JSON с объектами из БД)
	const baseIngrsJson = (productData.baseIngredients as any[]) || [];
	const ingredients = allIngredients
		.filter((ing) => baseIngrsJson.some((bi) => bi.id === ing.id))
		.map((ing) => ({
			...ing,
			price: Number(ing.price),
		}));

	// 3. Обработка вариаций (variants -> items)
	const variantsJson = (productData.variants as any[]) || [];
	const items = variantsJson.map((v) => {
		const sizeObj = sizesRaw.find((s) => s.id === v.sizeId);
		const typeObj = doughTypesRaw.find((t) => t.id === v.typeId);

		return {
			id: v.variantId,
			price: Number(v.price),
			sizeId: v.sizeId,
			doughTypeId: v.typeId,
			productId: productData.id,
			// Добавляем вложенные объекты для совместимости с ProductFormClient
			size: sizeObj ? { value: sizeObj.value } : null,
			doughType: typeObj ? { value: typeObj.value } : null,
		};
	});

	const productWithNumbers = {
		...productData,
		ingredients,
		items,
	};

	// 4. Приведение справочников к числам (если value это Decimal)
	const sizes = sizesRaw.map((s) => ({
		...s,
		value: Number(s.value),
	}));

	const doughTypes = doughTypesRaw.map((d) => ({
		...d,
		value: Number(d.value),
	}));

	return (
		<Container className="flex flex-col my-10">
			<Link
				href="/"
				className="mb-5 bg-gray-100 h-[50px] w-[50px] rounded-full 
        flex items-center justify-center border border-gray-200 shadow-sm hover:scale-105 transition-all duration-300"
			>
				<ReplyIcon size={20} />
			</Link>

			<ProductFormClient
				product={productWithNumbers as any}
				sizes={sizes}
				doughTypes={doughTypes}
				handleClose={() => {}}
			/>
		</Container>
	);
}
