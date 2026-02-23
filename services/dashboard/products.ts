import { ProductResponseDTO } from '@/app/(dashboard)/dashboard/components/shared/products/product-types';
import { axiosInstance } from '../instance';

// 🔄 Типы для API запросов
interface BaseIngredient {
  id: number;
  name: string;
  imageUrl: string;
  removable: boolean;
  isDisabled: boolean;
}

interface ProductVariant {
  variantId: number;
  price: number;
  sizeId?: number;
  typeId?: number;
}

interface CreateProductRequest {
  name: string;
  imageUrl: string;
  categoryId: number;
  baseIngredients?: BaseIngredient[];
  addableIngredientIds?: number[];
  variants?: ProductVariant[];
}

interface UpdateProductRequest {
  name?: string;
  imageUrl?: string;
  categoryId?: number;
  baseIngredients?: BaseIngredient[];
  addableIngredientIds?: number[];
  variants?: Array<{
    variantId: number;
    price: number;
    sizeId?: number | null;
    typeId?: number | null;
  }>;
}

// ✅ GET - Получение продуктов
export const getProducts = async (categoryId?: number): Promise<ProductResponseDTO[]> => {
  const url = categoryId ? `/dashboard/products?categoryId=${categoryId}` : '/dashboard/products';
  const { data } = await axiosInstance.get<ProductResponseDTO[]>(url);
  return data;
};

// ✅ POST - Создание продукта
export const createProduct = async (
  productData: CreateProductRequest,
): Promise<ProductResponseDTO> => {
  const { data } = await axiosInstance.post<ProductResponseDTO>('/dashboard/products', productData);
  return data;
};

// ✅ PATCH - Обновление продукта
export const updateProduct = async (
  id: number,
  productData: UpdateProductRequest,
): Promise<ProductResponseDTO> => {
  const { data } = await axiosInstance.patch<ProductResponseDTO>(
    `/dashboard/products/${id}`,
    productData,
  );
  return data;
};

// ✅ DELETE - Удаление продукта
export const deleteProduct = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/dashboard/products/${id}`);
};
