import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { CategoryWithProducts, filterCategories, FilterParams } from '@/lib';
import { Filters } from '@/hooks/use-filters';

interface ProductsState {
  // Данные
  allCategories: CategoryWithProducts[];
  filteredCategories: CategoryWithProducts[];

  // Состояние загрузки
  loading: boolean;
  error: boolean;
  isHydrated: boolean;

  // Методы
  setAllCategories: (categories: CategoryWithProducts[]) => void;
  filterProducts: (filters: Filters) => void;
  reset: () => void;
}

export const useProductsStore = create<ProductsState>()(
  devtools(
    (set, get) => ({
      allCategories: [],
      filteredCategories: [],
      loading: false,
      error: false,
      isHydrated: false,

      setAllCategories: (categories: CategoryWithProducts[]) => {
        set({
          allCategories: categories,
          filteredCategories: categories,
          isHydrated: true,
        });
      },

      filterProducts: (filters: Filters) => {
        const { allCategories } = get();
        
        // Конвертируем Set<string> в number[] для filterCategories
        const filterParams: FilterParams = {
          sizes: filters.sizes.size > 0 ? Array.from(filters.sizes).map(Number) : undefined,
          pizzaTypes: filters.pizzaTypes.size > 0 ? Array.from(filters.pizzaTypes).map(Number) : undefined,
          ingredients: filters.selectedIngredients.size > 0 ? Array.from(filters.selectedIngredients).map(Number) : undefined,
          priceFrom: filters.prices.priceFrom,
          priceTo: filters.prices.priceTo,
        };

        const filtered = filterCategories(allCategories, filterParams);
        set({ filteredCategories: filtered });
      },

      reset: () => {
        set({
          allCategories: [],
          filteredCategories: [],
          loading: false,
          error: false,
          isHydrated: false,
        });
      },
    }),
    { name: 'ProductsStore' },
  ),
);
