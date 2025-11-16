import { Ingredient } from "@/app/(dashboard)/dashboard/components/shared/ingredients/ingredient-types";
import { axiosInstance } from "../instance";

export const getIngredients = async (): Promise<Ingredient[]> => {
	const { data } = await axiosInstance.get<Ingredient[]>("/ingredients");
	return data;
};

export const createIngredient = async (ingredientData: {
	name: string;
	price: number;
	imageUrl: string;
}): Promise<Ingredient> => {
	const { data } = await axiosInstance.post<Ingredient>("/dashboaed/ingredients", ingredientData);
	return data;
};

export const updateIngredient = async (
	id: number,
	ingredientData: {
		name?: string;
		price?: number;
		imageUrl?: string;
	},
): Promise<Ingredient> => {
	const { data } = await axiosInstance.patch<Ingredient>(`/dashboaed/ingredients/${id}`, ingredientData);
	return data;
};

export const deleteIngredient = async (id: number): Promise<void> => {
	await axiosInstance.delete(`/dashboaed/ingredients/${id}`);
};
