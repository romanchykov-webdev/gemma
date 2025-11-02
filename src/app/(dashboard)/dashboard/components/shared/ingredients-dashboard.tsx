"use client";

import { Api } from "@/../services/api-client";
import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { IngredientCard } from "./ingredients/ingredient-card";
import { IngredientCreateForm } from "./ingredients/ingredient-create-form";
import { CreateIngredientData, Ingredient, UpdateIngredientData } from "./ingredients/ingredient-types";
import { validateIngredientData } from "./ingredients/ingredient-utils";

interface Props {
	className?: string;
}

export const IngredientsDashboard: React.FC<Props> = ({ className }) => {
	const [ingredients, setIngredients] = useState<Ingredient[]>([]);
	const [loading, setLoading] = useState(true);
	const [isCreating, setIsCreating] = useState(false);

	// Загрузка ингредиентов при монтировании
	useEffect(() => {
		loadIngredients();
	}, []);

	const loadIngredients = async () => {
		try {
			setLoading(true);
			const data = await Api.ingredients_dashboard.getIngredients();
			setIngredients(data);
		} catch (error) {
			toast.error("Errore nel caricamento degli ingredienti");
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	// Создание нового ингредиента
	const handleCreate = async (data: CreateIngredientData) => {
		// Валидация
		const validationError = validateIngredientData(data);
		if (validationError) {
			toast.error(validationError);
			return;
		}

		try {
			setIsCreating(true);
			const newIngredient = await Api.ingredients_dashboard.createIngredient(data);
			setIngredients([newIngredient, ...ingredients]);
			toast.success("Ingrediente creato con successo");
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

	// Обновление ингредиента
	const handleUpdate = async (id: number, data: UpdateIngredientData) => {
		// Валидация
		const validationError = validateIngredientData(data);
		if (validationError) {
			toast.error(validationError);
			return;
		}

		try {
			const updated = await Api.ingredients_dashboard.updateIngredient(id, data);
			setIngredients(ingredients.map((ing) => (ing.id === id ? updated : ing)));
			toast.success("Ingrediente aggiornato");
		} catch (error: unknown) {
			const message =
				error instanceof Error && "response" in error
					? (error as { response?: { data?: { message?: string } } }).response?.data?.message
					: "Errore nell'aggiornamento";
			toast.error(message || "Errore nell'aggiornamento");
		}
	};

	// Удаление ингредиента
	const handleDelete = async (id: number) => {
		try {
			await Api.ingredients_dashboard.deleteIngredient(id);
			setIngredients(ingredients.filter((ing) => ing.id !== id));
			toast.success("Ingrediente eliminato");
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
					<div className="h-12 bg-gray-200 rounded"></div>
				</div>
			</div>
		);
	}

	return (
		<div className={cn("space-y-6", className)}>
			{/* Заголовок */}
			<div>
				<h2 className="text-2xl font-bold">Gestione Ingredienti</h2>
				<p className="text-gray-500 text-sm mt-1">Totale: {ingredients.length} ingredienti</p>
			</div>

			{/* Форма создания */}
			<IngredientCreateForm onSubmit={handleCreate} isCreating={isCreating} />

			{/* Список ингредиентов */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
				{ingredients.length === 0 ? (
					<div className="col-span-full text-center py-12 text-gray-500">
						<p>Nessun ingrediente trovato</p>
						<p className="text-sm mt-2">Inizia creando il tuo primo ingrediente</p>
					</div>
				) : (
					ingredients.map((ingredient) => (
						<IngredientCard
							key={ingredient.id}
							ingredient={ingredient}
							onUpdate={handleUpdate}
							onDelete={handleDelete}
						/>
					))
				)}
			</div>
		</div>
	);
};
