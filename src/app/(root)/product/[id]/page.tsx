import { Container, ProductFormClient } from "@/components/shared";
import { ReplyIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "../../../../../prisma/prisma-client";

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
					sizeId: true,
					doughTypeId: true,
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

	// --- загрузка размеров и типов теста и приведение value к number ---
	const [sizesRaw, doughTypesRaw] = await Promise.all([
		prisma.productSize.findMany({
			select: { id: true, name: true, value: true },
			orderBy: { sortOrder: "asc" },
		}),
		prisma.doughType.findMany({
			select: { id: true, name: true, value: true },
			orderBy: { sortOrder: "asc" },
		}),
	]);

	function toNumberValue(v: unknown): number {
		if (typeof v === "number") return v;
		// проверяем объект с методом toNumber (Prisma Decimal)
		if (typeof v === "object" && v !== null && "toNumber" in v && typeof (v as { toNumber: unknown }).toNumber === "function") {
		  return (v as { toNumber: () => number }).toNumber();
		}
		// fallback — пробуем преобразовать через Number
		return Number(v);
	  }
	  
	  const sizes = sizesRaw.map((s) => ({
		id: s.id,
		name: s.name,
		value: toNumberValue(s.value),
	  }));
	  
	  const doughTypes = doughTypesRaw.map((d) => ({
		id: d.id,
		name: d.name,
		value: toNumberValue(d.value),
	  }));

	return (
		<Container className="flex flex-col my-30 ">
			<Link
				href="/"
				className="mb-5 bg-gray-100 h-[50px] w-[50px] rounded-full 
        flex items-center justify-center border border-gray-200 shadow-sm hover:scale-105 transition-all duration-300"
			>
				<ReplyIcon size={20} />
			</Link>

			<ProductFormClient product={productWithNumbers} sizes={sizes} doughTypes={doughTypes} />
		</Container>
	);
}
