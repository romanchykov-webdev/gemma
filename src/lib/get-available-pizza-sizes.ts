import { Variant } from "@/components/shared/group-variants";
import { pizzaSize, PizzaType } from "@/constants/pizza";
import { OptimizedProductItem } from "../../@types/prisma";

/**
 *
 * @param type
 * @param items
 */

export const getAvailablePizzaSizes = (type: PizzaType, items: OptimizedProductItem[]): Variant[] => {
	// ✅ Фильтруем по значению типа теста из вложенного объекта
	const filteredPizzaByType = items?.filter((item) => item.type?.value === type);

	return pizzaSize.map((item) => ({
		name: item.name,
		value: item.value,
		// ✅ Сравниваем значение размера из вложенного объекта
		disabled: !filteredPizzaByType?.some((pizza) => pizza.size?.value === Number(item.value)),
	}));
};
