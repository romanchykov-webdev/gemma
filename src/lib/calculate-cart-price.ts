import { Size, Type } from "@prisma/client";
import { ProductVariant } from "../../@types/prisma";

/**
 * Интерфейс для сырого товара из API
 */
export interface RawCartItem {
	id: string;
	productId: number;
	variantId: number;
	quantity: number;
	addedIngredientIds: number[];
	product: {
		id: number;
		name: string;
		imageUrl: string;
		variants: ProductVariant[];
	};
	ingredients: Array<{
		id: number;
		name: string;
		imageUrl: string;
		price: number | string;
	}>;
}

/**
 * Вычисляет цену одного товара в корзине
 */
export function calculateItemPrice(
	item: RawCartItem,
	sizes: Size[],
	types: Type[],
): {
	price: number;
	pizzaSize: number | null;
	pizzaType: number | null;
	sizeName: string | null;
	doughTypeName: string | null;
} {
	// Находим вариант продукта
	const variants = item.product.variants as ProductVariant[];

	const variant = variants.find((v) => v.variantId === item.variantId);

	// ✅ КРИТИЧНО: Если вариант не найден - выводим подробную ошибку
	if (!variant) {
		console.error(`❌ Variant not found:`, {
			variantId: item.variantId,
			productId: item.productId,
			productName: item.product.name,
			availableVariants: variants.map((v) => v.variantId),
		});

		// Возвращаем нулевую цену вместо краша
		return {
			price: 0,
			pizzaSize: null,
			pizzaType: null,
			sizeName: null,
			doughTypeName: null,
		};
	}

	// Вычисляем цену ингредиентов
	const ingredientsPrice = item.ingredients.reduce((sum, ing) => {
		return sum + Number(ing.price);
	}, 0);

	// Итоговая цена
	const totalPrice = (variant.price + ingredientsPrice) * item.quantity;

	// Находим size и type по ID из варианта
	const size = sizes.find((s) => s.id === variant.sizeId);
	const type = types.find((t) => t.id === variant.typeId);

	return {
		price: totalPrice,
		pizzaSize: size?.value || null,
		pizzaType: type?.value || null,
		sizeName: size?.name || null,
		doughTypeName: type?.name || null,
	};
}
