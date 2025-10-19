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
	ingredients: Array<{ name: string; price: number }>;
};

interface ReturnProps {
	items: CartStateItem[];
	totalAmount: number;
}

export const getCartDetails = (data: CartDTO): ReturnProps => {
	if (!data) {
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

		pizzaSize: item.productItem.size,
		pizzaType: item.productItem.pizzaType,

		ingredients: item.ingredients.map((ingredient) => ({
			name: ingredient.name,
			price: ingredient.price,
		})),
	}));

	return {
		items,
		totalAmount: data.totalAmount,
	};
};
