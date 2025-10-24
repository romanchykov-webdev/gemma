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

	const product = await prisma.product.findFirst({
		where: {
			id: Number(id),
		},
		include: {
			ingredients: true,
			items: {
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
