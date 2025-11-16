import { Category } from "@/app/(dashboard)/dashboard/components/shared/categories/category-types";
import { axiosInstance } from "../instance";

export const getCategories = async (): Promise<Category[]> => {
	const { data } = await axiosInstance.get<Category[]>("/dashboaed/categories");
	return data;
};

export const createCategory = async (name: string): Promise<Category> => {
	const { data } = await axiosInstance.post<Category>("/dashboaed/categories", { name });
	return data;
};

export const updateCategory = async (id: number, name: string): Promise<Category> => {
	const { data } = await axiosInstance.patch<Category>(`/dashboaed/categories/${id}`, { name });
	return data;
};

export const deleteCategory = async (id: number): Promise<void> => {
	await axiosInstance.delete(`/dashboaed/categories/${id}`);
};
