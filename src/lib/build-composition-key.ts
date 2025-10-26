export function buildCompositionKey(data: { productItemId: number; ingredientIds?: number[] }): string {
	// Сортируем ингредиенты для детерминированности
	const sortedIds = (data.ingredientIds ?? []).slice().sort((a, b) => a - b);

	return `${data.productItemId}|${sortedIds.join(",")}`;
}
