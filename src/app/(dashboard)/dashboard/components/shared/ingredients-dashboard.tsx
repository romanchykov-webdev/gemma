"use client";

import { Api } from "@/../services/api-client";
import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { IngredientCard } from "./ingredients/ingredient-card";
import { IngredientCreateForm } from "./ingredients/ingredient-create-form";

interface Props {
	className?: string;
}

type Ingredient = {
	id: number;
	name: string;
	price: number;
	imageUrl: string;
};

export const IngredientsDashboard: React.FC<Props> = ({ className }) => {
	const [ingredients, setIngredients] = useState<Ingredient[]>([]);
	const [loading, setLoading] = useState(true);

	console.log("ingredients", ingredients);

	// Загрузка ингредиентов
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

	// Обработчик создания нового ингредиента
	const handleIngredientCreated = (newIngredient: Ingredient) => {
		setIngredients([newIngredient, ...ingredients]);
	};

	// Обработчик обновления ингредиента
	const handleIngredientUpdated = (id: number, updated: Ingredient) => {
		setIngredients(ingredients.map((ing) => (ing.id === id ? updated : ing)));
	};

	// Обработчик удаления ингредиента
	const handleIngredientDeleted = (id: number) => {
		setIngredients(ingredients.filter((ing) => ing.id !== id));
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
			<IngredientCreateForm onIngredientCreated={handleIngredientCreated} />

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
							onUpdate={handleIngredientUpdated}
							onDelete={handleIngredientDeleted}
						/>
					))
				)}
			</div>
		</div>
	);
};
