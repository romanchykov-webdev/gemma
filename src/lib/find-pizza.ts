import { BaseIngredient, ProductVariant } from '../../@types/prisma';
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

const DEFAULT_MIN_PRICE = 0;
const DEFAULT_MAX_PRICE = 1000;

export const findPizzas = async (params: GetSearchParams) => {
  const sizes = params.sizes?.split(',').map(Number);
  const pizzaTypes = params.pizzaTypes?.split(',').map(Number);
  const ingredientsIdArr = params.ingredients?.split(',').map(Number);

  const minPrice = Number(params.priceFrom) || DEFAULT_MIN_PRICE;
  const maxPrice = Number(params.priceTo) || DEFAULT_MAX_PRICE;

  // 1. Загружаем все категории с продуктами
  // Так как фильтрация по JSON сложна в БД, мы фильтруем на уровне приложения
  const categories = await prisma.category.findMany({
    include: {
      products: {
        orderBy: {
          id: 'desc',
        },
        where: {
          // Если есть ингредиенты, проверим их позже в JS,
          // так как baseIngredients - это JSON
          // Но можем отфильтровать по наличию variants (если это важно)
        },
      },
    },
  });

  // 2. Загружаем справочники, чтобы "развернуть" данные (так как в JSON только ID)
  // Это нужно, чтобы вернуть данные в том виде, в котором их ждет фронтенд (с названиями, ценами и т.д.)
  const ingredientsDB = await prisma.ingredient.findMany();
  const sizesDB = await prisma.size.findMany();
  const typesDB = await prisma.type.findMany();

  // 3. Фильтрация и трансформация данных
  return (
    categories
      .map(category => {
        // Фильтруем продукты внутри категории
        const filteredProducts = category.products.filter(product => {
          // Типизируем JSON поля
          const variants = product.variants as unknown as ProductVariant[];
          const baseIngredients = product.baseIngredients as unknown as BaseIngredient[];

          // --- ФИЛЬТР ПО ЦЕНЕ, РАЗМЕРУ, ТИПУ ---
          // Проверяем, есть ли ХОТЯ БЫ ОДИН вариант, подходящий под условия
          const isPriceMatch = variants.some(v => v.price >= minPrice && v.price <= maxPrice);
          const isSizeMatch =
            sizes && sizes.length > 0 ? variants.some(v => sizes.includes(v.sizeId)) : true;
          const isTypeMatch =
            pizzaTypes && pizzaTypes.length > 0
              ? variants.some(v => pizzaTypes.includes(v.typeId))
              : true;

          if (!isPriceMatch || !isSizeMatch || !isTypeMatch) return false;

          // --- ФИЛЬТР ПО ИНГРЕДИЕНТАМ ---
          // Если выбраны ингредиенты, проверяем, содержит ли пицца эти ингредиенты в базовом составе
          if (ingredientsIdArr && ingredientsIdArr.length > 0) {
            // Получаем массив ID ингредиентов пиццы
            const productIngredientIds = baseIngredients.map(i => i.id);

            // Проверяем пересечение (или полное вхождение, зависит от логики).
            // Обычно ищем "содержит хотя бы один из выбранных" (some)
            // или "исключает запрещенные". В оригинале было "some".
            const isIngredientsMatch = ingredientsIdArr.some(id =>
              productIngredientIds.includes(id),
            );

            if (!isIngredientsMatch) return false;
          }

          return true;
        });

        // Формируем итоговый объект, совместимый с фронтендом
        return {
          ...category,
          products: filteredProducts.map(product => {
            // Типизируем JSON поля для текущего продукта
            const variants = product.variants as unknown as ProductVariant[];
            const baseIngredients = product.baseIngredients as unknown as BaseIngredient[];

            return {
              ...product,
              // ✅ Явно указываем типизированные variants и baseIngredients
              variants: variants,
              baseIngredients: baseIngredients,

              // Восстанавливаем массив ингредиентов (находим полные объекты по ID из JSON)
              ingredients: baseIngredients
                .map(bi => ingredientsDB.find(i => i.id === bi.id))
                .filter((i): i is NonNullable<typeof i> => i !== undefined && i.name !== undefined)
                .map(i => ({
                  id: i.id,
                  name: i.name,
                  price: Number(i.price),
                  imageUrl: i.imageUrl,
                })),

              // Преобразуем variants обратно в items (как было раньше)
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
      })
      // Убираем категории, в которых не осталось продуктов после фильтрации
      .filter(category => category.products.length > 0)
  );
};
