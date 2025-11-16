import { Prisma } from "@prisma/client";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const cartItemWithRelations = Prisma.validator<Prisma.CartItemDefaultArgs>()({
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

// ✅  версия для optimistic updates
export interface CreateCartItemValuesOptimistic extends CreateCartItemValues {
	// Данные для мгновенного отображения в UI
	optimistic?: {
		name: string;
		imageUrl: string;
		price: number;
		pizzaSize?: number | null;
		pizzaType?: number | null;
		ingredientsData?: Array<{ id: number; name: string; price: number }>;
	};
}
