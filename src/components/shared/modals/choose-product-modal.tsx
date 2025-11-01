"use client";

import { ProductFormClient } from "@/components/shared";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useRouter } from "next/navigation";
import React from "react";
import { ProductWithRelations } from "../../../../@types/prisma";

interface Props {
	product: ProductWithRelations;
	sizes: Array<{ id: number; name: string; value: number }>;
	doughTypes: Array<{ id: number; name: string; value: number }>;
}

export const ChooseProductModal: React.FC<Props> = ({ product, sizes, doughTypes }) => {
	const router = useRouter();

	const handleClose = React.useCallback(() => {
		router.back();
	}, [router]);

	return (
		<Dialog open onOpenChange={handleClose}>
			<DialogContent className="p-0 w-full max-w-[1060px] bg-white overflow-auto lg:w-[1060px] h-[90vh] lg:h-auto rounded-lg">
				<VisuallyHidden>
					<DialogTitle>Product Details</DialogTitle>
					<DialogDescription>Choose product options and add to cart</DialogDescription>
				</VisuallyHidden>
				<ProductFormClient product={product} sizes={sizes} doughTypes={doughTypes} />
			</DialogContent>
		</Dialog>
	);
};
