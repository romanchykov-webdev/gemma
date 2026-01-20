import { ProductSize } from '@/app/(dashboard)/dashboard/components/shared/product-sizes/product-size-types';
import { axiosInstance } from '../instance';

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
  sizeData: {
    name?: string;
    value?: number;
    sortOrder?: number;
  },
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
