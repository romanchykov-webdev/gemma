"use client";

import { useCartStore } from "@/store";
import { useRouter } from "next/navigation";
import React, { JSX, useState } from "react";
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

	const [submitting, setSubmitting] = useState(false);

	const firstItem = product.items[0];
	const minPriceItem = product.items.reduce((min, item) => (item.price < min.price ? item : min));
	// pizza два типа 1 2 и больше не пицца
	const isPizzaForm = Boolean(firstItem.doughTypeId && firstItem.doughTypeId < 3);

	console.log("ProductFormClient isPizzaForm", isPizzaForm);
	console.log("ProductFormClient doughTypeId", firstItem);
	console.log("ProductFormClient doughTypeId", firstItem.doughTypeId);

	const onSubmit = async (
		productItemId?: number,
		ingredients?: number[],
		totalPrice?: number,
		pizzaSize?: number | null,
		pizzaType?: number | null,
		ingredientsData?: Array<{ id: number; name: string; price: number }>,
	) => {
		try {
			setSubmitting(true);
			const itemId = productItemId ?? firstItem.id;

			// 1) Мгновенно показываем тост
			toast.success(product.name + " aggiunto al carrello");

			// 2) Мгновенно закрываем окно
			router.back();

			// 3) ⚡ Запрос идёт в фоне с optimistic update!
			addCartItem({
				productItemId: itemId,
				ingredients,
				optimistic: {
					name: product.name,
					imageUrl: product.imageUrl,
					price: totalPrice ?? firstItem.price,
					pizzaSize,
					pizzaType,
					ingredientsData,
				},
			});
		} catch (error) {
			toast.error("Si è verificato un errore durante l'aggiunta al carrello");
			console.error(error);
		} finally {
			setSubmitting(false);
		}
	};

	// 🔥 Форма выбора пиццы
	if (isPizzaForm) {
		return (
			<ChoosePizzaForm
				imageUrl={product.imageUrl}
				name={product.name}
				ingredients={product.ingredients}
				items={product.items ?? []}
				onSubmit={onSubmit}
				loading={submitting}
			/>
		);
	}

	// 🔥 Форма выбора продукта
	return (
		<ChooseProductForm
			imageUrl={product.imageUrl}
			name={product.name}
			price={minPriceItem.price}
			onSubmit={onSubmit}
			loading={submitting}
			ingredients={product.ingredients}
			items={product.items ?? []}
		/>
	);
};
