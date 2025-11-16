import { CartItemDTO } from "../../services/dto/cart.dto";

export const calcCatItemTotalPrice = (item: CartItemDTO): number => {
	//
	const ingredientsPrice = item.ingredients.reduce((acc, ingredient) => acc + Number(ingredient.price), 0);

	const totalPrice = (ingredientsPrice + Number(item.productItem.price)) * item.quantity;

	//
	return Math.round(totalPrice * 100) / 100;
};
