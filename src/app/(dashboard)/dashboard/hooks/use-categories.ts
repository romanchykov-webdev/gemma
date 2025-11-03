"use client";

import { Api } from "@/../services/api-client";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Category, CreateCategoryData, UpdateCategoryData } from "../components/shared/categories/category-types";
import {
	canDeleteCategory,
	getDeleteErrorMessage,
	validateCategoryData,
} from "../components/shared/categories/category-utils";

interface UseCategoriesReturn {
	categories: Category[];
	loading: boolean;
	isCreating: boolean;
	loadingCategoryIds: Set<number>;
	loadCategories: () => Promise<void>;
	handleCreate: (data: CreateCategoryData) => Promise<void>;
	handleUpdate: (id: number, data: UpdateCategoryData) => Promise<void>;
	handleDelete: (id: number, productsCount: number) => Promise<void>;
}

/**
 * Кастомный хук для управления категориями
 * Изолирует всю логику работы с API и состоянием от UI компонента
 */
export const useCategories = (): UseCategoriesReturn => {
	const [categories, setCategories] = useState<Category[]>([]);
	const [loading, setLoading] = useState(true);
	const [isCreating, setIsCreating] = useState(false);
	const [loadingCategoryIds, setLoadingCategoryIds] = useState<Set<number>>(new Set());

	// Загрузка категорий
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
	const handleCreate = async (data: CreateCategoryData) => {
		// Валидация
		const validationError = validateCategoryData(data);
		if (validationError) {
			toast.error(validationError);
			return;
		}

		try {
			setIsCreating(true);
			const newCategory = await Api.categories_dashboard.createCategory(data.name);
			setCategories([...categories, newCategory]);
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

	// Обновление категории
	const handleUpdate = async (id: number, data: UpdateCategoryData) => {
		// Валидация
		const validationError = validateCategoryData(data);
		if (validationError) {
			toast.error(validationError);
			return;
		}

		// Добавляем ID в состояние загрузки
		setLoadingCategoryIds((prev) => new Set(prev).add(id));

		try {
			const updated = await Api.categories_dashboard.updateCategory(id, data.name);
			setCategories(categories.map((cat) => (cat.id === id ? updated : cat)));
			toast.success("Categoria aggiornata");
		} catch (error: unknown) {
			const message =
				error instanceof Error && "response" in error
					? (error as { response?: { data?: { message?: string } } }).response?.data?.message
					: "Errore nell'aggiornamento";
			toast.error(message || "Errore nell'aggiornamento");
		} finally {
			// Удаляем ID из состояния загрузки
			setLoadingCategoryIds((prev) => {
				const newSet = new Set(prev);
				newSet.delete(id);
				return newSet;
			});
		}
	};

	// Удаление категории
	const handleDelete = async (id: number, productsCount: number) => {
		// Проверка возможности удаления
		if (!canDeleteCategory(productsCount)) {
			toast.error(getDeleteErrorMessage(productsCount));
			return;
		}

		// Добавляем ID в состояние загрузки
		setLoadingCategoryIds((prev) => new Set(prev).add(id));

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
		} finally {
			// Удаляем ID из состояния загрузки
			setLoadingCategoryIds((prev) => {
				const newSet = new Set(prev);
				newSet.delete(id);
				return newSet;
			});
		}
	};

	// Загрузка при монтировании
	useEffect(() => {
		loadCategories();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return {
		categories,
		loading,
		isCreating,
		loadingCategoryIds,
		loadCategories,
		handleCreate,
		handleUpdate,
		handleDelete,
	};
};
