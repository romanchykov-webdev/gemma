"use client";

import { useCartStore } from "@/store";
import { useRouter } from "next/navigation";
import React, { JSX } from "react";
import toast from "react-hot-toast";
import { ProductWithRelations } from "../../../@types/prisma";
import { ChoosePizzaForm } from "./choose-pizza-form";
import { ChooseProductForm } from "./choose-product-form";

interface IProductFormClientProps {
	product: ProductWithRelations;
}

export const ProductFormClient: React.FC<IProductFormClientProps> = ({ product }): JSX.Element => {
	const router = useRouter();

	const addCartItem = useCartStore((state) => state.addCartItem);

	const loading = useCartStore((state) => state.loading);

	const firstItem = product.items[0];

	const isPizzaForm = Boolean(firstItem.pizzaType);

	const onSubmit = async (productItemId?: number, ingredients?: number[]) => {
		try {
			const itemId = productItemId ?? firstItem.id;

			await addCartItem({
				productItemId: itemId,
				ingredients,
			});

			toast.success(product.name + " aggiunto al carrello");

			router.back();
			//
		} catch (error) {
			toast.error("Si è verificato un errore durante l'aggiunta al carrello");
			console.error(error);
		}
	};
	if (isPizzaForm) {
		return (
			<ChoosePizzaForm
				imageUrl={product.imageUrl}
				name={product.name}
				ingredients={product.ingredients}
				items={product.items ?? []}
				onSubmit={onSubmit}
				loading={loading}
			/>
		);
	}
	return (
		<ChooseProductForm
			imageUrl={product.imageUrl}
			name={product.name}
			price={firstItem.price}
			onSubmit={onSubmit}
			loading={loading}
		/>
	);
};
