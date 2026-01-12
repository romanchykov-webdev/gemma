// import { getCartDetails } from "@/lib";
// import { CartStateItem } from "@/lib/get-cart-details";
// import { create } from "zustand";
// import { devtools } from "zustand/middleware";
// import { Api } from "../../services/api-client";
// import { CreateCartItemValuesOptimistic } from "../../services/dto/cart.dto";

// export interface CartState {
// 	loading: boolean;
// 	error: boolean;
// 	totalAmount: number;
// 	items: CartStateItem[];
// 	isFetched: boolean;
// 	syncing: boolean;
// 	fetchCartItems: () => Promise<void>;
// 	refetchCart: () => Promise<void>;
// 	updateItemQuantity: (id: string, quantity: number) => Promise<void>;
// 	addCartItem: (values: CreateCartItemValuesOptimistic) => void;
// 	removeCartItem: (id: string) => Promise<void>;
// }

// export const useCartStore = create<CartState>()(
// 	devtools(
// 		(set, get) => ({
// 			items: [],
// 			error: false,
// 			loading: false,
// 			totalAmount: 0,
// 			isFetched: false,
// 			syncing: false,

// 			fetchCartItems: async () => {
// 				const state = get();
// 				if (state.isFetched) {
// 					console.log("✅ Cart already fetched, skipping API call...");
// 					return;
// 				}

// 				try {
// 					set({ loading: true, error: false });
// 					const data = await Api.cart.getCart();
// 					set({
// 						...getCartDetails(data),
// 						isFetched: true,
// 					});
// 				} catch (error) {
// 					console.error(error);
// 					set({ error: true });
// 				} finally {
// 					set({ loading: false });
// 				}
// 			},

// 			refetchCart: async () => {
// 				try {
// 					set({ loading: true, error: false, syncing: true });
// 					const data = await Api.cart.getCart();
// 					set({
// 						...getCartDetails(data),
// 						isFetched: true,
// 					});
// 				} catch (error) {
// 					console.error(error);
// 					set({ error: true });
// 				} finally {
// 					set({ loading: false, syncing: false });
// 				}
// 			},

// 			updateItemQuantity: async (id: string, quantity: number) => {
// 				const state = get();
// 				const prevItems = [...state.items];
// 				const prevTotalAmount = state.totalAmount;

// 				try {
// 					const updatedItems = state.items.map((item) => {
// 						if (item.id === id) {
// 							const pricePerOne = item.price / item.quantity;
// 							const newPrice = pricePerOne * quantity;
// 							return { ...item, quantity, price: newPrice };
// 						}
// 						return item;
// 					});

// 					// ✅ точное вычисление totalAmount
// 					const newTotalAmountCents = updatedItems.reduce(
// 						(sum, item) => sum + Math.round(item.price * 100),
// 						0,
// 					);

// 					set({
// 						items: updatedItems,
// 						totalAmount: +(newTotalAmountCents / 100).toFixed(2),
// 						error: false,
// 					});

// 					Api.cart.updateItemQuantity(id, quantity).catch((error) => {
// 						console.error("[CART] Update failed:", error);
// 						set({
// 							items: prevItems,
// 							totalAmount: prevTotalAmount,
// 							error: true,
// 						});
// 					});
// 				} catch (error) {
// 					console.error(error);
// 					set({
// 						items: prevItems,
// 						totalAmount: prevTotalAmount,
// 						error: true,
// 					});
// 				}
// 			},

// 			addCartItem: (values: CreateCartItemValuesOptimistic) => {
// 				const state = get();

// 				if (values.optimistic) {
// 					const tempId = `temp-${Date.now()}`;
// 					const tempItem: CartStateItem = {
// 						id: tempId,
// 						quantity: 1,
// 						name: values.optimistic.name,
// 						imageUrl: values.optimistic.imageUrl,
// 						price: values.optimistic.price,
// 						pizzaSize: values.optimistic.pizzaSize,
// 						pizzaType: values.optimistic.pizzaType,
// 						ingredients: values.optimistic.ingredientsData || [],
// 					};

// 					const newTotalAmountCents = Math.round(state.totalAmount * 100) + Math.round(tempItem.price * 100);

// 					set({
// 						items: [...state.items, tempItem],
// 						totalAmount: +(newTotalAmountCents / 100).toFixed(2),
// 						error: false,
// 					});
// 				}

// 				// ✅ Передаем productId и variantId (или productItemId для обратной совместимости)
// 				Api.cart
// 					.addCartItem({
// 						productId: values.productId, // ✅ Новое поле
// 						variantId: values.variantId, // ✅ Новое поле
// 						// Для обратной совместимости (если старый формат)
// 						productItemId: values.productItemId,
// 						ingredients: values.ingredients,
// 					})
// 					.then((data) => {
// 						set({
// 							...getCartDetails(data),
// 							error: false,
// 							isFetched: true,
// 						});
// 					})
// 					.catch((error) => {
// 						console.error("[CART] Add failed:", error);
// 						if (values.optimistic) {
// 							set({
// 								items: state.items,
// 								totalAmount: state.totalAmount,
// 								error: true,
// 							});
// 						} else {
// 							set({ error: true });
// 						}
// 					});
// 			},

// 			removeCartItem: async (id: string) => {
// 				const state = get();
// 				const prevItems = [...state.items];
// 				const prevTotalAmount = state.totalAmount;

// 				try {
// 					const updatedItems = state.items.filter((item) => item.id !== id);
// 					const newTotalAmountCents = updatedItems.reduce(
// 						(sum, item) => sum + Math.round(item.price * 100),
// 						0,
// 					);

// 					set({
// 						items: updatedItems,
// 						totalAmount: +(newTotalAmountCents / 100).toFixed(2),
// 						error: false,
// 					});

// 					Api.cart.removeCartItem(id).catch((error) => {
// 						console.error("[CART] Remove failed:", error);
// 						set({
// 							items: prevItems,
// 							totalAmount: prevTotalAmount,
// 							error: true,
// 						});
// 					});
// 				} catch (error) {
// 					console.error(error);
// 					set({
// 						items: prevItems,
// 						totalAmount: prevTotalAmount,
// 						error: true,
// 					});
// 				}
// 			},
// 		}),
// 		{ name: "CartStore" },
// 	),
// );

import { calculateItemPrice, RawCartItem } from "@/lib/calculate-cart-price";
import { CartStateItem } from "@/lib/get-cart-details";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
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
	fetchCartItems: () => Promise<void>;
	refetchCart: () => Promise<void>;
	updateItemQuantity: (id: string, quantity: number) => Promise<void>;
	addCartItem: (values: CreateCartItemValuesOptimistic) => void;
	removeCartItem: (id: string) => Promise<void>;
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
			pizzaSize: calculated.pizzaSize,
			pizzaType: calculated.pizzaType,
			sizeName: calculated.sizeName,
			doughTypeName: calculated.doughTypeName,
			ingredients: rawItem.ingredients.map((ing) => ({
				name: ing.name,
				price: Number(ing.price),
			})),
			removedIngredients: calculated.removedIngredients,
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

			fetchCartItems: async () => {
				const state = get();
				if (state.isFetched) {
					console.log("✅ Cart already fetched, skipping API call...");
					return;
				}

				try {
					set({ loading: true, error: false });
					const { items: rawItems } = await Api.cart.getCart();

					const { items, totalAmount } = transformCartItems(rawItems as any[]);

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

					const { items, totalAmount } = transformCartItems(rawItems as any[]);

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
				const prevItems = [...state.items];
				const prevTotalAmount = state.totalAmount;

				// ⚡ Optimistic update
				if (values.optimistic) {
					const tempId = `temp-${Date.now()}`;
					const tempItem: CartStateItem = {
						id: tempId,
						quantity: 1,
						name: values.optimistic.name,
						imageUrl: values.optimistic.imageUrl,
						price: values.optimistic.price,
						pizzaSize: values.optimistic.pizzaSize,
						pizzaType: values.optimistic.pizzaType,
						sizeName: null,
						doughTypeName: null,
						ingredients: values.optimistic.ingredientsData || [],
					};

					const newTotalAmountCents = Math.round(state.totalAmount * 100) + Math.round(tempItem.price * 100);

					set({
						items: [...state.items, tempItem],
						totalAmount: +(newTotalAmountCents / 100).toFixed(2),
						error: false,
					});
				}

				// Сохраняем на сервере
				Api.cart
					.addCartItem({
						productId: values.productId,
						variantId: values.variantId,
						ingredients: values.ingredients,
						baseIngredientsSnapshot: values.baseIngredientsSnapshot, // ✅ ДОБАВЛЕНО!
						// ⚠️ Для совместимости (можно удалить позже)
						removedIngredients: values.removedIngredients,
					})
					.then(() => {
						// После успешного добавления - перезагружаем корзину
						get().refetchCart();
					})
					.catch((error) => {
						console.error("[CART] Add failed:", error);
						// Откат при ошибке
						set({
							items: prevItems,
							totalAmount: prevTotalAmount,
							error: true,
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
