import { Size, Type } from "@prisma/client";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { Api } from "../../services/api-client";

interface ReferencesState {
	sizes: Size[];
	types: Type[];
	loading: boolean;
	error: boolean;
	isFetched: boolean;
	fetchReferences: () => Promise<void>;
}

export const useReferencesStore = create<ReferencesState>()(
	devtools(
		(set, get) => ({
			sizes: [],
			types: [],
			loading: false,
			error: false,
			isFetched: false,

			fetchReferences: async () => {
				const state = get();

				// ✅ Если уже загружены - пропускаем
				if (state.isFetched) {
					console.log("✅ References already cached, skipping fetch...");
					return;
				}

				if (typeof window === "undefined") {
					return;
				}

				set({ loading: true, error: false });

				try {
					// ⚡ Загружаем sizes и types параллельно
					const [sizes, types] = await Promise.all([Api.references.getSizes(), Api.references.getTypes()]);

					set({
						sizes,
						types,
						loading: false,
						error: false,
						isFetched: true,
					});

					console.log("✅ References cached:", { sizes: sizes.length, types: types.length });
				} catch (error) {
					console.error("❌ Error fetching references:", error);
					set({ error: true, loading: false });
				}
			},
		}),
		{ name: "ReferencesStore" },
	),
);
