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
			size: calculated.pizzaSize,
			type: calculated.pizzaType,
			sizeName: calculated.sizeName,
			typeName: calculated.doughTypeName,
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
				const prevItems = [...state.items];
				const prevTotalAmount = state.totalAmount;

				// ⚡ Optimistic update
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
						ingredients: values.optimistic.ingredientsData || [],
						removedIngredients,
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
						baseIngredientsSnapshot: values.baseIngredientsSnapshot,
						removedIngredients: values.removedIngredients,
					})
					.then((res) => {
						const itemId = res?.itemId;
						if (!itemId) return;
						const state = get();
						const temp = state.items.find((i) => String(i.id).startsWith("temp-"));
						if (!temp) return;

						if (state.items.some((i) => i.id === itemId)) {
							// Дубликат: убрать temp, инкрементировать существующий с id === itemId
							const nextItems = state.items
								.filter((i) => i.id !== temp.id)
								.map((i) => {
									if (i.id === itemId) {
										const pricePerOne = i.price / i.quantity;
										return { ...i, quantity: i.quantity + 1, price: pricePerOne * (i.quantity + 1) };
									}
									return i;
								});
							const newTotalAmountCents = nextItems.reduce((sum, item) => sum + Math.round(item.price * 100), 0);
							set({ items: nextItems, totalAmount: +(newTotalAmountCents / 100).toFixed(2) });
						} else {
							// Новая позиция: заменить temp.id на itemId
							set({
								items: state.items.map((i) => (i.id === temp.id ? { ...i, id: itemId } : i)),
							});
						}
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
