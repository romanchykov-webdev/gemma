import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface State {
	activeId: number;
	setActiveId: (activeId: number) => void;
}

// export const useCategoryStore = create<State>()(set => ({
//   activeId: 1,
//   setActiveId: (activeId: number) => set({ activeId }),
// }));

export const useCategoryStore = create<State>()(
	devtools(
		(set) => ({
			activeId: 1,
			setActiveId: (activeId: number) => set({ activeId }),
		}),
		{ name: "CategoryStore" },
	),
);
