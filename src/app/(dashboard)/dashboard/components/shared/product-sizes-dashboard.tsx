"use client";

import { cn } from "@/lib/utils";
import React from "react";
import { useProductSizes } from "../../hooks/use-product-sizes";
import { ProductSizeCard } from "./product-sizes/product-size-card";
import { ProductSizeCreateForm } from "./product-sizes/product-size-create-form";

interface Props {
	className?: string;
}

export const ProductSizesDashboard: React.FC<Props> = ({ className }) => {
	// Hooks
	const { sizes, loading, isCreating, loadingProductSizeIds, handleCreate, handleUpdate, handleDelete } =
		useProductSizes();

	// Loading state
	if (loading) {
		return (
			<div className={cn("p-6", className)}>
				<div className="animate-pulse space-y-4">
					<div className="h-8 bg-gray-200 rounded w-1/4"></div>
					<div className="h-12 bg-gray-200 rounded"></div>
					<div className="h-12 bg-gray-200 rounded"></div>
				</div>
			</div>
		);
	}

	return (
		<div className={cn("space-y-6", className)}>
			{/* Заголовок */}
			<div>
				<h2 className="text-2xl font-bold">Gestione Dimensioni Prodotto</h2>
				<p className="text-gray-500 text-sm mt-1">Totale: {sizes.length} dimensioni</p>
			</div>

			{/* Форма создания */}
			<ProductSizeCreateForm onSubmit={handleCreate} isCreating={isCreating} />

			{/* Список размеров */}
			{sizes.length > 0 ? (
				<div className="space-y-2">
					{sizes.map((size) => (
						<ProductSizeCard
							key={size.id}
							size={size}
							onUpdate={handleUpdate}
							onDelete={handleDelete}
							isLoading={loadingProductSizeIds.has(size.id)}
						/>
					))}
				</div>
			) : (
				/* Пустое состояние */
				<div className="text-center py-12 text-gray-500">
					<p>Nessuna dimensione trovata</p>
					<p className="text-sm mt-2">Inizia creando la tua prima dimensione</p>
				</div>
			)}
		</div>
	);
};
