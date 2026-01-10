import { Prisma } from "@prisma/client";

// ✅ Обновленный тип для новой схемы
const cartItemWithRelations = Prisma.validator<Prisma.CartItemDefaultArgs>()({
	include: {
		product: {
			select: {
				id: true,
				name: true,
				imageUrl: true,
				variants: true, // JSON
				baseIngredients: true, // JSON
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

export type CartDTO = {
	id: string; // ✅ Теперь UUID строка
	userId: string | null;
	tokenId: string | null;
	totalAmount: number;
	createdAt: Date;
	updatedAt: Date;
	items: CartItemDTO[];
};

// ✅ Обновленный интерфейс для создания элемента корзины
export interface CreateCartItemValues {
	productId: number; // ✅ ID продукта
	variantId: number; // ✅ ID варианта из JSON variants
	ingredients?: number[]; // ID добавленных ингредиентов
	removedIngredients?: number[]; // ID удаленных базовых ингредиентов (опционально)
}
