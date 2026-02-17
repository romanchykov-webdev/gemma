import { DoughType } from '@/app/(dashboard)/dashboard/components/shared/dough-types/dough-type-types';
import { axiosInstance } from '../instance';

export const getDoughTypes = async (): Promise<DoughType[]> => {
  const { data } = await axiosInstance.get<DoughType[]>('/dashboard/dough-types');
  return data;
};

//
export const createDoughType = async (typeData: {
  name: string;
  sortOrder?: number;
}): Promise<DoughType> => {
  const { data } = await axiosInstance.post<DoughType>('/dashboard/dough-types', typeData);
  return data;
};

//
export const updateDoughType = async (
  id: number,
  typeData: {
    name?: string;
    sortOrder?: number;
  },
): Promise<DoughType> => {
  const { data } = await axiosInstance.patch<DoughType>(`/dashboard/dough-types/${id}`, typeData);
  return data;
};

export const deleteDoughType = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/dashboard/dough-types/${id}`);
};
