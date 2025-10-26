import { getCartDetails } from "@/lib";
import { CartStateItem } from "@/lib/get-cart-details";
import { create } from "zustand";
import { Api } from "../../services/api-client";
import { CreateCartItemValues } from "../../services/dto/cart.dto";

import { devtools } from "zustand/middleware";

export interface CartState {
	loading: boolean;
	error: boolean;
	totalAmount: number;
	items: CartStateItem[];
	isFetched: boolean; // ✅ Флаг для предотвращения повторных загрузок
	fetchCartItems: () => Promise<void>;
	updateItemQuantity: (id: string, quantity: number) => Promise<void>;
	addCartItem: (values: CreateCartItemValues) => Promise<void>;
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
			loading: true,
			totalAmount: 0,
			isFetched: false, // ✅ Изначально корзина не загружена

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

			updateItemQuantity: async (id: string, quantity: number) => {
				const state = get();
				const prevItems = [...state.items];
				const prevTotalAmount = state.totalAmount;

				try {
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

					await Api.cart.updateItemQuantity(id, quantity);

					const data = await Api.cart.getCart();
					set({
						...getCartDetails(data),
						error: false,
						isFetched: true, // ✅ Обновили - отмечаем что данные свежие
					});
				} catch (error) {
					console.error(error);
					set({
						items: prevItems,
						totalAmount: prevTotalAmount,
						error: true,
					});
				}
			},

			addCartItem: async (values: CreateCartItemValues) => {
				try {
					set({ error: false });
					await Api.cart.addCartItem(values);
					await get().fetchCartItems();
				} catch (error) {
					console.error(error);
					set({ error: true });
				}
			},

			removeCartItem: async (id: string) => {
				const state = get();
				const prevItems = [...state.items];
				const prevTotalAmount = state.totalAmount;

				try {
					const updatedItems = state.items.filter((item) => item.id !== id);
					const newTotalAmount = updatedItems.reduce((sum, item) => sum + item.price, 0);

					set({
						items: updatedItems,
						totalAmount: newTotalAmount,
						error: false,
					});

					await Api.cart.removeCartItem(id);

					const data = await Api.cart.getCart();
					set({
						...getCartDetails(data),
						error: false,
						isFetched: true, // ✅ Обновили - отмечаем что данные свежие
					});
				} catch (error) {
					console.error(error);
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
