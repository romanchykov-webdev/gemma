import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { useCartStore } from "./cart";
import { useCategoryStore } from "./category";
import { useIngredientsStore } from "./ingredients";

// 🔥 Wrapper для DevTools - объединяет все stores в один для удобной отладки
interface AllStoresState {
	cart: ReturnType<typeof useCartStore.getState>;
	category: ReturnType<typeof useCategoryStore.getState>;
	ingredients: ReturnType<typeof useIngredientsStore.getState>;
}

export const useDevToolsStore = create<AllStoresState>()(
	devtools(
		() => ({
			cart: useCartStore.getState(),
			category: useCategoryStore.getState(),
			ingredients: useIngredientsStore.getState(),
		}),
		{ name: "🎯 AllStores" }, // ✅ Эмодзи для легкого поиска в DevTools
	),
);

// 🔄 Синхронизация: обновляем DevTools store при изменении любого store
if (typeof window !== "undefined") {
	// Cart store subscription
	useCartStore.subscribe((state) => {
		useDevToolsStore.setState({ cart: state }, false, "cart/updated");
	});

	// Category store subscription
	useCategoryStore.subscribe((state) => {
		useDevToolsStore.setState({ category: state }, false, "category/updated");
	});

	// Ingredients store subscription
	useIngredientsStore.subscribe((state) => {
		useDevToolsStore.setState({ ingredients: state }, false, "ingredients/updated");
	});
}

// 🎯 Функция для инициализации DevTools (вызвать один раз при старте)
export const initDevTools = () => {
	if (typeof window !== "undefined") {
		console.log("🔧 DevTools initialized - все stores объединены в 🎯 AllStores");

		// Начальная синхронизация
		useDevToolsStore.setState({
			cart: useCartStore.getState(),
			category: useCategoryStore.getState(),
			ingredients: useIngredientsStore.getState(),
		});

		// Логируем текущее состояние
		console.log("📊 Current stores:", {
			cart: useCartStore.getState(),
			category: useCategoryStore.getState(),
			ingredients: useIngredientsStore.getState(),
		});
	}
};
