import { Product } from '@/app/(dashboard)/dashboard/components/shared/products/product-types';
import { axiosInstance } from '../instance';

export const getProducts = async (categoryId?: number): Promise<Product[]> => {
  const url = categoryId ? `/dashboard/products?categoryId=${categoryId}` : '/dashboard/products';
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
  const { data } = await axiosInstance.post<Product>('/dashboard/products', productData);
  return data;
};

export const updateProduct = async (
  id: number,
  productData: {
    name?: string;
    imageUrl?: string;
    categoryId?: number;
    ingredientIds?: number[];
    items?: Array<{
      id?: number;
      price: number;
      sizeId?: number | null;
      doughTypeId?: number | null;
    }>;
  },
): Promise<Product> => {
  const { data } = await axiosInstance.patch<Product>(`/dashboard/products/${id}`, productData);
  return data;
};

export const deleteProduct = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/dashboard/products/${id}`);
};
