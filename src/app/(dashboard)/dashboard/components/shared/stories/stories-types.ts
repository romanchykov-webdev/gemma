// Элемент истории
export type StoryItem = {
	id: number;
	sourceUrl: string;
	createdAt: Date;
};

// Основной тип истории
export type Story = {
	id: number;
	previewImageUrl: string;
	createdAt: Date;
	items: StoryItem[];
	_count?: {
		items: number;
	};
};

// Тип для создания истории
export type CreateStoryData = {
	previewImageUrl: string;
	items: {
		sourceUrl: string;
	}[];
};

// Тип для обновления истории
export type UpdateStoryData = {
	previewImageUrl?: string;
	items?: {
		sourceUrl: string;
	}[];
};
