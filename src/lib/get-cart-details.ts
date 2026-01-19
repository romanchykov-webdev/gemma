import { asProductVariants } from "../../@types/json-parsers";
import { CartDTO } from "../../services/dto/cart.dto";
import { calcCatItemTotalPrice } from "./calc-cart-item-total-price";

export type CartStateItem = {
	id: string; // UUID
	quantity: number;
	name: string;
	imageUrl: string;
	price: number;
	size: number | null;
	type: number | null;
	sizeName: string | null;
	typeName: string | null;
	ingredients: Array<{ id: number; name: string; price: number }>; // ✅ id обязателен
	removedIngredients?: Array<{ name: string }>;
	// ✅ НОВОЕ - для точного сравнения дубликатов (обязательны)
	productId: number;
	variantId: number;
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
			size: variant?.sizeId ?? null,
			type: variant?.typeId ?? null,
			sizeName: null as string | null,
			typeName: null as string | null,
			ingredients: item.ingredients.map((ingredient) => ({
				id: ingredient.id,
				name: ingredient.name,
				price: Number(ingredient.price),
			})),
			// ✅ НОВОЕ - добавляем для точного сравнения
			productId: product.id,
			variantId: item.variantId,
		};
		})
		.filter((item): item is CartStateItem => item !== null);

	return {
		items,
		totalAmount: Number(data.totalAmount),
	};
};
