import { prisma } from "../../prisma/prisma-client";
import { calcCatItemTotalPrice } from "./calc-cart-item-total-price";

export const updateCartTotalAmount = async (token: string) => {
	// console.time("FIND_USER_CART"); // Измерение времени поиска корзины

	const userCart = await prisma.cart.findFirst({
		where: {
			tokenId: token,
		},
		include: {
			items: {
				orderBy: {
					createdAt: "desc",
				},
				include: {
					productItem: {
						include: {
							product: true,
						},
					},
					ingredients: true,
				},
			},
		},
	});

	// console.timeEnd("FIND_USER_CART");

	if (!userCart) return;

	// console.time("CALCULATE_TOTAL"); // Измерение времени расчета суммы

	const totalAmount = userCart?.items.reduce((acc, item) => {
		return acc + calcCatItemTotalPrice(item);
	}, 0);

	// console.timeEnd("CALCULATE_TOTAL");

	// console.time("UPDATE_CART_DB"); // Измерение времени обновления в БД

	return await prisma.cart.update({
		where: {
			id: userCart.id,
		},
		data: {
			totalAmount,
		},
		include: {
			items: {
				orderBy: {
					createdAt: "desc",
				},
				include: {
					productItem: {
						include: {
							product: true,
						},
					},
					ingredients: true,
				},
			},
		},
	});
};
