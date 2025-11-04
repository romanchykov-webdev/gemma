import { OrderItem } from "./order-types";

// Цвета для статусов
export const statusColors = {
	PENDING: "bg-yellow-100 text-yellow-800 border-yellow-300",
	SUCCEEDED: "bg-green-100 text-green-800 border-green-300",
	CANCELLED: "bg-red-100 text-red-800 border-red-300",
};

// Лейблы для статусов
export const statusLabels = {
	PENDING: "In Attesa",
	SUCCEEDED: "Completato",
	CANCELLED: "Annullato",
};

// Функция для парсинга items (может быть JSON string или массив)
export const parseOrderItems = (input: unknown): OrderItem[] => {
	if (Array.isArray(input)) {
		return input as OrderItem[];
	}
	if (typeof input === "string") {
		try {
			return JSON.parse(input) as OrderItem[];
		} catch {
			return [];
		}
	}
	return [];
};
