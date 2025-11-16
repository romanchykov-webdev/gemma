export type DoughType = {
	id: number;
	name: string;
	value: number; // Авто-генерируемый ID (не редактируется)
	sortOrder: number;
	_count?: {
		productItems: number;
	};
};

// Тип для создания типа теста (без id и value)
export type CreateDoughTypeData = {
	name: string;
	sortOrder: number;
};

// Тип для обновления типа теста (без value, так как он авто-генерируемый)
export type UpdateDoughTypeData = {
	name: string;
	sortOrder: number;
};
