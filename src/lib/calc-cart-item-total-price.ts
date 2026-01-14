import { asProductVariants } from "../../@types/json-parsers";
import { CartItemDTO } from "../../services/dto/cart.dto";


export const calcCatItemTotalPrice = (item: CartItemDTO): number => {
	const ingredientsPrice = item.ingredients.reduce((acc, ingredient) => acc + Number(ingredient.price), 0);

	// ✅ Новая структура: проверяем наличие productItem
	// Если productItem есть, используем его цену
	// Если нет, пытаемся извлечь цену из варианта в product.variants
	let basePrice = 0;

	if (item.productItem?.price) {
		// Старая структура (если есть productItem)
		basePrice = Number(item.productItem.price);
	} else if (item.product?.variants) {
		// Новая структура: ищем вариант по variantId
		const variants = asProductVariants(product.variants);
		const variant = variants.find(v => v.variantId === item.variantId);
		basePrice = variant?.price ? Number(variant.price) : 0;
	}

	const totalPrice = (ingredientsPrice + basePrice) * item.quantity;

	return Math.round(totalPrice * 100) / 100;
};
