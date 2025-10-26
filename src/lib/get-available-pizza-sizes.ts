import { Variant } from "@/components/shared/group-variants";
import { pizzaSize, PizzaType } from "@/constants/pizza";
import { ProductItem } from "@prisma/client";

// ✅ Оптимизированный тип ProductItem (без обязательных createdAt/updatedAt)
type OptimizedProductItem = Omit<ProductItem, "createdAt" | "updatedAt"> & {
	createdAt?: Date;
	updatedAt?: Date;
};

/**
 *
 * @param type
 * @param items
 */

export const getAvailablePizzaSizes = (type: PizzaType, items: OptimizedProductItem[]): Variant[] => {
	const filteredPizzaByType = items?.filter((item) => Number(item.pizzaType) === type);
	return pizzaSize.map((item) => ({
		name: item.name,
		value: item.value,
		disabled: !filteredPizzaByType?.some((pizza) => Number(pizza.size) === Number(item.value)),
	}));
};
