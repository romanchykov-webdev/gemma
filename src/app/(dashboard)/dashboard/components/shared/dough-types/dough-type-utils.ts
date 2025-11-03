import { CreateDoughTypeData, UpdateDoughTypeData } from "./dough-type-types";

/**
 * Валидация данных типа теста
 */
export const validateDoughTypeData = (data: CreateDoughTypeData | UpdateDoughTypeData): string | null => {
	if (!data.name.trim()) {
		return "Il nome non può essere vuoto";
	}

	return null;
};

/**
 * Форматирование значения ID
 */
export const formatDoughTypeValue = (value: number): string => {
	return `ID: ${value}`;
};

/**
 * Проверка уникальности имени
 */
export const isDuplicateName = (
	name: string,
	doughTypes: Array<{ name: string; id: number }>,
	excludeId?: number,
): boolean => {
	return doughTypes.some((type) => type.name.toLowerCase() === name.toLowerCase() && type.id !== excludeId);
};

/**
 * Сортировка типов теста по sortOrder
 */
export const sortByOrder = <T extends { sortOrder: number }>(items: T[]): T[] => {
	return [...items].sort((a, b) => a.sortOrder - b.sortOrder);
};
