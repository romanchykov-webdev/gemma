import { Ingredient } from '@/app/(dashboard)/dashboard/components/shared/ingredients/ingredient-types';
import { axiosInstance } from '../instance';

export const getIngredients = async (options?: { signal?: AbortSignal }): Promise<Ingredient[]> => {
  const { data } = await axiosInstance.get<Ingredient[]>('/ingredients', {
    signal: options?.signal,
  });
  return data;
};

export const createIngredient = async (ingredientData: {
  name: string;
  price: number;
  imageUrl: string;
}): Promise<Ingredient> => {
  const { data } = await axiosInstance.post<Ingredient>('/dashboard/ingredients', ingredientData);
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
  const { data } = await axiosInstance.patch<Ingredient>(
    `/dashboard/ingredients/${id}`,
    ingredientData,
  );
  return data;
};

export const deleteIngredient = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/dashboard/ingredients/${id}`);
};
