import { LazyChooseProductModal } from "@/components/shared/modals/lazy-choose-product-modal";
import { notFound } from "next/navigation";
import { prisma } from "../../../../../../prisma/prisma-client";

type ProductPageProps = {
	params: Promise<{ id: string }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
	const { id } = await params;

	// const product = await prisma.product.findFirst({
	//   where: {
	//     id: Number(id),
	//   },
	//   include: {
	//     ingredients: true,
	//     category: {
	//       include: {
	//         products: {
	//           include: {
	//             items: true,
	//           },
	//         },
	//       },
	//     },
	//     items: {
	//       orderBy: {
	//         createdAt: 'desc',
	//       },
	//       include: {
	//         product: {
	//           include: {
	//             items: true,
	//           },
	//         },
	//       },
	//     },
	//   },
	// });

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

	// return <ChooseProductModal product={product} />;
	return <LazyChooseProductModal product={product} />;
}
