import { Order } from "@/app/(dashboard)/dashboard/components/shared/orders/order-types";
import { axiosInstance } from "../instance";

export const getOrders = async (): Promise<Order[]> => {
	const { data } = await axiosInstance.get<Order[]>("/dashboaed/orders");
	return data;
};

export const updateOrderStatus = async (id: string, status: "PENDING" | "SUCCEEDED" | "CANCELLED"): Promise<Order> => {
	const { data } = await axiosInstance.patch<Order>(`/dashboaed/orders/${id}`, { status });
	return data;
};

export const deleteOrder = async (id: string): Promise<void> => {
	await axiosInstance.delete(`/dashboaed/orders/${id}`);
};
