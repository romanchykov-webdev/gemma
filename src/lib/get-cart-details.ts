import { CartDTO } from "../../services/dto/cart.dto";
import { calcCatItemTotalPrice } from "./calc-cart-item-total-price";

export type CartStateItem = {
	id: string; // UUID теперь
	quantity: number;
	name: string;
	imageUrl: string;
	price: number;
	pizzaSize?: number | null;
	pizzaType?: number | null;
	sizeName?: string | null; // 🔥 НОВОЕ: название размера из БД
	doughTypeName?: string | null; // 🔥 НОВОЕ: название типа теста из БД
	ingredients: Array<{ name: string; price: number }>;
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

	const items = data.items.map((item) => ({
		id: item.id,
		quantity: item.quantity,
		name: item.productItem.product.name,
		imageUrl: item.productItem.product.imageUrl,

		price: calcCatItemTotalPrice(item),

		pizzaSize: item.productItem.size?.value ?? null,
		pizzaType: item.productItem.doughType?.value ?? null,

		// 🔥 НОВОЕ: добавляем названия из базы данных
		sizeName: item.productItem.size?.name ?? null,
		doughTypeName: item.productItem.doughType?.name ?? null,

		ingredients: item.ingredients.map((ingredient) => ({
			name: ingredient.name,
			price: Number(ingredient.price),
		})),
	}));

	return {
		items,
		totalAmount: data.totalAmount,
	};
};
