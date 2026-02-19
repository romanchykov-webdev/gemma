// Категория
export type Category = {
  id: number;
  name: string;
};

// Размер продукта
export type ProductSize = {
  id: number;
  name: string;
  value: number;
};

// Тип теста
export type DoughType = {
  id: number;
  name: string;
  value: number;
};

// Ингредиент
export type Ingredient = {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
};

// 🔄 REFACTOR: Структура варианта, как она хранится в JSON БД
export type ProductVariant = {
  variantId: number;
  price: number;
  sizeId: number | null;
  typeId: number | null;
};

// Продукт
export type Product = {
  id: number;
  name: string;
  imageUrl: string;
  categoryId: number;
  category: {
    id: number;
    name: string;
  };
  createdAt: string | Date;
  updatedAt: string | Date;

  // 🔄 REFACTOR: Новая структура данных
  variants: ProductVariant[];
  // baseIngredients хранит полные объекты, чтобы не делать лишних джоинов
  baseIngredients: Array<{
    id: number;
    name: string;
    imageUrl: string;
    removable: boolean;
    isDisabled: boolean;
  }>;
  addableIngredientIds: number[];
};

// Данные для создания продукта
export type CreateProductData = {
  name: string;
  imageUrl: string;
  categoryId: number;

  // 🔄 REFACTOR: Отправляем полные объекты сразу
  baseIngredients?: Array<{
    id: number;
    name: string;
    imageUrl: string;
    removable: boolean;
    isDisabled: boolean;
  }>;

  addableIngredientIds?: number[];

  // 🔄 REFACTOR: Генерируем variantId и используем typeId
  variants?: Array<{
    variantId: number;
    price: number;
    sizeId?: number | undefined;
    typeId?: number | undefined;
  }>;
};

// Данные для обновления продукта
export type UpdateProductData = {
  name: string;
  imageUrl: string;
  categoryId: number;

  // 🔄 REFACTOR: Полные объекты для обновления
  baseIngredients?: Array<{
    id: number;
    name: string;
    imageUrl: string;
    removable: boolean;
    isDisabled: boolean;
  }>;

  addableIngredientIds?: number[];

  // 🔄 REFACTOR: Соответствие БД
  variants?: Array<{
    variantId: number; // Обязательно нужен ID для обновления
    price: number;
    sizeId?: number | null;
    typeId?: number | null;
  }>;
};
