import { prisma } from "../../prisma/prisma-client";

export const findOrCreateCart = async (token: string) => {
	let userCart = await prisma.cart.findFirst({
		where: {
			tokenId: token,
		},
	});

	if (!userCart) {
		userCart = await prisma.cart.create({
			data: {
				tokenId: token,
			},
		});
	}

	return userCart;
};
