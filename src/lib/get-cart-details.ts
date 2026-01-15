import { asProductVariants } from "../../@types/json-parsers";
import { CartDTO } from "../../services/dto/cart.dto";
import { calcCatItemTotalPrice } from "./calc-cart-item-total-price";

export type CartStateItem = {
	id: string; // UUID
	quantity: number;
	name: string;
	imageUrl: string;
	price: number;
	pizzaSize: number | null;
	pizzaType: number | null;
	sizeName: string | null;
	doughTypeName: string | null;
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
			const product = item.product;

			if (!product) {
				console.error("Product is missing in cart item:", item);
				return null;
			}

			// Получаем информацию о варианте из product.variants
			const variants = asProductVariants(product.variants);
			const variant = variants.find((v) => v.variantId === item.variantId);

			return {
				id: item.id,
				quantity: item.quantity,
				name: product.name,
				imageUrl: product.imageUrl,
				price: calcCatItemTotalPrice(item),
				pizzaSize: variant?.sizeId ?? null,
				pizzaType: variant?.typeId ?? null,
				sizeName: null as string | null,
				doughTypeName: null as string | null,
				ingredients: item.ingredients.map((ingredient) => ({
					name: ingredient.name,
					price: Number(ingredient.price),
				})),
			};
		})
		.filter((item): item is CartStateItem => item !== null);

	return {
		items,
		totalAmount: Number(data.totalAmount),
	};
};
