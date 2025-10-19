import { Ingredient, Product, ProductItem } from '@prisma/client';

export type IProduct = Product & { items: ProductItem[]; ingredients: Ingredient[] };

export type ProductWithRelations = Product & { items: ProductItem[]; ingredients: Ingredient[] };
