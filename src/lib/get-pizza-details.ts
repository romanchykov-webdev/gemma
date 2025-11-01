import { mapPizzaTypes, PizzaSize, PizzaType } from "@/constants/pizza";
import { calcTotalPizzaPrice } from "@/lib/calc-total-pizza-price";
import { OptimizedIngredient, OptimizedProductItem } from "../../@types/prisma";

export const getPizzaDetails = (
	type: PizzaType,
	size: PizzaSize,
	items: OptimizedProductItem[] = [],
	ingredients: OptimizedIngredient[],
	selectedIngredientsIds: Set<number>,
) => {
	const totalPrice = calcTotalPizzaPrice(type, size, items, ingredients, selectedIngredientsIds);

	const ingredientsList = `<strong>Ingredienti:</strong>`;

	const textDetails = `${size} cm ${mapPizzaTypes[type]} pasta. ${ingredientsList} ${ingredients.map((i) => i.name).join(", ")} `;

	return { totalPrice, textDetails };
};
