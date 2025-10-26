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

	const isPizzaForm = Boolean(firstItem.pizzaType);

	const onSubmit = async (productItemId?: number, ingredients?: number[]) => {
		try {
			setSubmitting(true);
			const itemId = productItemId ?? firstItem.id;

			// 1) Мгновенно показываем тост
			toast.success(product.name + " aggiunto al carrello");

			// 2) Мгновенно закрываем окно
			router.back();

			// 3) Запрос идёт в фоне (пользователь не ждёт!)
			addCartItem({
				productItemId: itemId,
				ingredients,
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
			price={firstItem.price}
			onSubmit={onSubmit}
			loading={submitting}
		/>
	);
};
