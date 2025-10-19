import { prisma } from '../../prisma/prisma-client';

export interface GetSearchParams {
  query?: string;
  sortBy?: string;
  sizes?: string;
  pizzaTypes?: string;
  ingredients?: string;
  priceFrom?: string;
  priceTo?: string;
  // limit?: string;
  // page?: string;
}

const DEFAULT_MIN_PRICE = 0;
const DEFAULT_MAX_PRICE = 1000;

// TODO: Добавить лимит и страницу
// const DEFAULT_LIMIT = 12;
// const DEFAULT_PAGE = 1;

export const findPizzas = async (params: GetSearchParams) => {
  //

  // console.log("priceFilter", priceFilter);
  const size = params.sizes?.split(',').map(Number);

  const pizzaType = params.pizzaTypes?.split(',').map(Number);

  const ingredientsIdArr = params.ingredients?.split(',').map(Number);

  // Обработка фильтров цены
  const minPrice = Number(params.priceFrom) || DEFAULT_MIN_PRICE;
  const maxPrice = Number(params.priceTo) || DEFAULT_MAX_PRICE;

  // let priceFilter = {};
  // if (Number.isFinite(minPrice)) priceFilter = { ...priceFilter, gte: minPrice };
  // if (Number.isFinite(maxPrice)) priceFilter = { ...priceFilter, lte: maxPrice };

  const categories = await prisma.category.findMany({
    include: {
      products: {
        orderBy: {
          id: 'desc',
        },

        where: {
          // Фильтрация по ингредиентам
          ...(ingredientsIdArr && ingredientsIdArr.length > 0
            ? {
                ingredients: {
                  some: {
                    id: {
                      in: ingredientsIdArr,
                    },
                  },
                },
              }
            : {}),

          items: {
            some: {
              // Фильтр по цене
              price: {
                gte: minPrice,
                lte: maxPrice,
              },
              // Дополнительные фильтры по размеру и типу пиццы
              ...(size && size.length > 0 ? { size: { in: size } } : {}),
              ...(pizzaType && pizzaType.length > 0 ? { pizzaType: { in: pizzaType } } : {}),
            },
          },
        },
        include: {
          ingredients: true,
          items: true,
          // {
          // 	where: {
          // 		price: {
          // 			gte: minPrice,
          // 			lte: maxPrice,
          // 		},
          // 	},
          // 	orderBy: {
          // 		price: "asc",
          // 	},
          // },
        },
      },
    },
  });

  return categories;
  //
};
