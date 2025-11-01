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

type Category = {
	id: number;
	name: string;
	_count?: {
		products: number;
	};
};

export const CategoriesDashboard: React.FC<Props> = ({ className }) => {
	const [categories, setCategories] = useState<Category[]>([]);
	const [loading, setLoading] = useState(true);
	const [editingId, setEditingId] = useState<number | null>(null);
	const [editingName, setEditingName] = useState("");
	const [newCategoryName, setNewCategoryName] = useState("");
	const [isCreating, setIsCreating] = useState(false);

	// Загрузка категорий
	useEffect(() => {
		loadCategories();
	}, []);

	const loadCategories = async () => {
		try {
			setLoading(true);
			const data = await Api.categories_dashboard.getCategories();
			setCategories(data);
		} catch (error) {
			toast.error("Errore nel caricamento delle categorie");
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	// Создание категории
	const handleCreate = async () => {
		if (!newCategoryName.trim()) {
			toast.error("Inserisci il nome della categoria");
			return;
		}

		try {
			setIsCreating(true);
			const newCategory = await Api.categories_dashboard.createCategory(newCategoryName.trim());
			setCategories([...categories, newCategory]);
			setNewCategoryName("");
			toast.success("Categoria creata con successo");
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
	const startEditing = (category: Category) => {
		setEditingId(category.id);
		setEditingName(category.name);
	};

	// Сохранение изменений
	const handleUpdate = async (id: number) => {
		if (!editingName.trim()) {
			toast.error("Il nome non può essere vuoto");
			return;
		}

		try {
			const updated = await Api.categories_dashboard.updateCategory(id, editingName.trim());
			setCategories(categories.map((cat) => (cat.id === id ? updated : cat)));
			setEditingId(null);
			toast.success("Categoria aggiornata");
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
		setEditingName("");
	};

	// Удаление категории
	const handleDelete = async (id: number, productsCount: number) => {
		if (productsCount > 0) {
			toast.error(
				`Impossibile eliminare. La categoria contiene ${productsCount} prodotti, Prima di eliminare una categoria, rimuovi o sposta tutti i prodotti da essa.`,
			);
			return;
		}

		if (!confirm("Sei sicuro di voler eliminare questa categoria?")) {
			return;
		}

		try {
			await Api.categories_dashboard.deleteCategory(id);
			setCategories(categories.filter((cat) => cat.id !== id));
			toast.success("Categoria eliminata");
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
				<h2 className="text-2xl font-bold">Gestione Categorie</h2>
				<p className="text-gray-500 text-sm mt-1">Totale: {categories.length} categorie</p>
			</div>

			{/* Форма создания новой категории */}
			<div className="flex gap-2 items-center">
				<Input
					placeholder="Nome nuova categoria..."
					value={newCategoryName}
					onChange={(e) => setNewCategoryName(e.target.value)}
					onKeyPress={(e) => e.key === "Enter" && handleCreate()}
					disabled={isCreating}
				/>
				<Button onClick={handleCreate} disabled={isCreating || !newCategoryName.trim()} className="h-13">
					<Plus className="w-4 h-4 mr-2" />
					Aggiungi
				</Button>
			</div>

			{/* Список категорий */}
			<div className="space-y-2">
				{categories.map((category) => (
					<div
						key={category.id}
						className="flex items-center gap-2 p-3 bg-white border rounded-lg hover:shadow-md transition"
					>
						{editingId === category.id ? (
							<>
								<Input
									value={editingName}
									onChange={(e) => setEditingName(e.target.value)}
									onKeyPress={(e) => e.key === "Enter" && handleUpdate(category.id)}
									className="flex-1"
									autoFocus
								/>
								<Button
									size="icon"
									variant="ghost"
									onClick={() => handleUpdate(category.id)}
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
									<p className="font-medium">{category.name}</p>
									<p className="text-sm text-gray-500">{category._count?.products || 0} prodotti</p>
								</div>
								<Button
									size="icon"
									variant="ghost"
									onClick={() => startEditing(category)}
									className="text-blue-600 hover:text-blue-700"
								>
									<Pencil className="w-4 h-4" />
								</Button>
								<Button
									size="icon"
									variant="outline"
									onClick={() => handleDelete(category.id, category._count?.products || 0)}
									className="text-red-600 hover:text-red-700"
									// disabled={(category._count?.products || 0) > 0}
								>
									<Trash2 className="w-4 h-4" />
								</Button>
							</>
						)}
					</div>
				))}
			</div>

			{categories.length === 0 && (
				<div className="text-center py-12 text-gray-500">
					<p>Nessuna categoria trovata</p>
					<p className="text-sm mt-2">Inizia creando la tua prima categoria sopra</p>
				</div>
			)}
		</div>
	);
};
