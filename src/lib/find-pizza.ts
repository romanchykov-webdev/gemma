import { DEFAULT_MAX_PRICE, DEFAULT_MIN_PRICE } from "@/constants/pizza";
import { cache } from "react";
import { prisma } from "../../prisma/prisma-client";

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

// export const DEFAULT_MIN_PRICE = 0;
// export const DEFAULT_MAX_PRICE = 20;

// TODO: Добавить лимит и страницу
// const DEFAULT_LIMIT = 12;
// const DEFAULT_PAGE = 1;

// ✅ Кешируем запрос для избежания дублирования
export const findPizzas = cache(async (params: GetSearchParams) => {
	//

	// console.log("priceFilter", priceFilter);
	const size = params.sizes?.split(",").map(Number);

	const pizzaType = params.pizzaTypes?.split(",").map(Number);

	const ingredientsIdArr = params.ingredients?.split(",").map(Number);

	// Обработка фильтров цены
	const minPrice = Number(params.priceFrom) || DEFAULT_MIN_PRICE;
	const maxPrice = Number(params.priceTo) || DEFAULT_MAX_PRICE;

	// let priceFilter = {};
	// if (Number.isFinite(minPrice)) priceFilter = { ...priceFilter, gte: minPrice };
	// if (Number.isFinite(maxPrice)) priceFilter = { ...priceFilter, lte: maxPrice };

	const categories = await prisma.category.findMany({
		select: {
			id: true,
			name: true,
			products: {
				orderBy: {
					id: "desc",
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
				select: {
					id: true,
					name: true,
					imageUrl: true,
					categoryId: true,
					ingredients: {
						select: {
							id: true,
							name: true,
							price: true,
							imageUrl: true,
						},
					},
					items: {
						select: {
							id: true,
							price: true,
							size: true,
							pizzaType: true,
							productId: true,
						},
					},
				},
			},
		},
	});

	return categories;
	//
});
