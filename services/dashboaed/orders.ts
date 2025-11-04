import { Order } from "@/app/(dashboard)/dashboard/components/shared/orders/order-types";
import { axiosInstance } from "../instance";
// export type Order = {
// 	id: string;
// 	fullName: string;
// 	email: string;
// 	phone: string;
// 	address: string;
// 	totalAmount: number;
// 	status: "PENDING" | "SUCCEEDED" | "CANCELLED";
// 	paymentId: string | null;
// 	items: unknown; // JSON
// 	comment: string | null;
// 	createdAt: Date;
// 	updatedAt: Date;
// 	userId: string | null;
// };

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
