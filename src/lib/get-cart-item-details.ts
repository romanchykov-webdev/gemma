// import { mapPizzaTypes, PizzaSize, PizzaType } from "@/constants/pizza";

// import { CartStateItem } from "./get-cart-details";

// export const getCartItemDetails = (
// 	ingredients: CartStateItem["ingredients"],
// 	pizzaType?: PizzaType,
// 	pizzaSize?: PizzaSize,
// ): string => {
// 	const details = [];
// 	// console.log("getCartItemDetails details", details);
// 	if (pizzaSize && pizzaType) {
// 		// const typeName = type === 1 ? "Традиционное" : "Тонкое";
// 		const typeName = mapPizzaTypes[pizzaType];

// 		details.push(`${typeName} ${pizzaSize} cm`);
// 	}

// 	if (ingredients) {
// 		details.push(...ingredients.map((ingredient) => ingredient.name));
// 	}
// 	return details.join(", ");
// };
import { CartStateItem } from "./get-cart-details";

/**
 * ✅ Получает детали товара в корзине (размер, тип теста, ингредиенты)
 *
 * @param ingredients - массив ингредиентов
 * @param sizeName - название размера из БД (например "Маленькая", "500 мл")
 * @param doughTypeName - название типа теста из БД (например "Тонкое", "Традиционное")
 * @returns строка с деталями товара
 */
export const getCartItemDetails = (
	ingredients: CartStateItem["ingredients"],
	sizeName?: string | null,
	doughTypeName?: string | null,
	removedIngredients?: Array<{ name: string }>,
): string => {
	const details = [];
	// console.log("getCartItemDetails sizeName", sizeName);
	// console.log("getCartItemDetails doughTypeName", doughTypeName);
	// sizeName=null && doughTypeName=null
	if (sizeName === "Null" && doughTypeName === "Null") {
		return "";
	}
	// 🍕 Если это пицца (есть и размер и тип теста)
	if (sizeName && doughTypeName) {
		details.push(`${doughTypeName} ${sizeName}`);
	}
	// 🥤 Если это напиток/другой продукт (только размер)
	else if (sizeName) {
		details.push(sizeName);
	}

	// Добавляем ингредиенты
	// if (ingredients && ingredients.length > 0) {
	// 	details.push(...ingredients.map((ingredient) => ingredient.name));
	// }

	// ✅ Добавленные ингредиенты
	if (ingredients && ingredients.length > 0) {
		const addedText = ingredients.map((ing) => `+${ing.name}`).join(", ");
		details.push(addedText);
	}

	// ✅ НОВОЕ - Удаленные ингредиенты
	if (removedIngredients && removedIngredients.length > 0) {
		const removedText = removedIngredients.map((ing) => `-${ing.name}`).join(", ");
		details.push(removedText);
	}

	return details.join(", ");
};
