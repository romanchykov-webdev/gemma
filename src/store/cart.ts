import { calculateItemPrice, RawCartItem } from "@/lib/calculate-cart-price";
import { CartStateItem } from "@/lib/get-cart-details";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { BaseIngredient } from "../../@types/prisma";
import { Api } from "../../services/api-client";
import { CreateCartItemValuesOptimistic } from "../../services/dto/cart.dto";
import { useReferencesStore } from "./references";

export interface CartState {
	loading: boolean;
	error: boolean;
	totalAmount: number;
	items: CartStateItem[];
	isFetched: boolean;
	syncing: boolean;
	adding: boolean; // ✅ НОВОЕ - флаг процесса добавления
	fetchCartItems: () => Promise<void>;
	refetchCart: () => Promise<void>;
	updateItemQuantity: (id: string, quantity: number) => Promise<void>;
	addCartItem: (values: CreateCartItemValuesOptimistic) => void;
	removeCartItem: (id: string) => Promise<void>;
}

/**
 * 🔍 Ищет товар с идентичной конфигурацией в корзине
 * Сравнивает: productId, variantId, добавленные ингредиенты и snapshot базовых ингредиентов
 */
function findDuplicateItem(
	items: CartStateItem[],
	productId: number,
	variantId: number,
	addedIngredients: number[],
	baseIngredientsSnapshot: BaseIngredient[] | undefined,
): CartStateItem | undefined {
	// Сортируем массив добавленных ингредиентов для точного сравнения
	const sortedAddedIngredients = [...addedIngredients].sort((a, b) => a - b);
	
	// Готовим данные для сравнения removedIngredients
	const newRemoved = (baseIngredientsSnapshot || [])
		.filter((ing) => ing.isDisabled && ing.removable)
		.map((ing) => ({ name: ing.name }));
	const newRemovedJson = JSON.stringify(newRemoved);

	return items.find((item) => {
		// 1. Проверяем productId
		if (item.productId !== productId) return false;
		
		// 2. Проверяем variantId
		if (item.variantId !== variantId) return false;
		
		// 3. Сравниваем добавленные ингредиенты
		const itemIngredientIds = item.ingredients
			.map((ing) => ing.id || 0)
			.filter((id) => id > 0)
			.sort((a, b) => a - b);
		
		const ingredientsMatch = 
			itemIngredientIds.length === sortedAddedIngredients.length &&
			itemIngredientIds.every((id, idx) => id === sortedAddedIngredients[idx]);
		
		if (!ingredientsMatch) return false;

		// 4. Сравниваем удаленные базовые ингредиенты
		const itemRemovedJson = JSON.stringify(item.removedIngredients || []);
		
		return itemRemovedJson === newRemovedJson;
	});
}

/**
 * Преобразует RAW данные из API в формат UI с расчетом цен
 */
function transformCartItems(rawItems: RawCartItem[]): {
	items: CartStateItem[];
	totalAmount: number;
} {
	const { sizes, types } = useReferencesStore.getState();

	const items = rawItems.map((rawItem): CartStateItem => {
		const calculated = calculateItemPrice(rawItem, sizes, types);

		return {
			id: rawItem.id,
			quantity: rawItem.quantity,
			name: rawItem.product.name,
			imageUrl: rawItem.product.imageUrl,
			price: calculated.price,
			size: calculated.pizzaSize,
			type: calculated.pizzaType,
			sizeName: calculated.sizeName,
			typeName: calculated.doughTypeName,
			ingredients: rawItem.ingredients.map((ing) => ({
				id: ing.id,
				name: ing.name,
				price: Number(ing.price),
			})),
			removedIngredients: calculated.removedIngredients,
			// ✅ НОВОЕ - добавляем для точного сравнения
			productId: rawItem.productId,
			variantId: rawItem.variantId,
		};
	});

	// Точный расчет totalAmount
	const totalAmountCents = items.reduce((sum, item) => sum + Math.round(item.price * 100), 0);
	const totalAmount = +(totalAmountCents / 100).toFixed(2);

	return { items, totalAmount };
}

export const useCartStore = create<CartState>()(
	devtools(
		(set, get) => ({
			items: [],
			error: false,
			loading: false,
			totalAmount: 0,
			isFetched: false,
			syncing: false,
			adding: false,

			fetchCartItems: async () => {
				const state = get();
				if (state.isFetched) {
					console.log("✅ Cart already fetched, skipping API call...");
					return;
				}

				try {
					set({ loading: true, error: false });
					const { items: rawItems } = await Api.cart.getCart();

					const { items, totalAmount } = transformCartItems(rawItems as unknown as RawCartItem[]);

					set({
						items,
						totalAmount,
						isFetched: true,
						loading: false,
					});
				} catch (error) {
					console.error("[CART] Fetch failed:", error);
					set({ error: true, loading: false });
				}
			},

			refetchCart: async () => {
				try {
					set({ syncing: true, error: false });
					const { items: rawItems } = await Api.cart.getCart();

					const { items, totalAmount } = transformCartItems(rawItems as unknown as RawCartItem[]);

					set({
						items,
						totalAmount,
						isFetched: true,
						syncing: false,
					});
				} catch (error) {
					console.error("[CART] Refetch failed:", error);
					set({ error: true, syncing: false });
				}
			},

			updateItemQuantity: async (id: string, quantity: number) => {
				const state = get();
				const prevItems = [...state.items];
				const prevTotalAmount = state.totalAmount;

				// ⚡ Optimistic update
				const updatedItems = state.items.map((item) => {
					if (item.id === id) {
						const pricePerOne = item.price / item.quantity;
						const newPrice = pricePerOne * quantity;
						return { ...item, quantity, price: newPrice };
					}
					return item;
				});

				const newTotalAmountCents = updatedItems.reduce((sum, item) => sum + Math.round(item.price * 100), 0);

				set({
					items: updatedItems,
					totalAmount: +(newTotalAmountCents / 100).toFixed(2),
					error: false,
				});

				// Сохраняем на сервере
				Api.cart.updateItemQuantity(id, quantity).catch((error) => {
					console.error("[CART] Update failed:", error);
					// Откат при ошибке
					set({
						items: prevItems,
						totalAmount: prevTotalAmount,
						error: true,
					});
				});
			},

		addCartItem: (values: CreateCartItemValuesOptimistic) => {
			const state = get();
			
			// 🛡️ Защита от race conditions - блокируем повторные вызовы
			if (state.adding) {
				console.log("⏳ [CART] Already adding item, skipping...");
				return;
			}

			const prevItems = [...state.items];
			const prevTotalAmount = state.totalAmount;

			// 🔍 Проверяем наличие дубликата в корзине
			const duplicate = findDuplicateItem(
				state.items,
				values.productId,
				values.variantId,
				values.ingredients || [],
				values.baseIngredientsSnapshot,
			);

			if (duplicate) {
				// ✅ Дубликат найден - увеличиваем quantity
				console.log("✅ [CART] Duplicate found, updating quantity:", duplicate.id);
				get().updateItemQuantity(duplicate.id, duplicate.quantity + 1);
				return;
			}

			// ✨ Дубликата нет - создаем новый товар
			console.log("✨ [CART] New item, creating...", {
				productId: values.productId,
				variantId: values.variantId,
				ingredients: values.ingredients?.length || 0,
			});

			// Устанавливаем флаг добавления
			set({ adding: true });

			// ⚡ Optimistic update - добавляем временный элемент в UI
			if (values.optimistic) {
				const { sizes, types } = useReferencesStore.getState();
				const sizeName =
					values.optimistic.size != null
						? sizes.find((s) => s.value === values.optimistic?.size)?.name ?? null
						: null;
				const typeName =
					values.optimistic.type != null
						? types.find((t) => t.value === values.optimistic?.type)?.name ?? null
						: null;
				const removedIngredients = (values.baseIngredientsSnapshot ?? [])
					.filter((ing) => ing.isDisabled && ing.removable)
					.map((ing) => ({ name: ing.name }));

				const tempId = `temp-${Date.now()}`;
				// Убеждаемся что у всех ингредиентов есть id
				const ingredientsWithIds = (values.optimistic.ingredientsData || []).map((ing) => ({
					id: ing.id || 0,
					name: ing.name,
					price: ing.price,
				}));

				const tempItem: CartStateItem = {
					id: tempId,
					quantity: 1,
					name: values.optimistic.name,
					imageUrl: values.optimistic.imageUrl,
					price: values.optimistic.price,
					size: values.optimistic.size ?? null,
					type: values.optimistic.type ?? null,
					sizeName,
					typeName,
					ingredients: ingredientsWithIds,
					removedIngredients,
					productId: values.productId,
					variantId: values.variantId,
				};

				const newTotalAmountCents = Math.round(state.totalAmount * 100) + Math.round(tempItem.price * 100);

				set({
					items: [...state.items, tempItem],
					totalAmount: +(newTotalAmountCents / 100).toFixed(2),
					error: false,
				});
			}

			// 💾 Сохраняем на сервере
			Api.cart
				.addCartItem({
					productId: values.productId,
					variantId: values.variantId,
					ingredients: values.ingredients,
					baseIngredientsSnapshot: values.baseIngredientsSnapshot,
					removedIngredients: values.removedIngredients,
				})
				.then((res) => {
					const itemId = res?.itemId;
					if (!itemId) {
						console.error("[CART] No itemId returned from server");
						set({ adding: false });
						return;
					}

					// Заменяем временный ID на реальный
					const state = get();
					const temp = state.items.find((i) => String(i.id).startsWith("temp-"));
					
					if (temp) {
						console.log("🔄 [CART] Replacing temp ID with real ID:", itemId);
						set({
							items: state.items.map((i) => (i.id === temp.id ? { ...i, id: itemId } : i)),
							adding: false,
						});
					} else {
						set({ adding: false });
					}
				})
				.catch((error) => {
					console.error("[CART] Add failed:", error);
					// Откат при ошибке
					set({
						items: prevItems,
						totalAmount: prevTotalAmount,
						error: true,
						adding: false,
					});
				});
		},

			removeCartItem: async (id: string) => {
				const state = get();
				const prevItems = [...state.items];
				const prevTotalAmount = state.totalAmount;

				// ⚡ Optimistic update
				const updatedItems = state.items.filter((item) => item.id !== id);
				const newTotalAmountCents = updatedItems.reduce((sum, item) => sum + Math.round(item.price * 100), 0);

				set({
					items: updatedItems,
					totalAmount: +(newTotalAmountCents / 100).toFixed(2),
					error: false,
				});

				// Удаляем на сервере
				Api.cart.removeCartItem(id).catch((error) => {
					console.error("[CART] Remove failed:", error);
					// Откат при ошибке
					set({
						items: prevItems,
						totalAmount: prevTotalAmount,
						error: true,
					});
				});
			},
		}),
		{ name: "CartStore" },
	),
);
