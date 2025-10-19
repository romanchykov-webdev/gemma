"use client";

import { ProductFormClient } from "@/components/shared";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useRouter } from "next/navigation";
import React from "react";
import { ProductWithRelations } from "../../../../@types/prisma";

interface Props {
	product: ProductWithRelations;
}

export const ChooseProductModal: React.FC<Props> = ({ product }) => {
	//
	const router = useRouter();

	return (
		<Dialog open={Boolean(product)} onOpenChange={() => router.back()}>
			<DialogContent className="p-0 w-full max-w-[1060px] bg-white overflow-auto   lg:w-[1060px] h-[90vh] lg:h-auto rounded-lg">
				<VisuallyHidden>
					<DialogTitle>{"dialog title"}</DialogTitle>
				</VisuallyHidden>
				<ProductFormClient product={product} />
			</DialogContent>
		</Dialog>
	);
};
