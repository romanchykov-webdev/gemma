"use client";

import { Api } from "@/../services/api-client";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Order, OrderStatus } from "../components/shared/orders/order-types";

interface UseOrdersReturn {
	orders: Order[];
	loading: boolean;
	expandedOrderId: string | null;
	loadingOrderIds: Set<string>; // Добавить
	loadOrders: () => Promise<void>;
	handleStatusChange: (orderId: string, newStatus: OrderStatus) => Promise<void>;
	handleDelete: (orderId: string) => Promise<void>;
	handleToggleExpand: (orderId: string) => void;
}

/**
 * Кастомный хук для управления заказами
 * Изолирует всю логику работы с API и состоянием от UI компонента
 */
export const useOrders = (): UseOrdersReturn => {
	const [orders, setOrders] = useState<Order[]>([]);
	const [loading, setLoading] = useState(true);
	const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
	const [loadingOrderIds, setLoadingOrderIds] = useState<Set<string>>(new Set());

	// Загрузка заказов
	const loadOrders = async () => {
		try {
			setLoading(true);
			const data = await Api.orders_dashboard.getOrders();
			setOrders(data);
		} catch (error) {
			toast.error("Errore nel caricamento degli ordini");
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	// Обновление статуса заказа
	const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
		try {
			// Добавляем ID заказа в список загружающихся
			setLoadingOrderIds((prev) => new Set(prev).add(orderId));

			const updated = await Api.orders_dashboard.updateOrderStatus(orderId, newStatus);
			setOrders(orders.map((order) => (order.id === orderId ? updated : order)));
			toast.success("Stato dell'ordine aggiornato");
		} catch (error: unknown) {
			const message =
				error instanceof Error && "response" in error
					? (error as { response?: { data?: { message?: string } } }).response?.data?.message
					: "Errore nell'aggiornamento";
			toast.error(message || "Errore nell'aggiornamento");
		} finally {
			// Убираем ID заказа из списка загружающихся
			setLoadingOrderIds((prev) => {
				const next = new Set(prev);
				next.delete(orderId);
				return next;
			});
		}
	};

	// Удаление заказа
	const handleDelete = async (orderId: string) => {
		if (!confirm("Sei sicuro di voler eliminare questo ordine?")) {
			return;
		}

		try {
			// Добавляем ID заказа в список загружающихся
			setLoadingOrderIds((prev) => new Set(prev).add(orderId));

			await Api.orders_dashboard.deleteOrder(orderId);
			setOrders(orders.filter((order) => order.id !== orderId));
			toast.success("Ordine eliminato");
		} catch (error: unknown) {
			const message =
				error instanceof Error && "response" in error
					? (error as { response?: { data?: { message?: string } } }).response?.data?.message
					: "Errore nell'eliminazione";
			toast.error(message || "Errore nell'eliminazione");
		} finally {
			// Убираем ID заказа из списка загружающихся
			setLoadingOrderIds((prev) => {
				const next = new Set(prev);
				next.delete(orderId);
				return next;
			});
		}
	};

	// Раскрытие/скрытие деталей заказа
	const handleToggleExpand = (orderId: string) => {
		setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
	};

	// Загрузка при монтировании
	useEffect(() => {
		loadOrders();
	}, []);

	return {
		orders,
		loading,
		expandedOrderId,
		loadingOrderIds,
		loadOrders,
		handleStatusChange,
		handleDelete,
		handleToggleExpand,
	};
};
