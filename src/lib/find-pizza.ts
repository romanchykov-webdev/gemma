import { cache } from 'react';
import { BaseIngredient, ProductVariant, ProductWithRelations } from '../../@types/prisma';
import { prisma } from '../../prisma/prisma-client';

export interface GetSearchParams {
  query?: string;
  sortBy?: string;
  sizes?: string;
  pizzaTypes?: string;
  ingredients?: string;
  priceFrom?: string;
  priceTo?: string;
}

export interface FilterParams {
  sizes?: number[];
  pizzaTypes?: number[];
  ingredients?: number[];
  priceFrom?: number;
  priceTo?: number;
}

export interface CategoryWithProducts {
  id: number;
  name: string;
  products: ProductWithRelations[];
}

const DEFAULT_MIN_PRICE = 0;
const DEFAULT_MAX_PRICE = 1000;

// ✅ Функция загрузки ВСЕХ данных (без фильтрации)
export const findAllPizzas = cache(async (): Promise<CategoryWithProducts[]> => {
  // 1. Загружаем все категории с продуктами
  const categories = await prisma.category.findMany({
    include: {
      products: {
        orderBy: {
          id: 'desc',
        },
      },
    },
  });

  // 2. Загружаем справочники параллельно (оптимизация)
  const [ingredientsDB, sizesDB, typesDB] = await Promise.all([
    prisma.ingredient.findMany(),
    prisma.size.findMany(),
    prisma.type.findMany(),
  ]);

  // 3. Трансформируем данные (БЕЗ фильтрации)
  return categories.map(category => {
    return {
      ...category,
      products: category.products.map(product => {
        const variants = product.variants as unknown as ProductVariant[];
        const baseIngredients = product.baseIngredients as unknown as BaseIngredient[];

        return {
          ...product,
          variants: variants,
          baseIngredients: baseIngredients,

          // Восстанавливаем массив ингредиентов
          ingredients: baseIngredients
            .map(bi => ingredientsDB.find(i => i.id === bi.id))
            .filter((i): i is NonNullable<typeof i> => i !== undefined && i.name !== undefined)
            .map(i => ({
              id: i.id,
              name: i.name,
              price: Number(i.price),
              imageUrl: i.imageUrl,
            })),

          // Преобразуем variants в items
          items: variants.map(v => {
            const sizeObj = sizesDB.find(s => s.id === v.sizeId);
            const typeObj = typesDB.find(t => t.id === v.typeId);

            return {
              id: v.variantId,
              price: v.price,
              sizeId: v.sizeId,
              typeId: v.typeId,
              productId: product.id,
              size: {
                value: sizeObj?.value || 0,
                name: sizeObj?.name || '',
              },
              type: {
                value: typeObj?.value || 0,
                name: typeObj?.name || '',
              },
            };
          }),
        };
      }),
    };
  });
});

// ✅ Чистая функция фильтрации (работает на сервере и клиенте)
export const filterCategories = (
  allCategories: CategoryWithProducts[],
  filters: FilterParams,
): CategoryWithProducts[] => {
  const minPrice = filters.priceFrom || DEFAULT_MIN_PRICE;
  const maxPrice = filters.priceTo || DEFAULT_MAX_PRICE;

  return allCategories.map(category => {
    // Фильтруем продукты внутри категории
    const filteredProducts = category.products.filter(product => {
      const variants = product.variants;
      const baseIngredients = product.baseIngredients;

      // Фильтр по цене
      const isPriceMatch = variants.some(v => v.price >= minPrice && v.price <= maxPrice);

      // Фильтр по размеру
      const isSizeMatch =
        filters.sizes && filters.sizes.length > 0
          ? variants.some(v => filters.sizes!.includes(v.sizeId))
          : true;

      // Фильтр по типу теста
      const isTypeMatch =
        filters.pizzaTypes && filters.pizzaTypes.length > 0
          ? variants.some(v => filters.pizzaTypes!.includes(v.typeId))
          : true;

      if (!isPriceMatch || !isSizeMatch || !isTypeMatch) return false;

      // Фильтр по ингредиентам
      if (filters.ingredients && filters.ingredients.length > 0) {
        const productIngredientIds = baseIngredients.map(i => i.id);
        const isIngredientsMatch = filters.ingredients.some(id =>
          productIngredientIds.includes(id),
        );
        if (!isIngredientsMatch) return false;
      }

      return true;
    });

    return {
      ...category,
      products: filteredProducts,
    };
  });
  // Эта строка удаляет категории без товаров из результата показывать все категории (пустые будут disabled)
  // .filter(category => category.products.length > 0);
};

export const findPizzas = async (params: GetSearchParams): Promise<CategoryWithProducts[]> => {
  // 1. Загружаем ВСЕ данные
  const allCategories = await findAllPizzas();

  // 2. Парсим параметры фильтров из строк в числа
  const filters: FilterParams = {
    sizes: params.sizes?.split(',').map(Number),
    pizzaTypes: params.pizzaTypes?.split(',').map(Number),
    ingredients: params.ingredients?.split(',').map(Number),
    priceFrom: params.priceFrom ? Number(params.priceFrom) : undefined,
    priceTo: params.priceTo ? Number(params.priceTo) : undefined,
  };

  // 3. Фильтруем данные
  return filterCategories(allCategories, filters);
};
