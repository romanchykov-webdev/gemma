import { Size, Type } from '@prisma/client';
import { axiosInstance } from './instance';

export const getSizes = async (): Promise<Size[]> => {
  const { data } = await axiosInstance.get<Size[]>('/references/sizes');
  return data;
};

export const getTypes = async (): Promise<Type[]> => {
  const { data } = await axiosInstance.get<Type[]>('/references/types');
  return data;
};
