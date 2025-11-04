import { CartItemDTO } from "../../services/dto/cart.dto";

// type Item = {
// 	productItem: ProductItem;
// 	ingredients: Ingredient[];
// 	quantity: number;
// };

export const calcCatItemTotalPrice = (item: CartItemDTO): number => {
	// ✅ Конвертируем Decimal в number
	const ingredientsPrice = item.ingredients.reduce((acc, ingredient) => acc + Number(ingredient.price), 0);

	return (ingredientsPrice + Number(item.productItem.price)) * item.quantity;
};
