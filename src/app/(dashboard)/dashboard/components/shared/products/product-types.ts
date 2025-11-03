import { Decimal } from "@prisma/client/runtime/library";

// Категория
export type Category = {
	id: number;
	name: string;
};

// Размер продукта
export type ProductSize = {
	id: number;
	name: string;
	value: number;
};

// Тип теста
export type DoughType = {
	id: number;
	name: string;
	value: number;
};

// Ингредиент
export type Ingredient = {
	id: number;
	name: string;
	price: number | Decimal;
	imageUrl: string;
};

// Вариант продукта (ProductItem)
export type ProductItem = {
	id: number;
	price: number | Decimal;
	sizeId: number | null;
	doughTypeId: number | null;
};

// Продукт
export type Product = {
	id: number;
	name: string;
	imageUrl: string;
	categoryId: number;
	category: {
		id: number;
		name: string;
	};
	items: ProductItem[];
	ingredients?: Ingredient[];
};

// Данные для создания продукта
export type CreateProductData = {
	name: string;
	imageUrl: string;
	categoryId: number;
	ingredientIds?: number[];
	items?: Array<{
		price: number;
		sizeId?: number | undefined;
		doughTypeId?: number | undefined;
	}>;
};

// Данные для обновления продукта
export type UpdateProductData = {
	name: string;
	imageUrl: string;
	categoryId: number;
	ingredientIds?: number[];
	items?: Array<{
		id?: number;
		price: number;
		sizeId?: number | null;
		doughTypeId?: number | null;
	}>;
};
