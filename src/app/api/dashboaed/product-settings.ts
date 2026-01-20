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
  const { data } = await axiosInstance.get<ProductSize[]>('/dashboaed/product-sizes');
  return data;
};

export const createProductSize = async (sizeData: {
  name: string;
  value: number;
  sortOrder?: number;
}): Promise<ProductSize> => {
  const { data } = await axiosInstance.post<ProductSize>('/dashboaed/product-sizes', sizeData);
  return data;
};

export const updateProductSize = async (
  id: number,
  sizeData: Partial<ProductSize>,
): Promise<ProductSize> => {
  const { data } = await axiosInstance.patch<ProductSize>(
    `/dashboaed/product-sizes/${id}`,
    sizeData,
  );
  return data;
};

export const deleteProductSize = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/dashboaed/product-sizes/${id}`);
};

// Dough Types (типы теста для пиццы)
export const getDoughTypes = async (): Promise<DoughType[]> => {
  const { data } = await axiosInstance.get<DoughType[]>('/dashboaed/dough-types');
  return data;
};

export const createDoughType = async (typeData: {
  name: string;
  value: number;
  sortOrder?: number;
}): Promise<DoughType> => {
  const { data } = await axiosInstance.post<DoughType>('/dashboaed/dough-types', typeData);
  return data;
};

export const updateDoughType = async (
  id: number,
  typeData: Partial<DoughType>,
): Promise<DoughType> => {
  const { data } = await axiosInstance.patch<DoughType>(`/dashboaed/dough-types/${id}`, typeData);
  return data;
};

export const deleteDoughType = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/dashboaed/dough-types/${id}`);
};
