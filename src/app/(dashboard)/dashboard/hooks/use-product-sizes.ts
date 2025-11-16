"use client";

import { Api } from "@/../services/api-client";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
	CreateProductSizeData,
	ProductSize,
	UpdateProductSizeData,
} from "../components/shared/product-sizes/product-size-types";
import {
	isDuplicateName,
	isDuplicateValue,
	validateProductSizeData,
} from "../components/shared/product-sizes/product-size-utils";

interface UseProductSizesReturn {
	sizes: ProductSize[];
	loading: boolean;
	isCreating: boolean;
	loadingProductSizeIds: Set<number>;
	loadSizes: () => Promise<void>;
	handleCreate: (data: CreateProductSizeData) => Promise<void>;
	handleUpdate: (id: number, data: UpdateProductSizeData) => Promise<void>;
	handleDelete: (id: number) => Promise<void>;
}

/**
 * Кастомный хук для управления размерами продуктов
 * Изолирует всю логику работы с API и состоянием от UI компонента
 */
export const useProductSizes = (): UseProductSizesReturn => {
	const [sizes, setSizes] = useState<ProductSize[]>([]);
	const [loading, setLoading] = useState(true);
	const [isCreating, setIsCreating] = useState(false);
	const [loadingProductSizeIds, setLoadingProductSizeIds] = useState<Set<number>>(new Set());

	// Загрузка размеров
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

	// Создание размера
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

	// Обновление размера
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
			// Добавляем ID в список загружающихся
			setLoadingProductSizeIds((prev) => new Set(prev).add(id));

			const updated = await Api.product_sizes_dashboard.updateProductSize(id, data);
			setSizes(sizes.map((s) => (s.id === id ? updated : s)));
			toast.success("Dimensione aggiornata");
		} catch (error: unknown) {
			const message =
				error instanceof Error && "response" in error
					? (error as { response?: { data?: { message?: string } } }).response?.data?.message
					: "Errore nell'aggiornamento";
			toast.error(message || "Errore nell'aggiornamento");
		} finally {
			// Убираем ID из списка загружающихся
			setLoadingProductSizeIds((prev) => {
				const next = new Set(prev);
				next.delete(id);
				return next;
			});
		}
	};

	// Удаление размера
	const handleDelete = async (id: number) => {
		try {
			// Добавляем ID в список загружающихся
			setLoadingProductSizeIds((prev) => new Set(prev).add(id));

			await Api.product_sizes_dashboard.deleteProductSize(id);
			setSizes(sizes.filter((s) => s.id !== id));
			toast.success("Dimensione eliminata");
		} catch (error: unknown) {
			const message =
				error instanceof Error && "response" in error
					? (error as { response?: { data?: { message?: string } } }).response?.data?.message
					: "Errore nell'eliminazione";
			toast.error(message || "Errore nell'eliminazione");
		} finally {
			// Убираем ID из списка загружающихся
			setLoadingProductSizeIds((prev) => {
				const next = new Set(prev);
				next.delete(id);
				return next;
			});
		}
	};

	// Загрузка при монтировании
	useEffect(() => {
		loadSizes();
	}, []);

	return {
		sizes,
		loading,
		isCreating,
		loadingProductSizeIds, // Добавить
		loadSizes,
		handleCreate,
		handleUpdate,
		handleDelete,
	};
};
