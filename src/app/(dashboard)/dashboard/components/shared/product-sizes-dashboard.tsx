"use client";

import { Api } from "@/../services/api-client";
import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { ProductSizeCard } from "./product-sizes/product-size-card";
import { ProductSizeCreateForm } from "./product-sizes/product-size-create-form";
import { CreateProductSizeData, ProductSize, UpdateProductSizeData } from "./product-sizes/product-size-types";
import { isDuplicateName, isDuplicateValue, validateProductSizeData } from "./product-sizes/product-size-utils";

interface Props {
	className?: string;
}

export const ProductSizesDashboard: React.FC<Props> = ({ className }) => {
	const [sizes, setSizes] = useState<ProductSize[]>([]);
	const [loading, setLoading] = useState(true);
	const [isCreating, setIsCreating] = useState(false);

	useEffect(() => {
		loadSizes();
	}, []);

	const loadSizes = async () => {
		try {
			setLoading(true);
			const data = await Api.product_sizes_dashboard.getProductSizes();
			setSizes(data);
		} catch (error) {
			toast.error("Errore nel caricamento delle dimensioni");
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	const handleCreate = async (data: CreateProductSizeData) => {
		// Валидация
		const validationError = validateProductSizeData(data);
		if (validationError) {
			toast.error(validationError);
			return;
		}

		// Проверка на дубликаты
		if (isDuplicateName(data.name, sizes)) {
			toast.error("Esiste già una dimensione con questo nome");
			return;
		}

		if (isDuplicateValue(data.value, sizes)) {
			toast.error("Esiste già una dimensione con questo valore");
			return;
		}

		try {
			setIsCreating(true);
			const created = await Api.product_sizes_dashboard.createProductSize(data);
			setSizes([created, ...sizes]);
			toast.success("Dimensione creata con successo");
		} catch (error: unknown) {
			const message =
				error instanceof Error && "response" in error
					? (error as { response?: { data?: { message?: string } } }).response?.data?.message
					: "Errore nella creazione";
			toast.error(message || "Errore nella creazione");
		} finally {
			setIsCreating(false);
		}
	};

	const handleUpdate = async (id: number, data: UpdateProductSizeData) => {
		// Валидация
		const validationError = validateProductSizeData(data);
		if (validationError) {
			toast.error(validationError);
			return;
		}

		// Проверка на дубликаты (исключая текущий элемент)
		if (isDuplicateName(data.name, sizes, id)) {
			toast.error("Esiste già una dimensione con questo nome");
			return;
		}

		if (isDuplicateValue(data.value, sizes, id)) {
			toast.error("Esiste già una dimensione con questo valore");
			return;
		}

		try {
			const updated = await Api.product_sizes_dashboard.updateProductSize(id, data);
			setSizes(sizes.map((s) => (s.id === id ? updated : s)));
			toast.success("Dimensione aggiornata");
		} catch (error: unknown) {
			const message =
				error instanceof Error && "response" in error
					? (error as { response?: { data?: { message?: string } } }).response?.data?.message
					: "Errore nell'aggiornamento";
			toast.error(message || "Errore nell'aggiornamento");
		}
	};

	const handleDelete = async (id: number) => {
		try {
			await Api.product_sizes_dashboard.deleteProductSize(id);
			setSizes(sizes.filter((s) => s.id !== id));
			toast.success("Dimensione eliminata");
		} catch (error: unknown) {
			const message =
				error instanceof Error && "response" in error
					? (error as { response?: { data?: { message?: string } } }).response?.data?.message
					: "Errore nell'eliminazione";
			toast.error(message || "Errore nell'eliminazione");
		}
	};

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
			<div>
				<h2 className="text-2xl font-bold">Gestione Dimensioni Prodotto</h2>
				<p className="text-gray-500 text-sm mt-1">Totale: {sizes.length} dimensioni</p>
			</div>

			<ProductSizeCreateForm onSubmit={handleCreate} isCreating={isCreating} />

			<div className="space-y-2">
				{sizes.length === 0 ? (
					<div className="text-center py-12 text-gray-500">
						<p>Nessuna dimensione trovata</p>
						<p className="text-sm mt-2">Inizia creando la tua prima dimensione</p>
					</div>
				) : (
					sizes.map((size) => (
						<ProductSizeCard key={size.id} size={size} onUpdate={handleUpdate} onDelete={handleDelete} />
					))
				)}
			</div>
		</div>
	);
};
