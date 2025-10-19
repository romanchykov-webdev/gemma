import { Filters } from "@/hooks/use-filters";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";
import { useFilterUtils } from "./use-filter-utils";

export function useQueryFilters(filters: Filters) {
	const router = useRouter();
	const pathname = usePathname();

	// вытаскиваем утилиты «одним хуком»
	const { useDebouncedValue, useSkipFirstRender, serializeFiltersToQuery, pickHistoryMode } = useFilterUtils();

	const skipFirst = useSkipFirstRender();
	const prevFiltersRef = useRef<Filters | null>(null);
	const lastAppliedRef = useRef<string>("");

	// канонические параметры
	// const params = React.useMemo(
	// 	() => ({
	// 		priceFrom: filters.prices.priceFrom,
	// 		priceTo: filters.prices.priceTo,
	// 		pizzaTypes: Array.from(filters.pizzaTypes),
	// 		sizes: Array.from(filters.sizes),
	// 		ingredients: Array.from(filters.selectedIngredients),
	// 	}),
	// 	[filters],
	// );
	const params = useMemo(
		() => ({
			// Добавляем параметры цены только если они не равны 0
			...(filters.prices.priceFrom ? { priceFrom: filters.prices.priceFrom } : {}),
			...(filters.prices.priceTo ? { priceTo: filters.prices.priceTo } : {}),
			pizzaTypes: Array.from(filters.pizzaTypes),
			sizes: Array.from(filters.sizes),
			ingredients: Array.from(filters.selectedIngredients),
		}),
		[filters],
	);

	// дебаунсим весь фильтр
	const debouncedParams = useDebouncedValue(params, 500);

	// генерим query
	const query = useMemo(
		() =>
			serializeFiltersToQuery({
				priceFrom: debouncedParams.priceFrom ?? 0,
				priceTo: debouncedParams.priceTo ?? 0,
				pizzaTypes: debouncedParams.pizzaTypes.map(Number),
				sizes: debouncedParams.sizes.map(Number),
				ingredients: debouncedParams.ingredients.map(Number),
			}),
		[debouncedParams, serializeFiltersToQuery],
	);

	useEffect(() => {
		if (skipFirst()) {
			prevFiltersRef.current = filters;
			if (typeof window !== "undefined") {
				lastAppliedRef.current = window.location.search;
			}
			return;
		}

		const prev = prevFiltersRef.current ?? filters;
		const mode = pickHistoryMode(filters, prev);

		if (typeof window === "undefined") return;
		const current = window.location.search;

		if (current !== query && lastAppliedRef.current !== query) {
			router[mode](`${pathname}${query}`, { scroll: false });
			lastAppliedRef.current = query;
		}
		// console.log({ filters });

		prevFiltersRef.current = filters;
	}, [query, pathname, router, filters, skipFirst, pickHistoryMode]);
}
