import { Prisma } from "@prisma/client";
import { BaseIngredient } from "../../@types/prisma";

// ✅ Обновленный тип для новой схемы
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
	id: string; // ✅ UUID строка
	userId: string | null;
	tokenId: string | null;
	totalAmount: number;
	createdAt: Date;
	updatedAt: Date;
	items: CartItemDTO[];
};

// ✅ Обновленный интерфейс с поддержкой нового формата
export interface CreateCartItemValues {
	// Основные поля
	productId: number;
	variantId: number;
	ingredients?: number[]; // ID добавленных ингредиентов

	// ✅ НОВОЕ - полный snapshot базовых ингредиентов с флагами isDisabled
	baseIngredientsSnapshot?: BaseIngredient[];

	// ⚠️ СТАРОЕ - оставляем для обратной совместимости (можно удалить позже)
	removedIngredients?: number[];

	// Старый формат (для обратной совместимости - опциональные)
	productItemId?: number;
}

// ✅ Версия для optimistic updates
export interface CreateCartItemValuesOptimistic extends CreateCartItemValues {
	optimistic?: {
		name: string;
		imageUrl: string;
		price: number;
		pizzaSize?: number | null;
		pizzaType?: number | null;
		ingredientsData?: Array<{ id: number; name: string; price: number }>;
	};
}
