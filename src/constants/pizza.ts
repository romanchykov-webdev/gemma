export const DEFAULT_MIN_PRICE = 0 as const;
export const DEFAULT_MAX_PRICE = 20 as const;

export const mapPizzaSize = {
	20: "Piccola",
	30: "Media",
	40: "Grande",
} as const;

export const mapPizzaTypes = {
	1: "tradizionale",
	2: "Impercettibile",
} as const;

export const pizzaSize = Object.entries(mapPizzaSize).map(([value, name]) => ({
	name,
	value,
}));
export const pizzaTypes = Object.entries(mapPizzaTypes).map(([value, name]) => ({
	name,
	value,
}));

export type PizzaSize = keyof typeof mapPizzaSize;
export type PizzaType = keyof typeof mapPizzaTypes;
