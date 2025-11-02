"use client";

import { Api } from "@/../services/api-client";
import { cn } from "@/lib/utils";
import { Package } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { OrderCard } from "./orders/order-card";
import { Order, OrderStatus } from "./orders/order-types";

interface Props {
	className?: string;
}

export const OrdersDashboard: React.FC<Props> = ({ className }) => {
	const [orders, setOrders] = useState<Order[]>([]);
	const [loading, setLoading] = useState(true);
	const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

	// Загрузка заказов при монтировании
	useEffect(() => {
		loadOrders();
	}, []);

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
			const updated = await Api.orders_dashboard.updateOrderStatus(orderId, newStatus);
			setOrders(orders.map((order) => (order.id === orderId ? updated : order)));
			toast.success("Stato dell'ordine aggiornato");
		} catch (error: unknown) {
			const message =
				error instanceof Error && "response" in error
					? (error as { response?: { data?: { message?: string } } }).response?.data?.message
					: "Errore nell'aggiornamento";
			toast.error(message || "Errore nell'aggiornamento");
		}
	};

	// Удаление заказа
	const handleDelete = async (orderId: string) => {
		if (!confirm("Sei sicuro di voler eliminare questo ordine?")) {
			return;
		}

		try {
			await Api.orders_dashboard.deleteOrder(orderId);
			setOrders(orders.filter((order) => order.id !== orderId));
			toast.success("Ordine eliminato");
		} catch (error: unknown) {
			const message =
				error instanceof Error && "response" in error
					? (error as { response?: { data?: { message?: string } } }).response?.data?.message
					: "Errore nell'eliminazione";
			toast.error(message || "Errore nell'eliminazione");
		}
	};

	// Раскрытие деталей заказа
	const handleToggleExpand = (orderId: string) => {
		setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
	};

	if (loading) {
		return (
			<div className={cn("p-6", className)}>
				<div className="animate-pulse space-y-4">
					<div className="h-8 bg-gray-200 rounded-md w-1/4"></div>
					<div className="h-32 bg-gray-200 rounded-md"></div>
					<div className="h-32 bg-gray-200 rounded-md"></div>
				</div>
			</div>
		);
	}

	return (
		<div className={cn("p-6 space-y-6", className)}>
			{/* Заголовок */}
			<div>
				<h2 className="text-2xl font-bold">Gestione Ordini</h2>
				<p className="text-gray-500 text-sm mt-1">Totale: {orders.length} ordini</p>
			</div>

			{/* Список заказов */}
			<div className="space-y-4">
				{orders.map((order) => (
					<OrderCard
						key={order.id}
						order={order}
						isExpanded={expandedOrderId === order.id}
						onToggleExpand={handleToggleExpand}
						onStatusChange={handleStatusChange}
						onDelete={handleDelete}
					/>
				))}
			</div>

			{/* Пустое состояние */}
			{orders.length === 0 && (
				<div className="text-center py-12 text-gray-500">
					<Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
					<p>Nessun ordine trovato</p>
					<p className="text-sm mt-2">Gli ordini appariranno qui quando i clienti effettueranno acquisti</p>
				</div>
			)}
		</div>
	);
};
