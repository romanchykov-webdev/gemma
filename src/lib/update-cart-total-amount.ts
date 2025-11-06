import { prisma } from "../../prisma/prisma-client";
import { calcCatItemTotalPrice } from "./calc-cart-item-total-price";

// export const updateCartTotalAmount = async (token: string) => {
// 	// console.time("FIND_USER_CART"); // Измерение времени поиска корзины

// 	const userCart = await prisma.cart.findFirst({
// 		where: {
// 			tokenId: token,
// 		},
// 		include: {
// 			items: {
// 				orderBy: {
// 					createdAt: "desc",
// 				},
// 				include: {
// 					productItem: {
// 						include: {
// 							product: true,
// 						},
// 					},
// 					ingredients: true,
// 				},
// 			},
// 		},
// 	});

// 	// console.timeEnd("FIND_USER_CART");

// 	if (!userCart) return;

// 	// console.time("CALCULATE_TOTAL"); // Измерение времени расчета суммы

// 	const totalAmount = userCart?.items.reduce((acc, item) => {
// 		return acc + calcCatItemTotalPrice(item);
// 	}, 0);

// 	// console.timeEnd("CALCULATE_TOTAL");

// 	// console.time("UPDATE_CART_DB"); // Измерение времени обновления в БД

// 	// Обновляем только totalAmount, возвращаем уже полученные данные
// 	await prisma.cart.update({
// 		where: {
// 			id: userCart.id,
// 		},
// 		data: {
// 			totalAmount,
// 		},
// 	});

// 	// Возвращаем уже полученную корзину с обновлённым totalAmount
// 	return {
// 		...userCart,
// 		totalAmount,
// 	};
// };

export const updateCartTotalAmount = async (token: string) => {
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
						select: {
							id: true,
							price: true,
							sizeId: true,
							doughTypeId: true,
							size: {
								select: {
									value: true,
									name: true,
								},
							},
							doughType: {
								select: {
									value: true,
									name: true,
								},
							},
							product: {
								select: {
									id: true,
									name: true,
									imageUrl: true,
								},
							},
						},
					},
					ingredients: {
						select: {
							id: true,
							name: true,
							price: true,
							imageUrl: true,
						},
					},
				},
			},
		},
	});

	if (!userCart) return;

	const totalAmount = userCart?.items.reduce((acc, item) => {
		return acc + calcCatItemTotalPrice(item);
	}, 0);

	const roundedTotal = Math.round(totalAmount * 100) / 100;

	await prisma.cart.update({
		where: {
			id: userCart.id,
		},
		data: {
			totalAmount: roundedTotal,
		},
	});

	return {
		...userCart,
		totalAmount: roundedTotal,
	};
};
