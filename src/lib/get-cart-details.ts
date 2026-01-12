import { CartDTO } from "../../services/dto/cart.dto";
import { calcCatItemTotalPrice } from "./calc-cart-item-total-price";

export type CartStateItem = {
	id: string; // UUID
	quantity: number;
	name: string;
	imageUrl: string;
	price: number;
	pizzaSize?: number | null;
	pizzaType?: number | null;
	sizeName?: string | null;
	doughTypeName?: string | null;
	ingredients: Array<{ name: string; price: number }>;
	removedIngredients?: Array<{ name: string }>;
};

interface ReturnProps {
	items: CartStateItem[];
	totalAmount: number;
}

export const getCartDetails = (data: CartDTO): ReturnProps => {
	if (!data || !data.items) {
		return {
			items: [],
			totalAmount: 0,
		};
	}

	const items = data.items
		.map((item) => {
			// ✅ Новая структура: item.productItem может быть undefined
			// Проверяем наличие productItem или используем product напрямую
			const productItem = item.productItem;
			const product = productItem?.product || item.product;

			if (!product) {
				console.error("Product is missing in cart item:", item);
				return null;
			}

			return {
				id: item.id,
				quantity: item.quantity,
				name: product.name,
				imageUrl: product.imageUrl,
				price: calcCatItemTotalPrice(item),
				pizzaSize: productItem?.size?.value ?? null,
				pizzaType: productItem?.doughType?.value ?? null,
				sizeName: productItem?.size?.name ?? null,
				doughTypeName: productItem?.doughType?.name ?? null,
				ingredients: item.ingredients.map((ingredient) => ({
					name: ingredient.name,
					price: Number(ingredient.price),
				})),
			};
		})
		.filter((item): item is CartStateItem => item !== null); // Убираем null значения

	return {
		items,
		totalAmount: Number(data.totalAmount),
	};
};
