import { Decimal } from "@prisma/client/runtime/library";
import { axiosInstance } from "../instance";

export type ProductItem = {
	id: number;
	price: number | Decimal;
	sizeId: number | null;
	doughTypeId: number | null;
};

export type Ingredient = {
	id: number;
	name: string;
	price: number | Decimal;
	imageUrl: string;
};

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

export const getProducts = async (categoryId?: number): Promise<Product[]> => {
	const url = categoryId ? `/dashboaed/products?categoryId=${categoryId}` : "/dashboaed/products";
	const { data } = await axiosInstance.get<Product[]>(url);
	return data;
};

export const createProduct = async (productData: {
	name: string;
	imageUrl: string;
	categoryId: number;
	items?: Array<{ price: number; sizeId?: number; doughTypeId?: number }>;
	ingredientIds?: number[];
}): Promise<Product> => {
	const { data } = await axiosInstance.post<Product>("/dashboaed/products", productData);
	return data;
};

export const updateProduct = async (
	id: number,
	productData: {
		name?: string;
		imageUrl?: string;
		categoryId?: number;
		ingredientIds?: number[];
		items?: Array<{ id?: number; price: number; sizeId?: number | null; doughTypeId?: number | null }>;
	},
): Promise<Product> => {
	const { data } = await axiosInstance.patch<Product>(`/dashboaed/products/${id}`, productData);
	return data;
};

export const deleteProduct = async (id: number): Promise<void> => {
	await axiosInstance.delete(`/dashboaed/products/${id}`);
};
