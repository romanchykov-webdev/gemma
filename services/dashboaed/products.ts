// import { Decimal } from "@prisma/client/runtime/library";
import { Product } from "@/app/(dashboard)/dashboard/components/shared/products/product-types";
import { axiosInstance } from "../instance";

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
