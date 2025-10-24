"use client";

import { Skeleton } from "@/components/ui/skeleton";
import React, { Suspense, lazy } from "react";
import { ProductWithRelations } from "../../../../@types/prisma";

// Ленивая загрузка модалки
const ChooseProductModal = lazy(() =>
	import("./choose-product-modal").then((module) => ({
		default: module.ChooseProductModal,
	})),
);

interface Props {
	product: ProductWithRelations;
}

export const LazyChooseProductModal: React.FC<Props> = ({ product }) => {
	return (
		<Suspense
			fallback={
				<div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
					<div className="bg-white rounded-lg w-[1060px] h-[90vh]">
						<Skeleton className="w-full h-full rounded-lg" />
					</div>
				</div>
			}
		>
			<ChooseProductModal product={product} />
		</Suspense>
	);
};
