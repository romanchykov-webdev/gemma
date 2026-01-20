// Основной тип категории
export type Category = {
  id: number;
  name: string;
  _count?: {
    products: number;
  };
};

// Тип для создания категории (без id)
export type CreateCategoryData = {
  name: string;
};

// Тип для обновления категории
export type UpdateCategoryData = {
  name: string;
};
