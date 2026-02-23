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
  createdAt: string;
  updatedAt: string;

  // 🔄 REFACTOR: Новая структура данных
  variants: ProductVariant[];
  // baseIngredients хранит полные объекты, чтобы не делать лишних джоинов
  baseIngredients: BaseIngredientDTO[];
  addableIngredientIds: number[];
};

// Данные для создания продукта
export type CreateProductData = {
  name: string;
  imageUrl: string;
  categoryId: number;

  // 🔄 REFACTOR: Отправляем полные объекты сразу
  baseIngredients?: BaseIngredientDTO[];

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

  previousImageUrl?: string; // Для удаления старой картинки

  // 🔄 REFACTOR: Полные объекты для обновления
  baseIngredients?: BaseIngredientDTO[];

  addableIngredientIds?: number[];

  // 🔄 REFACTOR: Соответствие БД
  variants?: Array<{
    variantId: number; // Обязательно нужен ID для обновления
    price: number;
    sizeId?: number | null;
    typeId?: number | null;
  }>;
};

// 👇========== DTO (Data Transfer Objects) ==========👇

export interface ProductVariantDTO {
  variantId: number;
  price: number | string;
  sizeId: number | null;
  typeId: number | null;
}

export interface BaseIngredientDTO {
  id: number;
  name: string;
  imageUrl: string;
  removable: boolean;
  isDisabled: boolean;
}

export interface ProductResponseDTO {
  id: number;
  name: string;
  imageUrl: string;
  categoryId: number;
  category: { id: number; name: string };
  createdAt: string;
  updatedAt: string;
  variants: ProductVariantDTO[];
  baseIngredients: BaseIngredientDTO[];
  addableIngredientIds: number[];
}

export interface CreateProductRequest {
  name: string;
  imageUrl: string;
  categoryId: number;
  baseIngredients?: BaseIngredientDTO[];
  addableIngredientIds?: number[];
  variants?: Array<{
    variantId: number;
    price: number;
    sizeId?: number;
    typeId?: number;
  }>;
}

export interface UpdateProductRequest {
  name: string;
  imageUrl: string;
  categoryId: number;
  baseIngredients?: BaseIngredientDTO[];
  addableIngredientIds?: number[];
  variants?: Array<{
    variantId: number;
    price: number;
    sizeId?: number | null;
    typeId?: number | null;
  }>;
}
