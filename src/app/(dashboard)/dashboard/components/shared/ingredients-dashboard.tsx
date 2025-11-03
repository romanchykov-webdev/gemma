"use client";

import { cn } from "@/lib/utils";
import React from "react";
import { useIngredients } from "../../hooks/use-ingredients";
import { IngredientCard } from "./ingredients/ingredient-card";
import { IngredientCreateForm } from "./ingredients/ingredient-create-form";

interface Props {
	className?: string;
}

export const IngredientsDashboard: React.FC<Props> = ({ className }) => {
	// Hooks
	const { ingredients, loading, isCreating, loadingIngredientIds, handleCreate, handleUpdate, handleDelete } =
		useIngredients();

	// Loading state
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
							isLoading={loadingIngredientIds.has(ingredient.id)}
						/>
					))
				)}
			</div>
		</div>
	);
};
