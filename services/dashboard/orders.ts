import { Order } from '@/app/(dashboard)/dashboard/components/shared/orders/order-types';
import { axiosInstance } from '../instance';

export const getOrders = async (): Promise<Order[]> => {
  const { data } = await axiosInstance.get<Order[]>('/dashboard/orders');
  return data;
};

export const updateOrderStatus = async (
  id: string,
  status: 'PENDING' | 'SUCCEEDED' | 'CANCELLED',
): Promise<Order> => {
  const { data } = await axiosInstance.patch<Order>(`/dashboard/orders/${id}`, { status });
  return data;
};

export const deleteOrder = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/dashboard/orders/${id}`);
};
