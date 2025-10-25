import { useIngredientsStore } from "@/store";
import { useEffect } from "react";

export const useIngredients = (enabled: boolean = true) => {
	const { ingredients, loading } = useIngredientsStore();

	useEffect(() => {
		if (enabled) {
			useIngredientsStore.getState().fetchIngredients();
		}
	}, [enabled]);

	return { ingredients, loading };
};
