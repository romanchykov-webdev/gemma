import { prisma } from "../../prisma/prisma-client";
import { calcCatItemTotalPrice } from "./calc-cart-item-total-price";

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
					product: {
						select: {
							id: true,
							name: true,
							imageUrl: true,
							variants: true,
							baseIngredients: true,
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
