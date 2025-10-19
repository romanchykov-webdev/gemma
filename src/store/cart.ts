import { getCartDetails } from "@/lib";
import { CartStateItem } from "@/lib/get-cart-details";
import { create } from "zustand";
import { Api } from "../../services/api-client";
import { CreateCartItemValues } from "../../services/dto/cart.dto";

export interface CartState {
	loading: boolean;
	error: boolean;
	totalAmount: number;
	items: CartStateItem[];
	fetchCartItems: () => Promise<void>;
	updateItemQuantity: (id: string, quantity: number) => Promise<void>; // UUID
	addCartItem: (values: CreateCartItemValues) => Promise<void>;
	removeCartItem: (id: string) => Promise<void>; // UUID
}

export const useCartStore = create<CartState>((set) => ({
	items: [],
	error: false,
	loading: true,
	totalAmount: 0,

	//
	fetchCartItems: async () => {
		try {
			set({ loading: true, error: false });
			const data = await Api.cart.getCart();
			set(getCartDetails(data));
		} catch (error) {
			console.error(error);
			set({ error: true });
		} finally {
			set({ loading: false });
		}
	},

	//
	updateItemQuantity: async (id: string, quantity: number) => {
		try {
			set({ loading: true, error: false });
			const data = await Api.cart.updateItemQuantity(id, quantity);
			set(getCartDetails(data));
		} catch (error) {
			console.error(error);
			set({ error: true });
		} finally {
			set({ loading: false });
		}
	},
	//

	addCartItem: async (values: CreateCartItemValues) => {
		// console.log("addCartItem values", JSON.stringify(values, null));
		try {
			set({ loading: true, error: false });
			const data = await Api.cart.addCartItem(values);
			set(getCartDetails(data));
		} catch (error) {
			console.error(error);
			set({ error: true });
		} finally {
			set({ loading: false });
		}
	},
	//
	removeCartItem: async (id: string) => {
		try {
			set({ loading: true, error: false });
			const data = await Api.cart.removeCartItem(id);
			set(getCartDetails(data));
		} catch (error) {
			set({ error: true });
			console.error(error);
		} finally {
			set({ loading: false });
		}
	},
}));
