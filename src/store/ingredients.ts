import { Ingredient } from "@prisma/client";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { Api } from "../../services/api-client";

interface IngredientsState {
	ingredients: Ingredient[];
	loading: boolean;
	error: boolean;
	fetchIngredients: (priority?: "immediate" | "idle") => Promise<void>;
}

export const useIngredientsStore = create<IngredientsState>()(
	devtools(
		(set, get) => ({
			ingredients: [],
			loading: false,
			error: false,

			fetchIngredients: async () => {
				const state = get();
				if (state.ingredients.length > 0) {
					console.log("✅ Ingredients already cached, skipping fetch");
					return;
				}

				if (typeof window === "undefined") {
					return;
				}

				set({ loading: true, error: false });
				console.log("⏸️ Waiting 10 seconds...");

				setTimeout(async () => {
					try {
						console.log("🔄 Fetching ingredients from API...");
						const data = await Api.ingredients.getAll();
						set({ ingredients: data, loading: false, error: false });
					} catch (error) {
						console.error("❌ Error fetching ingredients:", error);
						set({ error: true, loading: false });
					}
				}, 2000);
			},
		}),
		{ name: "IngredientsStore" },
	),
);
