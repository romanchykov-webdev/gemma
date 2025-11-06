import { Filters } from "@/hooks/use-filters";
import qs from "qs";
import * as React from "react";

export type HistoryMode = "push" | "replace";

// 1) Дебаунс любого значения
function useDebouncedValue<T>(value: T, delay = 500): T {
	const [v, setV] = React.useState(value);
	React.useEffect(() => {
		const id = setTimeout(() => setV(value), delay);
		return () => clearTimeout(id);
	}, [value, delay]);
	return v;
}

// 2) Скип первого рендера
function useSkipFirstRender() {
	const first = React.useRef(true);
	return () => {
		if (first.current) {
			first.current = false;
			return true;
		}
		return false;
	};
}

// 3) Сравнение Set по содержимому
function setEqual(a: Set<string>, b: Set<string>) {
	return a.size === b.size && [...a].every((x) => b.has(x));
}

function serializeFiltersToQuery(params: {
	priceFrom?: number;
	priceTo?: number;
	pizzaTypes: number[];
	sizes: number[];
	ingredients: number[];
}) {
	// Создаем пустой объект вместо копии
	const filteredParams: {
		priceFrom?: number;
		priceTo?: number;
		pizzaTypes?: number[];
		sizes?: number[];
		ingredients?: number[];
	} = {};

	// Добавляем параметры цены только если они не равны 0 или undefined
	if (params.priceFrom && params.priceFrom > 0) {
		filteredParams.priceFrom = params.priceFrom;
	}

	if (params.priceTo && params.priceTo > 0) {
		filteredParams.priceTo = params.priceTo;
	}

	// Добавляем массивы только если они не пустые
	if (params.pizzaTypes && params.pizzaTypes.length > 0) {
		filteredParams.pizzaTypes = params.pizzaTypes;
	}

	if (params.sizes && params.sizes.length > 0) {
		filteredParams.sizes = params.sizes;
	}

	if (params.ingredients && params.ingredients.length > 0) {
		filteredParams.ingredients = params.ingredients;
	}

	// Если объект пустой, возвращаем пустую строку (без '?')
	if (Object.keys(filteredParams).length === 0) {
		return "";
	}

	return qs.stringify(filteredParams, {
		arrayFormat: "comma",
		skipNulls: true,
		addQueryPrefix: true,
	});
}

// 5) Правило выбора push/replace
function pickHistoryMode(next: Filters, prev: Filters): HistoryMode {
	const sizesChanged = !setEqual(next.sizes, prev.sizes);
	const typesChanged = !setEqual(next.pizzaTypes, prev.pizzaTypes);
	const ingrChanged = !setEqual(next.selectedIngredients, prev.selectedIngredients);
	const priceChanged = next.prices.priceFrom !== prev.prices.priceFrom || next.prices.priceTo !== prev.prices.priceTo;

	if (sizesChanged || typesChanged || ingrChanged) return "push";
	if (priceChanged) return "replace";
	return "replace";
}

// 6) Супер-хук: отдаём всё разом
export function useFilterUtils() {
	return {
		useDebouncedValue,
		useSkipFirstRender,
		setEqual,
		serializeFiltersToQuery,
		pickHistoryMode,
	};
}
