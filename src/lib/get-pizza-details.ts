import { mapPizzaTypes, PizzaSize, PizzaType } from "@/constants/pizza";
import { calcTotalPizzaPrice } from "@/lib/calc-total-pizza-price";
import { Ingredient, ProductItem } from "@prisma/client";

// ✅ Оптимизированные типы (без обязательных createdAt/updatedAt)
type OptimizedProductItem = Omit<ProductItem, "createdAt" | "updatedAt"> & {
	createdAt?: Date;
	updatedAt?: Date;
};

type OptimizedIngredient = Omit<Ingredient, "createdAt" | "updatedAt"> & {
	createdAt?: Date;
	updatedAt?: Date;
};

export const getPizzaDetails = (
	type: PizzaType,
	size: PizzaSize,
	items: OptimizedProductItem[] = [],
	ingredients: OptimizedIngredient[],
	selectedIngredientsIds: Set<number>,
) => {
	const totalPrice = calcTotalPizzaPrice(type, size, items, ingredients, selectedIngredientsIds);

	const ingredientsList = `<strong>Ingredienti:</strong>`;

	const textDetails = `${size} cm ${mapPizzaTypes[type]} тесто. ${ingredientsList} ${ingredients.map((i) => i.name).join(", ")} `;

	return { totalPrice, textDetails };
};
