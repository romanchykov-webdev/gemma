import { useIngredientsStore } from "@/store";
import { useEffect, useRef } from "react";

export const useIngredients = (enabled: boolean = true) => {
	const { ingredients, loading } = useIngredientsStore();
	const hasCalledRef = useRef(false);

	useEffect(() => {
		// ✅ Вызываем ТОЛЬКО ОДИН РАЗ при enabled = true
		if (enabled && !hasCalledRef.current) {
			hasCalledRef.current = true;
			useIngredientsStore.getState().fetchIngredients();
		}
	}, [enabled]);

	return { ingredients, loading };
};
