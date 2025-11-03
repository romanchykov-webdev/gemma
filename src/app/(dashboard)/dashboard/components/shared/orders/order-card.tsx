"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ChevronUp, Eye, Loader2, Package, Trash2 } from "lucide-react";
import React from "react";

import { OrderItemCard } from "./order-item-card";
import { Order, OrderStatus } from "./order-types";
import { parseOrderItems, statusColors, statusLabels } from "./order-utils";

interface Props {
	order: Order;
	isExpanded: boolean;
	onToggleExpand: (orderId: string) => void;
	onStatusChange: (orderId: string, status: OrderStatus) => void;
	onDelete: (orderId: string) => void;
	isLoading: boolean;
}

export const OrderCard: React.FC<Props> = ({
	order,
	isExpanded,
	onToggleExpand,
	onStatusChange,
	onDelete,
	isLoading,
}) => {
	const orderItems = parseOrderItems(order.items);

	return (
		<div className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition relative">
			{/* Основная информация */}
			{isLoading && (
				<div className="absolute top-0 left-0 w-full h-full bg-gray-500 opacity-50 flex items-center justify-center">
					<Loader2 className="animate-spin" size={50} />
				</div>
			)}
			<div className="p-4">
				<div className="flex items-start justify-between gap-4">
					{/* Левая часть - основная информация */}
					<div className="flex-1 min-w-0">
						<div className="flex items-center gap-3 mb-2">
							<Package className="w-5 h-5 text-gray-400 flex-shrink-0" />
							<h3 className="font-semibold text-lg truncate">{order.fullName}</h3>
							<Badge className={cn("text-xs border", statusColors[order.status])}>
								{statusLabels[order.status]}
							</Badge>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
							<div>
								<span className="font-medium">Email:</span> {order.email}
							</div>
							<div>
								<span className="font-medium">Telefono:</span> {order.phone}
							</div>
							<div className="sm:col-span-2">
								<span className="font-medium">Indirizzo:</span> {order.address}
							</div>
							<div>
								<span className="font-medium">Data:</span>{" "}
								{new Date(order.createdAt).toLocaleString("it-IT")}
							</div>
							<div>
								<span className="font-medium">Totale:</span>{" "}
								<span className="font-bold text-lg">{order.totalAmount.toFixed(2)} €</span>
							</div>
							<div className="sm:col-span-2">
								<span className="font-medium">Prodotti:</span> {orderItems.length} posizioni
							</div>
						</div>
					</div>

					{/* Правая часть - действия */}
					<div className="flex flex-col gap-2 items-end flex-shrink-0">
						<Select
							value={order.status}
							onValueChange={(value) => onStatusChange(order.id, value as OrderStatus)}
						>
							<SelectTrigger className="w-[150px]">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="PENDING">In Attesa</SelectItem>
								<SelectItem value="SUCCEEDED">Completato</SelectItem>
								<SelectItem value="CANCELLED">Annullato</SelectItem>
							</SelectContent>
						</Select>

						<div className="flex gap-2">
							<Button
								size="icon"
								variant="outline"
								onClick={() => onToggleExpand(order.id)}
								className="text-blue-600 hover:text-blue-700"
							>
								{isExpanded ? <ChevronUp className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
							</Button>
							<Button
								size="icon"
								variant="outline"
								onClick={() => onDelete(order.id)}
								className="text-red-600 hover:text-red-700"
							>
								<Trash2 className="w-4 h-4" />
							</Button>
						</div>
					</div>
				</div>
			</div>

			{/* Детали заказа (раскрывающаяся секция) */}
			{isExpanded && (
				<div className="border-t bg-gray-50 p-4 space-y-3">
					<div>
						<h4 className="font-semibold mb-2">Dettagli Ordine:</h4>
						<div className="text-sm space-y-1 text-gray-600">
							<div>
								<span className="font-medium">ID Ordine:</span> {order.id}
							</div>
							{order.paymentId && (
								<div>
									<span className="font-medium">ID Pagamento:</span> {order.paymentId}
								</div>
							)}
							{order.comment && (
								<div>
									<span className="font-medium">Commento:</span> {order.comment}
								</div>
							)}
							<div>
								<span className="font-medium">Aggiornato:</span>{" "}
								{new Date(order.updatedAt).toLocaleString("it-IT")}
							</div>
						</div>
					</div>

					{/* Товары в заказе */}
					<div>
						<h4 className="font-semibold mb-3">Prodotti nel carrello:</h4>
						<div className="space-y-2">
							{orderItems.length > 0 ? (
								orderItems.map((item, index) => <OrderItemCard key={index} item={item} />)
							) : (
								<div className="text-sm text-gray-500 p-3 bg-white rounded-md border">
									Nessun prodotto trovato
								</div>
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	);
};
