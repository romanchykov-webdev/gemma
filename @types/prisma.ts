import { Ingredient, Product } from "@prisma/client";

// ✅ Определяем структуру варианта продукта (из JSON)
export interface ProductVariant {
	variantId: number;
	price: number;
	sizeId: number;
	typeId: number;
}

// ✅ Определяем структуру базового ингредиента (из JSON)
export interface BaseIngredient {
	id: number;
	name: string;
	imageUrl?: string;
	removable: boolean;
	isDisabled: boolean;
}

// ✅ Оптимизированный элемент продукта (для UI)
export type OptimizedProductItem = {
	id: number; // variantId
	price: number;
	sizeId: number;
	doughTypeId: number;
	productId: number;
	size?: {
		value: number;
		name: string;
	} | null;
	doughType?: {
		value: number;
		name: string;
	} | null;
};

// ✅ Оптимизированный ингредиент
export type OptimizedIngredient = Omit<Ingredient, "createdAt" | "updatedAt" | "price"> & {
	price: number;
	createdAt?: Date;
	updatedAt?: Date;
};

// ✅ Продукт с relations (для UI)
export type ProductWithRelations = Omit<Product, "createdAt" | "updatedAt" | "variants" | "baseIngredients"> & {
	items: OptimizedProductItem[];
	ingredients: OptimizedIngredient[];
	variants: ProductVariant[];
	baseIngredients: BaseIngredient[];
	createdAt?: Date;
	updatedAt?: Date;
};

// ✅ Базовый тип продукта (совместимость)
export type IProduct = Product & {
	items: OptimizedProductItem[];
	ingredients: Ingredient[];
};
