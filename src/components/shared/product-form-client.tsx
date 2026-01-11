"use client";

import { useCartStore } from "@/store";
import React, { JSX, useState } from "react";
import toast from "react-hot-toast";
import { ProductWithRelations } from "../../../@types/prisma";
import { ChoosePizzaForm } from "./choose-pizza-form";

interface IProductFormClientProps {
	product: ProductWithRelations;
	sizes: Array<{ id: number; name: string; value: number }>;
	doughTypes: Array<{ id: number; name: string; value: number }>;
	handleClose: () => void;
}

export const ProductFormClient: React.FC<IProductFormClientProps> = ({
	product,
	// sizes,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	// doughTypes,
	handleClose,
}): JSX.Element => {
	// const router = useRouter();

	const addCartItem = useCartStore((state) => state.addCartItem);

	const [submitting, setSubmitting] = useState(false);

	const firstItem = product.items[0];
	// pizza два типа 1 2 и больше не пицца
	// const isPizzaForm = Boolean(firstItem.doughTypeId && firstItem.doughTypeId < 3);

	// console.log("ProductFormClient isPizzaForm", isPizzaForm);
	// console.log("ProductFormClient doughTypeId", firstItem);
	// console.log("ProductFormClient doughTypeId", firstItem.doughTypeId);

	// 🔥 Для пиццы (с ингредиентами)
	const onSubmitPizza = async (
		variantId: number,
		ingredients: number[],
		totalPrice?: number,
		pizzaSize?: number | null,
		pizzaType?: number | null,
		ingredientsData?: Array<{ id: number; name: string; price: number }>,
	) => {
		try {
			setSubmitting(true);

			// ✅ СНАЧАЛА добавляем в корзину (асинхронно)
			addCartItem({
				productId: product.id,
				variantId: variantId,
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

			// ✅ ПОТОМ показываем toast и закрываем модалку
			toast.success(product.name + " aggiunto al carrello");
			handleClose(); // ✅ Используем handleClose вместо router.back()
		} catch (error) {
			toast.error("Si è verificato un errore durante l'aggiunta al carrello");
			console.error(error);
		} finally {
			setSubmitting(false);
		}
	};

	// 🔥 Для обычных продуктов (без ингредиентов)
	// const onSubmitProduct = async (variantId: number, totalPrice: number) => {
	// 	// ✅ variantId вместо productItemId
	// 	try {
	// 		setSubmitting(true);
	// 		toast.success(product.name + " aggiunto al carrello");
	// 		router.back();

	// 		// ✅ Передаем productId и variantId
	// 		addCartItem({
	// 			productId: product.id, // ✅ Добавляем productId
	// 			variantId: variantId, // ✅ variantId вместо productItemId
	// 			optimistic: {
	// 				name: product.name,
	// 				imageUrl: product.imageUrl,
	// 				price: totalPrice,
	// 				pizzaSize: null,
	// 				pizzaType: null,
	// 			},
	// 		});
	// 	} catch (error) {
	// 		toast.error("Si è verificato un errore durante l'aggiunta al carrello");
	// 		console.error(error);
	// 	} finally {
	// 		setSubmitting(false);
	// 		handleClose();
	// 	}
	// };

	// 🔥 Форма выбора пиццы
	// if (isPizzaForm) {
	return (
		<ChoosePizzaForm
			imageUrl={product.imageUrl}
			name={product.name}
			onSubmit={onSubmitPizza}
			loading={submitting}
			ingredients={product.ingredients}
			items={product.items ?? []}
			// sizes={sizes}
		/>
	);
	// }

	// 🔥 Форма выбора продукта (не пицца)
	// return (
	// 	<ChooseProductForm
	// 		imageUrl={product.imageUrl}
	// 		name={product.name}
	// 		onSubmit={onSubmitProduct}
	// 		loading={submitting}
	// 		ingredients={product.ingredients}
	// 		items={product.items ?? []}
	// 		sizes={sizes}
	// 	/>
	// );
};
