"use client";

import { Api } from "@/../services/api-client";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
	CreateIngredientData,
	Ingredient,
	UpdateIngredientData,
} from "../components/shared/ingredients/ingredient-types";
import { validateIngredientData } from "../components/shared/ingredients/ingredient-utils";

interface UseIngredientsReturn {
	ingredients: Ingredient[];
	loading: boolean;
	isCreating: boolean;
	loadingIngredientIds: Set<number>; // Добавить
	loadIngredients: () => Promise<void>;
	handleCreate: (data: CreateIngredientData) => Promise<void>;
	handleUpdate: (id: number, data: UpdateIngredientData) => Promise<void>;
	handleDelete: (id: number) => Promise<void>;
}

/**
 * Кастомный хук для управления ингредиентами
 * Изолирует всю логику работы с API и состоянием от UI компонента
 */
export const useIngredients = (): UseIngredientsReturn => {
	const [ingredients, setIngredients] = useState<Ingredient[]>([]);
	const [loading, setLoading] = useState(true);
	const [isCreating, setIsCreating] = useState(false);
	const [loadingIngredientIds, setLoadingIngredientIds] = useState<Set<number>>(new Set()); // Добавить

	// Загрузка ингредиентов
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
			// Добавляем ID в список загружающихся
			setLoadingIngredientIds((prev) => new Set(prev).add(id));

			const updated = await Api.ingredients_dashboard.updateIngredient(id, data);
			setIngredients(ingredients.map((ing) => (ing.id === id ? updated : ing)));
			toast.success("Ingrediente aggiornato");
		} catch (error: unknown) {
			const message =
				error instanceof Error && "response" in error
					? (error as { response?: { data?: { message?: string } } }).response?.data?.message
					: "Errore nell'aggiornamento";
			toast.error(message || "Errore nell'aggiornamento");
		} finally {
			// Убираем ID из списка загружающихся
			setLoadingIngredientIds((prev) => {
				const next = new Set(prev);
				next.delete(id);
				return next;
			});
		}
	};

	// Удаление ингредиента
	const handleDelete = async (id: number) => {
		try {
			// Добавляем ID в список загружающихся
			setLoadingIngredientIds((prev) => new Set(prev).add(id));

			await Api.ingredients_dashboard.deleteIngredient(id);
			setIngredients(ingredients.filter((ing) => ing.id !== id));
			toast.success("Ingrediente eliminato");
		} catch (error: unknown) {
			const message =
				error instanceof Error && "response" in error
					? (error as { response?: { data?: { message?: string } } }).response?.data?.message
					: "Errore nell'eliminazione";
			toast.error(message || "Errore nell'eliminazione");
		} finally {
			// Убираем ID из списка загружающихся
			setLoadingIngredientIds((prev) => {
				const next = new Set(prev);
				next.delete(id);
				return next;
			});
		}
	};

	// Загрузка при монтировании
	useEffect(() => {
		loadIngredients();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return {
		ingredients,
		loading,
		isCreating,
		loadingIngredientIds, // Добавить
		loadIngredients,
		handleCreate,
		handleUpdate,
		handleDelete,
	};
};
