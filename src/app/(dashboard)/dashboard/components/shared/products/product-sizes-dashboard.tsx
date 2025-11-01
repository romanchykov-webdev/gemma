"use client";

import { Api } from "@/../services/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

interface Props {
	className?: string;
}

type ProductSize = {
	id: number;
	name: string;
	value: number;
	sortOrder: number;
	_count?: {
		productItems: number;
	};
};

export const ProductSizesDashboard: React.FC<Props> = ({ className }) => {
	const [sizes, setSizes] = useState<ProductSize[]>([]);
	const [loading, setLoading] = useState(true);
	const [editingId, setEditingId] = useState<number | null>(null);
	const [editingData, setEditingData] = useState({ name: "", value: 0, sortOrder: 0 });
	const [newSize, setNewSize] = useState({ name: "", value: 0, sortOrder: 0 });
	const [isCreating, setIsCreating] = useState(false);

	// Загрузка размеров
	useEffect(() => {
		loadSizes();
	}, []);

	const loadSizes = async () => {
		try {
			setLoading(true);
			const data = await Api.product_sizes_dashboard.getProductSizes();
			setSizes(data);
		} catch (error) {
			toast.error("Errore nel caricamento dei formati");
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	// Создание размера
	const handleCreate = async () => {
		if (!newSize.name.trim()) {
			toast.error("Inserisci il nome del formato (es: Piccola)");
			return;
		}

		if (!newSize.value || newSize.value <= 0) {
			toast.error("Inserisci il valore in cm (es: 20)");
			return;
		}

		try {
			setIsCreating(true);
			const created = await Api.product_sizes_dashboard.createProductSize({
				name: newSize.name.trim(),
				value: Number(newSize.value),
				sortOrder: Number(newSize.sortOrder) || 0,
			});
			setSizes([...sizes, created].sort((a, b) => a.sortOrder - b.sortOrder));
			setNewSize({ name: "", value: 0, sortOrder: 0 });
			toast.success("Formato creato con successo");
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

	// Начало редактирования
	const startEditing = (size: ProductSize) => {
		setEditingId(size.id);
		setEditingData({
			name: size.name,
			value: size.value,
			sortOrder: size.sortOrder,
		});
	};

	// Сохранение изменений
	const handleUpdate = async (id: number) => {
		if (!editingData.name.trim()) {
			toast.error("Il nome non può essere vuoto");
			return;
		}

		if (!editingData.value || editingData.value <= 0) {
			toast.error("Il valore deve essere maggiore di 0");
			return;
		}

		try {
			const updated = await Api.product_sizes_dashboard.updateProductSize(id, {
				name: editingData.name.trim(),
				value: Number(editingData.value),
				sortOrder: Number(editingData.sortOrder),
			});
			setSizes(sizes.map((size) => (size.id === id ? updated : size)).sort((a, b) => a.sortOrder - b.sortOrder));
			setEditingId(null);
			toast.success("Formato aggiornato");
		} catch (error: unknown) {
			const message =
				error instanceof Error && "response" in error
					? (error as { response?: { data?: { message?: string } } }).response?.data?.message
					: "Errore nell'aggiornamento";
			toast.error(message || "Errore nell'aggiornamento");
		}
	};

	// Отмена редактирования
	const cancelEditing = () => {
		setEditingId(null);
		setEditingData({ name: "", value: 0, sortOrder: 0 });
	};

	// Удаление размера
	const handleDelete = async (id: number, productsCount: number) => {
		if (productsCount > 0) {
			toast.error(
				`Impossibile eliminare. Il formato è utilizzato da ${productsCount} prodotti. Prima di eliminare, rimuovi o modifica tutti i prodotti che lo utilizzano.`,
			);
			return;
		}

		if (!confirm("Sei sicuro di voler eliminare questo formato?")) {
			return;
		}

		try {
			await Api.product_sizes_dashboard.deleteProductSize(id);
			setSizes(sizes.filter((size) => size.id !== id));
			toast.success("Formato eliminato");
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
					<div className="h-8 bg-gray-200 rounded-md w-1/4"></div>
					<div className="h-12 bg-gray-200 rounded-md"></div>
					<div className="h-12 bg-gray-200 rounded-md"></div>
				</div>
			</div>
		);
	}

	return (
		<div className={cn("p-6 space-y-6", className)}>
			{/* Заголовок */}
			<div>
				<h2 className="text-2xl font-bold">Gestione Formati Pizza</h2>
				<p className="text-gray-500 text-sm mt-1">Totale: {sizes.length} formati</p>
			</div>

			{/* Форма создания нового размера */}
			<div className="flex gap-2 items-end">
				<div className="flex-1">
					<label className="text-sm font-medium mb-1 block">Nome (es: Piccola)</label>
					<Input
						placeholder="Nome formato..."
						value={newSize.name}
						onChange={(e) => setNewSize({ ...newSize, name: e.target.value })}
						disabled={isCreating}
					/>
				</div>
				<div className="w-32">
					<label className="text-sm font-medium mb-1 block">Valore (cm)</label>
					<Input
						type="number"
						placeholder="20"
						value={newSize.value || ""}
						onChange={(e) => setNewSize({ ...newSize, value: Number(e.target.value) })}
						disabled={isCreating}
					/>
				</div>
				<div className="w-24">
					<label className="text-sm font-medium mb-1 block">Ordine</label>
					<Input
						type="number"
						placeholder="0"
						value={newSize.sortOrder || ""}
						onChange={(e) => setNewSize({ ...newSize, sortOrder: Number(e.target.value) })}
						disabled={isCreating}
					/>
				</div>
				<Button
					onClick={handleCreate}
					disabled={isCreating || !newSize.name.trim() || !newSize.value}
					className="h-10"
				>
					<Plus className="w-4 h-4 mr-2" />
					Aggiungi
				</Button>
			</div>

			{/* Список размеров */}
			<div className="space-y-2">
				{sizes.map((size) => (
					<div
						key={size.id}
						className="flex items-center gap-2 p-3 bg-white border rounded-lg hover:shadow-md transition"
					>
						{editingId === size.id ? (
							<>
								<div className="flex-1 flex gap-2">
									<Input
										value={editingData.name}
										onChange={(e) => setEditingData({ ...editingData, name: e.target.value })}
										placeholder="Nome"
										autoFocus
									/>
									<Input
										type="number"
										value={editingData.value}
										onChange={(e) =>
											setEditingData({ ...editingData, value: Number(e.target.value) })
										}
										placeholder="Valore"
										className="w-24"
									/>
									<Input
										type="number"
										value={editingData.sortOrder}
										onChange={(e) =>
											setEditingData({ ...editingData, sortOrder: Number(e.target.value) })
										}
										placeholder="Ordine"
										className="w-20"
									/>
								</div>
								<Button
									size="icon"
									variant="ghost"
									onClick={() => handleUpdate(size.id)}
									className="text-green-600 hover:text-green-700"
								>
									<Check className="w-4 h-4" />
								</Button>
								<Button
									size="icon"
									variant="ghost"
									onClick={cancelEditing}
									className="text-gray-600 hover:text-gray-700"
								>
									<X className="w-4 h-4" />
								</Button>
							</>
						) : (
							<>
								<div className="flex-1">
									<p className="font-medium">
										{size.name} - {size.value} cm
									</p>
									<p className="text-sm text-gray-500">
										Ordine: {size.sortOrder} | {size._count?.productItems || 0} prodotti
									</p>
								</div>
								<Button
									size="icon"
									variant="ghost"
									onClick={() => startEditing(size)}
									className="text-blue-600 hover:text-blue-700"
								>
									<Pencil className="w-4 h-4" />
								</Button>
								<Button
									size="icon"
									variant="outline"
									onClick={() => handleDelete(size.id, size._count?.productItems || 0)}
									className="text-red-600 hover:text-red-700"
								>
									<Trash2 className="w-4 h-4" />
								</Button>
							</>
						)}
					</div>
				))}
			</div>

			{sizes.length === 0 && (
				<div className="text-center py-12 text-gray-500">
					<p>Nessun formato trovato</p>
					<p className="text-sm mt-2">Inizia creando il tuo primo formato sopra</p>
				</div>
			)}
		</div>
	);
};
