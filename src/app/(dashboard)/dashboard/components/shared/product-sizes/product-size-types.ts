export type ProductSize = {
	id: number;
	name: string;
	value: number;
	sortOrder: number;
	_count?: {
		productItems: number;
	};
};

// Тип для создания размера (без id)
export type CreateProductSizeData = {
	name: string;
	value: number;
	sortOrder: number;
};

// Тип для обновления размера
export type UpdateProductSizeData = CreateProductSizeData;
