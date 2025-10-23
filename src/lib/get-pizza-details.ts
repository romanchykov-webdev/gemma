import { mapPizzaTypes, PizzaSize, PizzaType } from "@/constants/pizza";
import { calcTotalPizzaPrice } from "@/lib/calc-total-pizza-price";
import { Ingredient, ProductItem } from "@prisma/client";

export const getPizzaDetails = (
	type: PizzaType,
	size: PizzaSize,
	items: ProductItem[] = [],
	ingredients: Ingredient[],
	selectedIngredientsIds: Set<number>,
) => {
	const totalPrice = calcTotalPizzaPrice(type, size, items, ingredients, selectedIngredientsIds);

	const ingredientsList = `<strong>Ingredienti:</strong>`;

	const textDetails = `${size} cm ${mapPizzaTypes[type]} тесто. ${ingredientsList} ${ingredients.map((i) => i.name).join(", ")} `;

	return { totalPrice, textDetails };
};
