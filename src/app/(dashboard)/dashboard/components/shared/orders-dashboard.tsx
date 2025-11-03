"use client";

import { cn } from "@/lib/utils";
import { Package } from "lucide-react";
import React from "react";
import { useOrders } from "../../hooks/use-orders";
import { OrderCard } from "./orders/order-card";

interface Props {
	className?: string;
}

export const OrdersDashboard: React.FC<Props> = ({ className }) => {
	const { orders, loading, expandedOrderId, loadingOrderIds, handleToggleExpand, handleStatusChange, handleDelete } =
		useOrders();

	// Loading state
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
						isLoading={loadingOrderIds.has(order.id)}
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
