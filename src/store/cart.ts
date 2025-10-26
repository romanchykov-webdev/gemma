import { getCartDetails } from "@/lib";
import { CartStateItem } from "@/lib/get-cart-details";
import { create } from "zustand";
import { Api } from "../../services/api-client";
import { CreateCartItemValuesOptimistic } from "../../services/dto/cart.dto";

import { devtools } from "zustand/middleware";

export interface CartState {
	loading: boolean;
	error: boolean;
	totalAmount: number;
	items: CartStateItem[];
	isFetched: boolean; // ✅ Флаг для предотвращения повторных загрузок
	syncing: boolean; // ✅ Флаг синхронизации с сервером (для блокировки checkout)
	fetchCartItems: () => Promise<void>;
	refetchCart: () => Promise<void>; // ✅ Принудительная загрузка для checkout
	updateItemQuantity: (id: string, quantity: number) => Promise<void>;
	addCartItem: (values: CreateCartItemValuesOptimistic) => void; // ✅ Поддержка optimistic updates
	removeCartItem: (id: string) => Promise<void>;
}

// export const useCartStore = create<CartState>((set, get) => ({
// 	items: [],
// 	error: false,
// 	loading: true,
// 	totalAmount: 0,

// 	fetchCartItems: async () => {
// 		try {
// 			set({ loading: true, error: false });
// 			const data = await Api.cart.getCart();
// 			set(getCartDetails(data));
// 		} catch (error) {
// 			console.error(error);
// 			set({ error: true });
// 		} finally {
// 			set({ loading: false });
// 		}
// 	},

// 	// ⚡ ОПТИМИСТИЧНОЕ ОБНОВЛЕНИЕ - мгновенно обновляем UI!
// 	updateItemQuantity: async (id: string, quantity: number) => {
// 		const state = get();
// 		const prevItems = [...state.items];
// 		const prevTotalAmount = state.totalAmount;

// 		try {
// 			// 1) Мгновенно обновляем количество И цену в UI
// 			const updatedItems = state.items.map((item) => {
// 				if (item.id === id) {
// 					// Пересчитываем цену для изменённого item
// 					const pricePerOne = item.price / item.quantity; // цена 1 штуки
// 					const newPrice = pricePerOne * quantity; // новая цена
// 					return { ...item, quantity, price: newPrice };
// 				}
// 				return item;
// 			});

// 			// 2) Пересчитываем totalAmount локально (просто суммируем!)
// 			const newTotalAmount = updatedItems.reduce((sum, item) => sum + item.price, 0);

// 			// 3) Обновляем UI БЕЗ loading!
// 			set({
// 				items: updatedItems,
// 				totalAmount: Math.round(newTotalAmount),
// 				error: false,
// 			});

// 			// 4) Запрос в фоне (скрытно, пользователь не ждёт!)
// 			await Api.cart.updateItemQuantity(id, quantity);

// 			// 5) Синхронизация с сервером (тихо в фоне)
// 			const data = await Api.cart.getCart();
// 			set({ ...getCartDetails(data), error: false });
// 		} catch (error) {
// 			console.error(error);
// 			// Откат при ошибке
// 			set({
// 				items: prevItems,
// 				totalAmount: prevTotalAmount,
// 				error: true,
// 			});
// 		}
// 	},

// 	// addCartItem: async (values: CreateCartItemValues) => {
// 	// 	try {
// 	// 		set({ loading: true, error: false });
// 	// 		await Api.cart.addCartItem(values);
// 	// 		await get().fetchCartItems();
// 	// 	} catch (error) {
// 	// 		console.error(error);
// 	// 		set({ error: true });
// 	// 	} finally {
// 	// 		set({ loading: false });
// 	// 	}
// 	// },
// 	addCartItem: async (values: CreateCartItemValues) => {
// 		try {
// 			// НЕ блокируем UI! Запрос в фоне
// 			set({ error: false });

// 			// Запрос идёт в фоне
// 			await Api.cart.addCartItem(values);

// 			// Синхронизация
// 			await get().fetchCartItems();
// 		} catch (error) {
// 			console.error(error);
// 			set({ error: true });
// 		}
// 	},

// 	// ⚡ ОПТИМИСТИЧНОЕ УДАЛЕНИЕ - мгновенно удаляем из UI
// 	removeCartItem: async (id: string) => {
// 		const state = get();
// 		const prevItems = [...state.items];
// 		const prevTotalAmount = state.totalAmount;

// 		try {
// 			// 1) Мгновенно удаляем из UI
// 			const updatedItems = state.items.filter((item) => item.id !== id);

// 			// 2) Пересчитываем стоимость
// 			const newTotalAmount = updatedItems.reduce((sum, item) => sum + item.price, 0);

// 			// 3) Обновляем UI БЕЗ loading
// 			set({
// 				items: updatedItems,
// 				totalAmount: newTotalAmount,
// 				error: false,
// 			});

// 			// 4) Запрос в фоне
// 			await Api.cart.removeCartItem(id);

// 			// 5) Синхронизация
// 			const data = await Api.cart.getCart();
// 			set({ ...getCartDetails(data), error: false });
// 		} catch (error) {
// 			console.error(error);
// 			// Откат
// 			set({
// 				items: prevItems,
// 				totalAmount: prevTotalAmount,
// 				error: true,
// 			});
// 		}
// 	},
// }));

export const useCartStore = create<CartState>()(
	devtools(
		(set, get) => ({
			items: [],
			error: false,
			loading: false,
			totalAmount: 0,
			isFetched: false, // ✅ Изначально корзина не загружена
			syncing: false, // ✅ Изначально не синхронизируемся

			fetchCartItems: async () => {
				const state = get();

				// ✅ ПРОВЕРКА: если уже загружено - НЕ грузим повторно
				if (state.isFetched) {
					console.log("✅ Cart already fetched, skipping API call...");
					return;
				}

				try {
					set({ loading: true, error: false });
					const data = await Api.cart.getCart();
					set({
						...getCartDetails(data),
						isFetched: true, // ✅ Отмечаем что загрузили
					});
				} catch (error) {
					console.error(error);
					set({ error: true });
				} finally {
					set({ loading: false });
				}
			},

			// 🔥 Принудительная загрузка для checkout (игнорирует isFetched)
			refetchCart: async () => {
				try {
					set({ loading: true, error: false, syncing: true });
					const data = await Api.cart.getCart();
					set({
						...getCartDetails(data),
						isFetched: true,
					});
				} catch (error) {
					console.error(error);
					set({ error: true });
				} finally {
					set({ loading: false, syncing: false });
				}
			},

			// ⚡ ПОЛНОСТЬЮ ОПТИМИСТИЧНОЕ ОБНОВЛЕНИЕ: мгновенно в Zustand, сервер в фоне
			updateItemQuantity: async (id: string, quantity: number) => {
				const state = get();
				const prevItems = [...state.items];
				const prevTotalAmount = state.totalAmount;

				try {
					// 1️⃣ Мгновенно обновляем UI (локально в Zustand)
					const updatedItems = state.items.map((item) => {
						if (item.id === id) {
							const pricePerOne = item.price / item.quantity;
							const newPrice = pricePerOne * quantity;
							return { ...item, quantity, price: newPrice };
						}
						return item;
					});

					const newTotalAmount = updatedItems.reduce((sum, item) => sum + item.price, 0);

					set({
						items: updatedItems,
						totalAmount: Math.round(newTotalAmount),
						error: false,
					});

					// 2️⃣ Запрос на сервер в фоне (НЕ обновляем store из ответа)
					Api.cart.updateItemQuantity(id, quantity).catch((error) => {
						console.error("[CART] Update failed:", error);
						// Откат при ошибке
						set({
							items: prevItems,
							totalAmount: prevTotalAmount,
							error: true,
						});
					});
				} catch (error) {
					console.error(error);
					// Откат при ошибке
					set({
						items: prevItems,
						totalAmount: prevTotalAmount,
						error: true,
					});
				}
			},

			// ⚡ МОЛНИЕНОСНОЕ ДОБАВЛЕНИЕ с optimistic update
			addCartItem: (values: CreateCartItemValuesOptimistic) => {
				const state = get();

				// 1️⃣ Если есть optimistic данные - мгновенно обновляем UI
				if (values.optimistic) {
					const tempId = `temp-${Date.now()}`; // Временный ID

					const tempItem: CartStateItem = {
						id: tempId,
						quantity: 1,
						name: values.optimistic.name,
						imageUrl: values.optimistic.imageUrl,
						price: values.optimistic.price,
						pizzaSize: values.optimistic.pizzaSize,
						pizzaType: values.optimistic.pizzaType,
						ingredients: values.optimistic.ingredientsData || [],
					};

					// Мгновенно добавляем в store
					set({
						items: [...state.items, tempItem],
						totalAmount: state.totalAmount + tempItem.price,
						error: false,
					});
				}

				// 2️⃣ Запрос на сервер в фоне (без optimistic данных)
				Api.cart
					.addCartItem({
						productItemId: values.productItemId,
						ingredients: values.ingredients,
					})
					.then((data) => {
						// ✅ Заменяем временные данные реальными с сервера
						set({
							...getCartDetails(data),
							error: false,
							isFetched: true,
						});
					})
					.catch((error) => {
						console.error("[CART] Add failed:", error);
						// Откат optimistic update при ошибке
						if (values.optimistic) {
							set({
								items: state.items,
								totalAmount: state.totalAmount,
								error: true,
							});
						} else {
							set({ error: true });
						}
					});
			},

			// ⚡ ПОЛНОСТЬЮ ОПТИМИСТИЧНОЕ УДАЛЕНИЕ: мгновенно в Zustand, сервер в фоне
			removeCartItem: async (id: string) => {
				const state = get();
				const prevItems = [...state.items];
				const prevTotalAmount = state.totalAmount;

				try {
					// 1️⃣ Мгновенно удаляем из UI (локально в Zustand)
					const updatedItems = state.items.filter((item) => item.id !== id);
					const newTotalAmount = updatedItems.reduce((sum, item) => sum + item.price, 0);

					set({
						items: updatedItems,
						totalAmount: newTotalAmount,
						error: false,
					});

					// 2️⃣ Запрос на сервер в фоне (НЕ обновляем store из ответа)
					Api.cart.removeCartItem(id).catch((error) => {
						console.error("[CART] Remove failed:", error);
						// Откат при ошибке
						set({
							items: prevItems,
							totalAmount: prevTotalAmount,
							error: true,
						});
					});
				} catch (error) {
					console.error(error);
					// Откат при ошибке
					set({
						items: prevItems,
						totalAmount: prevTotalAmount,
						error: true,
					});
				}
			},
		}),
		{ name: "CartStore" },
	),
);
