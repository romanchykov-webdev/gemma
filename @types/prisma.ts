import { Ingredient, Product, ProductItem } from "@prisma/client";

export type IProduct = Product & { items: ProductItem[]; ingredients: Ingredient[] };

// ✅ Экспортируем типы для использования в других файлах
export type OptimizedProductItem = Omit<ProductItem, "createdAt" | "updatedAt" | "price"> & {
	price: number;
	createdAt?: Date;
	updatedAt?: Date;

	size?: {
		value: number;
	} | null;
	doughType?: {
		value: number;
	} | null;
};

export type OptimizedIngredient = Omit<Ingredient, "createdAt" | "updatedAt" | "price"> & {
	price: number;
	createdAt?: Date;
	updatedAt?: Date;
};

export type ProductWithRelations = Omit<Product, "createdAt" | "updatedAt"> & {
	items: OptimizedProductItem[];
	ingredients: OptimizedIngredient[];
	createdAt?: Date;
	updatedAt?: Date;
};
