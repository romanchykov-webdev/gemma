import { Ingredient, Product, ProductItem } from "@prisma/client";

export type IProduct = Product & { items: ProductItem[]; ingredients: Ingredient[] };

// ✅ Оптимизированные типы для запросов с select (без createdAt/updatedAt)
type OptimizedProductItem = Omit<ProductItem, "createdAt" | "updatedAt"> & {
	createdAt?: Date;
	updatedAt?: Date;
};

type OptimizedIngredient = Omit<Ingredient, "createdAt" | "updatedAt"> & {
	createdAt?: Date;
	updatedAt?: Date;
};

export type ProductWithRelations = Omit<Product, "createdAt" | "updatedAt"> & {
	items: OptimizedProductItem[];
	ingredients: OptimizedIngredient[];
	createdAt?: Date;
	updatedAt?: Date;
};
