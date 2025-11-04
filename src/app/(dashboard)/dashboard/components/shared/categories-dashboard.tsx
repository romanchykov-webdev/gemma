"use client";

import { cn } from "@/lib/utils";
import React from "react";
import { useCategories } from "../../hooks/use-categories";
import { CategoryCard } from "./categories/category-card";
import { CategoryCreateForm } from "./categories/category-create-form";

interface Props {
	className?: string;
}

export const CategoriesDashboard: React.FC<Props> = ({ className }) => {
	// Hooks
	const { categories, loading, isCreating, loadingCategoryIds, handleCreate, handleUpdate, handleDelete } =
		useCategories();

	// Loading state
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
			<CategoryCreateForm onSubmit={handleCreate} isCreating={isCreating} />

			{/* Список категорий */}
			{categories.length > 0 ? (
				<div className="space-y-2">
					{categories.map((category) => (
						<CategoryCard
							key={category.id}
							category={category}
							onUpdate={handleUpdate}
							onDelete={handleDelete}
							isLoading={loadingCategoryIds.has(category.id)}
						/>
					))}
				</div>
			) : (
				/* Пустое состояние */
				<div className="text-center py-12 text-gray-500">
					<p>Nessuna categoria trovata</p>
					<p className="text-sm mt-2">Inizia creando la tua prima categoria sopra</p>
				</div>
			)}
		</div>
	);
};
