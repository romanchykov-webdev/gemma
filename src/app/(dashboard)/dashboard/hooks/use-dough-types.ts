"use client";

import { Api } from "@/../services/api-client";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { CreateDoughTypeData, DoughType, UpdateDoughTypeData } from "../components/shared/dough-types/dough-type-types";
import { isDuplicateName, validateDoughTypeData } from "../components/shared/dough-types/dough-type-utils";

interface UseDoughTypesReturn {
	doughTypes: DoughType[];
	loading: boolean;
	isCreating: boolean;
	loadingDoughTypeIds: Set<number>; // Добавить
	loadDoughTypes: () => Promise<void>;
	handleCreate: (data: CreateDoughTypeData) => Promise<void>;
	handleUpdate: (id: number, data: UpdateDoughTypeData) => Promise<void>;
	handleDelete: (id: number) => Promise<void>;
}

/**
 * Кастомный хук для управления типами теста
 * Изолирует всю логику работы с API и состоянием от UI компонента
 */
export const useDoughTypes = (): UseDoughTypesReturn => {
	const [doughTypes, setDoughTypes] = useState<DoughType[]>([]);
	const [loading, setLoading] = useState(true);
	const [isCreating, setIsCreating] = useState(false);
	const [loadingDoughTypeIds, setLoadingDoughTypeIds] = useState<Set<number>>(new Set()); // Добавить

	// Загрузка типов теста
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

	// Создание типа теста
	const handleCreate = async (data: CreateDoughTypeData) => {
		// Валидация
		const validationError = validateDoughTypeData(data);
		if (validationError) {
			toast.error(validationError);
			return;
		}

		// Проверка на дубликаты
		if (isDuplicateName(data.name, doughTypes)) {
			toast.error("Esiste già un tipo di impasto con questo nome");
			return;
		}

		try {
			setIsCreating(true);
			const created = await Api.dough_types_dashboard.createDoughType(data);
			setDoughTypes([created, ...doughTypes]);
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

	// Обновление типа теста
	const handleUpdate = async (id: number, data: UpdateDoughTypeData) => {
		// Валидация
		const validationError = validateDoughTypeData(data);
		if (validationError) {
			toast.error(validationError);
			return;
		}

		// Проверка на дубликаты (исключая текущий элемент)
		if (isDuplicateName(data.name, doughTypes, id)) {
			toast.error("Esiste già un tipo di impasto con questo nome");
			return;
		}

		try {
			// Добавляем ID в список загружающихся
			setLoadingDoughTypeIds((prev) => new Set(prev).add(id));

			const updated = await Api.dough_types_dashboard.updateDoughType(id, data);
			setDoughTypes(doughTypes.map((dt) => (dt.id === id ? updated : dt)));
			toast.success("Tipo di impasto aggiornato");
		} catch (error: unknown) {
			const message =
				error instanceof Error && "response" in error
					? (error as { response?: { data?: { message?: string } } }).response?.data?.message
					: "Errore nell'aggiornamento";
			toast.error(message || "Errore nell'aggiornamento");
		} finally {
			// Убираем ID из списка загружающихся
			setLoadingDoughTypeIds((prev) => {
				const next = new Set(prev);
				next.delete(id);
				return next;
			});
		}
	};

	// Удаление типа теста
	const handleDelete = async (id: number) => {
		try {
			// Добавляем ID в список загружающихся
			setLoadingDoughTypeIds((prev) => new Set(prev).add(id));

			await Api.dough_types_dashboard.deleteDoughType(id);
			setDoughTypes(doughTypes.filter((dt) => dt.id !== id));
			toast.success("Tipo di impasto eliminato");
		} catch (error: unknown) {
			const message =
				error instanceof Error && "response" in error
					? (error as { response?: { data?: { message?: string } } }).response?.data?.message
					: "Errore nell'eliminazione";
			toast.error(message || "Errore nell'eliminazione");
		} finally {
			// Убираем ID из списка загружающихся
			setLoadingDoughTypeIds((prev) => {
				const next = new Set(prev);
				next.delete(id);
				return next;
			});
		}
	};

	// Загрузка при монтировании
	useEffect(() => {
		loadDoughTypes();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return {
		doughTypes,
		loading,
		isCreating,
		loadingDoughTypeIds, // Добавить
		loadDoughTypes,
		handleCreate,
		handleUpdate,
		handleDelete,
	};
};
