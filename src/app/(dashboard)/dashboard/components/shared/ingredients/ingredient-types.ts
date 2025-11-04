// Основной тип ингредиента
// export type Ingredient = {
// 	id: number;
// 	name: string;
// 	price: number | import("@prisma/client/runtime/library").Decimal; // 🔥 Поддержка Decimal
// 	imageUrl: string;
// };
export type Ingredient = {
	id: number;
	name: string;
	price: number;
	imageUrl: string;
};

// Тип для создания ингредиента (без id)
export type CreateIngredientData = {
	name: string;
	price: number;
	imageUrl: string;
};

// Тип для обновления ингредиента
export type UpdateIngredientData = CreateIngredientData;
