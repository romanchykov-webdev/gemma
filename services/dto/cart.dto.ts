// import { Cart, CartItem, Ingredient, Product, ProductItem } from "@prisma/client";

// export type CartItemDTO = CartItem & {
// 	productItem: ProductItem & {
// 		product: Product;
// 		// ingredients: Ingredient[]
// 	};
// 	ingredients: Ingredient[];
// };

// export interface CartDTO extends Cart {
// 	items: CartItemDTO[];
// }

// export interface CreateCartItemValues {
// 	productItemId: number;
// 	// pizzaSize?: number;
// 	// pizzaType?: number;
// 	ingredients?: number[];
// 	// quantity: number;
// }

import { Prisma } from "@prisma/client";

// Определяем структуру через Prisma Validator
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const cartItemWithRelations = Prisma.validator<Prisma.CartItemDefaultArgs>()({
	include: {
		productItem: {
			select: {
				id: true,
				price: true,
				size: true,
				pizzaType: true,
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
});

export type CartItemDTO = Prisma.CartItemGetPayload<typeof cartItemWithRelations>;

// Определяем CartDTO используя CartItemDTO
export type CartDTO = {
	id: number;
	userId: string | null;
	tokenId: string;
	totalAmount: number;
	createdAt: Date;
	updatedAt: Date;
	items: CartItemDTO[];
};

export interface CreateCartItemValues {
	productItemId: number;
	ingredients?: number[];
}
