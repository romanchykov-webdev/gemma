// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useIngredientsSelection } from './use-ingredients-selection';

// Создаем моковые данные справочника ингредиентов
const mockAvailableIngredients = [
  { id: 1, name: 'Pomodoro', price: 1, imageUrl: 'pomodoro.png' },
  { id: 2, name: 'Mozzarella', price: 2, imageUrl: 'mozzarella.png' },
];

describe('useIngredientsSelection', () => {
  describe('Инициализация', () => {
    it('инициализируется пустыми значениями по умолчанию', () => {
      const { result } = renderHook(() =>
        useIngredientsSelection({ availableIngredients: mockAvailableIngredients }),
      );

      expect(result.current.baseIngredients).toEqual([]);
      expect(result.current.addableIngredientIds).toEqual([]);
      expect(result.current.enrichedBaseIngredients).toEqual([]);
    });

    it('инициализируется переданными значениями', () => {
      const initialBase = [{ id: 1, removable: false, isDisabled: false }];
      const initialAddable = [2];

      const { result } = renderHook(() =>
        useIngredientsSelection({
          availableIngredients: mockAvailableIngredients,
          initialBaseIngredients: initialBase,
          initialAddableIngredientIds: initialAddable,
        }),
      );

      expect(result.current.baseIngredients).toEqual(initialBase);
      expect(result.current.addableIngredientIds).toEqual(initialAddable);
    });
  });

  describe('toggleBaseIngredient', () => {
    it('добавляет новый базовый ингредиент', () => {
      const { result } = renderHook(() =>
        useIngredientsSelection({ availableIngredients: mockAvailableIngredients }),
      );

      act(() => {
        result.current.toggleBaseIngredient(1);
      });

      expect(result.current.baseIngredients).toEqual([
        { id: 1, removable: true, isDisabled: false },
      ]);
    });

    it('удаляет базовый ингредиент, если он уже был выбран', () => {
      const { result } = renderHook(() =>
        useIngredientsSelection({
          availableIngredients: mockAvailableIngredients,
          initialBaseIngredients: [{ id: 1, removable: true, isDisabled: false }],
        }),
      );

      act(() => {
        result.current.toggleBaseIngredient(1);
      });

      expect(result.current.baseIngredients).toEqual([]);
    });
  });

  describe('toggleRemovable', () => {
    it('переключает флаг removable у существующего ингредиента', () => {
      const { result } = renderHook(() =>
        useIngredientsSelection({
          availableIngredients: mockAvailableIngredients,
          initialBaseIngredients: [{ id: 1, removable: true, isDisabled: false }],
        }),
      );

      act(() => {
        result.current.toggleRemovable(1);
      });

      expect(result.current.baseIngredients[0].removable).toBe(false);

      act(() => {
        result.current.toggleRemovable(1);
      });

      expect(result.current.baseIngredients[0].removable).toBe(true);
    });

    it('не меняет состояние, если вызван для несуществующего ID', () => {
      const { result } = renderHook(() =>
        useIngredientsSelection({
          availableIngredients: mockAvailableIngredients,
          initialBaseIngredients: [{ id: 1, removable: true, isDisabled: false }],
        }),
      );

      act(() => {
        result.current.toggleRemovable(99);
      });

      expect(result.current.baseIngredients[0].removable).toBe(true);
    });
  });

  describe('toggleAddableIngredient', () => {
    it('добавляет и удаляет ID дополнительных ингредиентов', () => {
      const { result } = renderHook(() =>
        useIngredientsSelection({ availableIngredients: mockAvailableIngredients }),
      );

      // Добавляем
      act(() => {
        result.current.toggleAddableIngredient(2);
      });
      expect(result.current.addableIngredientIds).toEqual([2]);

      // Удаляем (повторный клик)
      act(() => {
        result.current.toggleAddableIngredient(2);
      });
      expect(result.current.addableIngredientIds).toEqual([]);
    });
  });

  describe('resetIngredients', () => {
    it('сбрасывает оба массива в пустое состояние', () => {
      const { result } = renderHook(() =>
        useIngredientsSelection({
          availableIngredients: mockAvailableIngredients,
          initialBaseIngredients: [{ id: 1, removable: true, isDisabled: false }],
          initialAddableIngredientIds: [2],
        }),
      );

      act(() => {
        result.current.resetIngredients();
      });

      expect(result.current.baseIngredients).toEqual([]);
      expect(result.current.addableIngredientIds).toEqual([]);
    });
  });

  describe('enrichedBaseIngredients', () => {
    it('правильно обогащает выбранные ингредиенты данными из справочника', () => {
      const { result } = renderHook(() =>
        useIngredientsSelection({
          availableIngredients: mockAvailableIngredients,
          initialBaseIngredients: [{ id: 1, removable: false, isDisabled: true }],
        }),
      );

      expect(result.current.enrichedBaseIngredients).toEqual([
        {
          id: 1,
          name: 'Pomodoro',
          imageUrl: 'pomodoro.png',
          removable: false,
          isDisabled: true,
        },
      ]);
    });

    it('отфильтровывает ингредиенты, которых нет в справочнике (защита от краша)', () => {
      const { result } = renderHook(() =>
        useIngredientsSelection({
          availableIngredients: mockAvailableIngredients,
          initialBaseIngredients: [{ id: 99, removable: true, isDisabled: false }],
        }),
      );

      expect(result.current.enrichedBaseIngredients).toEqual([]); // Ингредиент 99 отфильтрован
    });
  });
});
