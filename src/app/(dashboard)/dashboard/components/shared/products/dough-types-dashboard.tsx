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

type DoughType = {
	id: number;
	name: string;
	value: number;
	sortOrder: number;
	_count?: {
		productItems: number;
	};
};

export const DoughTypesDashboard: React.FC<Props> = ({ className }) => {
	const [doughTypes, setDoughTypes] = useState<DoughType[]>([]);
	const [loading, setLoading] = useState(true);
	const [editingId, setEditingId] = useState<number | null>(null);
	const [editingData, setEditingData] = useState({ name: "", sortOrder: 0 }); // 🔥 Убрали value
	const [newDoughType, setNewDoughType] = useState({ name: "", sortOrder: 0 }); // 🔥 Убрали value
	const [isCreating, setIsCreating] = useState(false);

	// Загрузка типов теста
	useEffect(() => {
		loadDoughTypes();
	}, []);

	const loadDoughTypes = async () => {
		try {
			setLoading(true);
			const data = await Api.dough_types_dashboard.getDoughTypes();
			setDoughTypes(data);
		} catch (error) {
			toast.error("Errore nel caricamento dei tipi di impasto");
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	// 🔥 ОБНОВЛЕНО: Создание без value
	const handleCreate = async () => {
		if (!newDoughType.name.trim()) {
			toast.error("Inserisci il nome del tipo di impasto (es: Tradizionale)");
			return;
		}

		try {
			setIsCreating(true);
			const created = await Api.dough_types_dashboard.createDoughType({
				name: newDoughType.name.trim(),
				sortOrder: Number(newDoughType.sortOrder) || 0,
			});
			setDoughTypes([...doughTypes, created].sort((a, b) => a.sortOrder - b.sortOrder));
			setNewDoughType({ name: "", sortOrder: 0 });
			toast.success("Tipo di impasto creato con successo");
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

	// 🔥 ОБНОВЛЕНО: Редактирование без value
	const startEditing = (doughType: DoughType) => {
		setEditingId(doughType.id);
		setEditingData({
			name: doughType.name,
			sortOrder: doughType.sortOrder,
		});
	};

	// 🔥 ОБНОВЛЕНО: Обновление без value
	const handleUpdate = async (id: number) => {
		if (!editingData.name.trim()) {
			toast.error("Il nome non può essere vuoto");
			return;
		}

		try {
			const updated = await Api.dough_types_dashboard.updateDoughType(id, {
				name: editingData.name.trim(),
				sortOrder: Number(editingData.sortOrder),
			});
			setDoughTypes(
				doughTypes.map((type) => (type.id === id ? updated : type)).sort((a, b) => a.sortOrder - b.sortOrder),
			);
			setEditingId(null);
			toast.success("Tipo di impasto aggiornato");
		} catch (error: unknown) {
			const message =
				error instanceof Error && "response" in error
					? (error as { response?: { data?: { message?: string } } }).response?.data?.message
					: "Errore nell'aggiornamento";
			toast.error(message || "Errore nell'aggiornamento");
		}
	};

	// 🔥 ОБНОВЛЕНО: Отмена без value
	const cancelEditing = () => {
		setEditingId(null);
		setEditingData({ name: "", sortOrder: 0 });
	};

	// Удаление типа теста
	const handleDelete = async (id: number, productsCount: number) => {
		if (productsCount > 0) {
			toast.error(
				`Impossibile eliminare. Il tipo di impasto è utilizzato da ${productsCount} prodotti. Prima di eliminare, rimuovi o modifica tutti i prodotti che lo utilizzano.`,
			);
			return;
		}

		if (!confirm("Sei sicuro di voler eliminare questo tipo di impasto?")) {
			return;
		}

		try {
			await Api.dough_types_dashboard.deleteDoughType(id);
			setDoughTypes(doughTypes.filter((type) => type.id !== id));
			toast.success("Tipo di impasto eliminato");
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
				<h2 className="text-2xl font-bold">Gestione Tipi di Impasto</h2>
				<p className="text-gray-500 text-sm mt-1">Totale: {doughTypes.length} tipi</p>
				<p className="text-gray-500 text-xs mt-1">
					{`Per pizza usa "Tradizionale", "Sottile". Per bevande lascia vuoto il tipo di impasto. L'ID viene
					generato automaticamente.`}
				</p>
			</div>

			{/* 🔥 ОБНОВЛЕНО: Форма БЕЗ поля Valore ID */}
			<div className="flex gap-2 items-end">
				<div className="flex-1">
					<label className="text-sm font-medium mb-1 block">Nome (es: Tradizionale)</label>
					<Input
						placeholder="Nome tipo..."
						value={newDoughType.name}
						onChange={(e) => setNewDoughType({ ...newDoughType, name: e.target.value })}
						disabled={isCreating}
					/>
				</div>
				<div className="w-32">
					<label className="text-sm font-medium mb-1 block">Ordine</label>
					<Input
						type="number"
						placeholder="0"
						value={newDoughType.sortOrder || ""}
						onChange={(e) => setNewDoughType({ ...newDoughType, sortOrder: Number(e.target.value) })}
						disabled={isCreating}
					/>
				</div>
				<Button onClick={handleCreate} disabled={isCreating || !newDoughType.name.trim()} className="h-10">
					<Plus className="w-4 h-4 mr-2" />
					Aggiungi
				</Button>
			</div>

			{/* 🔥 ОБНОВЛЕНО: Список БЕЗ редактирования value */}
			<div className="space-y-2">
				{doughTypes.map((doughType) => (
					<div
						key={doughType.id}
						className="flex items-center gap-2 p-3 bg-white border rounded-lg hover:shadow-md transition"
					>
						{editingId === doughType.id ? (
							<>
								<div className="flex-1 flex gap-2">
									<Input
										value={editingData.name}
										onChange={(e) => setEditingData({ ...editingData, name: e.target.value })}
										placeholder="Nome"
										autoFocus
										className="flex-1"
									/>
									<Input
										type="number"
										value={editingData.sortOrder}
										onChange={(e) =>
											setEditingData({ ...editingData, sortOrder: Number(e.target.value) })
										}
										placeholder="Ordine"
										className="w-24"
									/>
								</div>
								<Button
									size="icon"
									variant="ghost"
									onClick={() => handleUpdate(doughType.id)}
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
										{doughType.name}{" "}
										<span className="text-gray-400 text-sm font-normal">
											(ID: {doughType.value})
										</span>
									</p>
									<p className="text-sm text-gray-500">
										Ordine: {doughType.sortOrder} | {doughType._count?.productItems || 0} prodotti
									</p>
								</div>
								<Button
									size="icon"
									variant="ghost"
									onClick={() => startEditing(doughType)}
									className="text-blue-600 hover:text-blue-700"
								>
									<Pencil className="w-4 h-4" />
								</Button>
								<Button
									size="icon"
									variant="outline"
									onClick={() => handleDelete(doughType.id, doughType._count?.productItems || 0)}
									className="text-red-600 hover:text-red-700"
								>
									<Trash2 className="w-4 h-4" />
								</Button>
							</>
						)}
					</div>
				))}
			</div>

			{doughTypes.length === 0 && (
				<div className="text-center py-12 text-gray-500">
					<p>Nessun tipo di impasto trovato</p>
					<p className="text-sm mt-2">Inizia creando il tuo primo tipo sopra</p>
				</div>
			)}
		</div>
	);
};
