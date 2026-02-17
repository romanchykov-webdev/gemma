import { axiosInstance } from '../../../../services/instance';

export type ProductSize = {
  id: number;
  name: string;
  value: number;
  sortOrder: number;
  _count?: { productItems: number };
};

export type DoughType = {
  id: number;
  name: string;
  value: number;
  sortOrder: number;
  _count?: { productItems: number };
};

// Product Sizes (универсальные размеры)
export const getProductSizes = async (): Promise<ProductSize[]> => {
  const { data } = await axiosInstance.get<ProductSize[]>('/dashboard/product-sizes');
  return data;
};

export const createProductSize = async (sizeData: {
  name: string;
  value: number;
  sortOrder?: number;
}): Promise<ProductSize> => {
  const { data } = await axiosInstance.post<ProductSize>('/dashboard/product-sizes', sizeData);
  return data;
};

export const updateProductSize = async (
  id: number,
  sizeData: Partial<ProductSize>,
): Promise<ProductSize> => {
  const { data } = await axiosInstance.patch<ProductSize>(
    `/dashboard/product-sizes/${id}`,
    sizeData,
  );
  return data;
};

export const deleteProductSize = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/dashboard/product-sizes/${id}`);
};

// Dough Types (типы теста для пиццы)
export const getDoughTypes = async (): Promise<DoughType[]> => {
  const { data } = await axiosInstance.get<DoughType[]>('/dashboard/dough-types');
  return data;
};

export const createDoughType = async (typeData: {
  name: string;
  value: number;
  sortOrder?: number;
}): Promise<DoughType> => {
  const { data } = await axiosInstance.post<DoughType>('/dashboard/dough-types', typeData);
  return data;
};

export const updateDoughType = async (
  id: number,
  typeData: Partial<DoughType>,
): Promise<DoughType> => {
  const { data } = await axiosInstance.patch<DoughType>(`/dashboard/dough-types/${id}`, typeData);
  return data;
};

export const deleteDoughType = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/dashboard/dough-types/${id}`);
};
