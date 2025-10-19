export const mapPizzaSize = {
  20: 'Маленькая',
  30: 'Средняя',
  40: 'Большая',
} as const;

export const mapPizzaTypes = {
  1: 'традиционное',
  2: 'тонкое',
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
