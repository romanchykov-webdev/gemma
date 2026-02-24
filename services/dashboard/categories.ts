import { Category } from '@/app/(dashboard)/dashboard/components/shared/categories/category-types';
import { axiosInstance } from '../instance';

export const getCategories = async (options?: { signal?: AbortSignal }): Promise<Category[]> => {
  const { data } = await axiosInstance.get<Category[]>('/dashboard/categories', {
    signal: options?.signal,
  });
  return data;
};

export const createCategory = async (name: string): Promise<Category> => {
  const { data } = await axiosInstance.post<Category>('/dashboard/categories', { name });
  return data;
};

export const updateCategory = async (id: number, name: string): Promise<Category> => {
  const { data } = await axiosInstance.patch<Category>(`/dashboard/categories/${id}`, { name });
  return data;
};

export const deleteCategory = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/dashboard/categories/${id}`);
};
