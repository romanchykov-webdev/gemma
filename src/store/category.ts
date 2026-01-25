import { RefObject } from 'react';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface State {
  activeId: number;
  categoryRefs: Map<number, RefObject<HTMLElement>>;
  setActiveId: (activeId: number) => void;
  registerRef: <T extends HTMLElement>(categoryId: number, ref: RefObject<T>) => void;
  unregisterRef: (categoryId: number) => void;
  scrollToCategory: (categoryId: number) => void;
}

// export const useCategoryStore = create<State>()((set) => ({
// 	activeId: 1,
// 	setActiveId: (activeId: number) => set({ activeId }),
// }));

export const useCategoryStore = create<State>()(
  devtools(
    (set, get) => ({
      activeId: 1,
      categoryRefs: new Map(),

      setActiveId: (activeId: number) => set({ activeId }),

      // ✅ Регистрация ref для категории
      registerRef: (categoryId, ref) => {
        const { categoryRefs } = get();
        categoryRefs.set(categoryId, ref as RefObject<HTMLElement>);
      },

      // ✅ Удаление ref при размонтировании
      unregisterRef: categoryId => {
        const { categoryRefs } = get();
        categoryRefs.delete(categoryId);
      },

      // ✅ Плавный скролл к категории
      scrollToCategory: categoryId => {
        const { categoryRefs } = get();
        const ref = categoryRefs.get(categoryId);

        if (ref?.current) {
          ref.current.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        } else {
          if (process.env.NODE_ENV === 'development') {
            console.warn(`[CategoryStore] Ref для категории ${categoryId} не найден`);
          }
        }
      },
    }),
    { name: 'CategoryStore' },
  ),
);
