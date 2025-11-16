import { CreateIngredientData, UpdateIngredientData } from "./ingredient-types";

// Валидация данных ингредиента
export const validateIngredientData = (data: CreateIngredientData | UpdateIngredientData): string | null => {
	if (!data.name.trim()) {
		return "Il nome non può essere vuoto";
	}

	if (!data.price || data.price <= 0) {
		return "Inserisci un prezzo valido";
	}

	if (!data.imageUrl.trim()) {
		return "L'URL dell'immagine non può essere vuoto";
	}

	// Простая проверка URL
	try {
		new URL(data.imageUrl);
	} catch {
		return "Inserisci un URL valido per l'immagine";
	}

	return null; // Нет ошибок
};

// Форматирование цены
export const formatPrice = (price: number | string | { toString(): string }): string => {
	const numericPrice = typeof price === "number" ? price : Number(price);
	return `${numericPrice.toFixed(2)} €`;
};

// Проверка, является ли URL изображением
export const isValidImageUrl = (url: string): boolean => {
	const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];
	const lowerUrl = url.toLowerCase();
	return imageExtensions.some((ext) => lowerUrl.includes(ext));
};
