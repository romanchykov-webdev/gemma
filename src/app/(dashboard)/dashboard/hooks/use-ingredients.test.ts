import { Api } from '@/../services/api-client';
import { act, renderHook } from '@testing-library/react';
import { toast } from 'react-hot-toast';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useIngredients } from './use-ingredients';

// 1. Мокаем внешние зависимости
vi.mock('@/../services/api-client', () => ({
  Api: {
    ingredients_dashboard: {
      getIngredients: vi.fn(),
      createIngredient: vi.fn(),
      updateIngredient: vi.fn(),
      deleteIngredient: vi.fn(),
    },
  },
}));

vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockIngredients = [
  { id: 1, name: 'Pomodoro', price: 1.5, imageUrl: 'https://example.com/url1.jpg' },
  { id: 2, name: 'Mozzarella', price: 2.5, imageUrl: 'https://example.com/url2.jpg' },
];

describe('useIngredients Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Инициализация и загрузка', () => {
    it('TC-H1, TC-H2: Успешно загружает ингредиенты при монтировании', async () => {
      vi.mocked(Api.ingredients_dashboard.getIngredients).mockResolvedValueOnce(mockIngredients);

      const { result } = renderHook(() => useIngredients());

      expect(result.current.loading).toBe(true);

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.ingredients).toEqual(mockIngredients);
    });
  });

  describe('handleCreate (Создание)', () => {
    it('TC-H6, TC-H7: Добавляет новый ингредиент в НАЧАЛО списка и возвращает true', async () => {
      vi.mocked(Api.ingredients_dashboard.getIngredients).mockResolvedValueOnce([]);

      const newIngredient = {
        id: 3,
        name: 'Basilico',
        price: 0.5,
        imageUrl: 'https://example.com/url3.jpg',
      };
      vi.mocked(Api.ingredients_dashboard.createIngredient).mockResolvedValueOnce(newIngredient);

      const { result } = renderHook(() => useIngredients());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      let success;
      await act(async () => {
        success = await result.current.handleCreate({
          name: 'Basilico',
          price: 0.5,
          imageUrl: 'https://example.com/url3.jpg',
        });
      });

      expect(success).toBe(true);
      expect(result.current.ingredients).toEqual([newIngredient]);
      expect(toast.success).toHaveBeenCalledWith('Ingrediente creato con successo');
    });

    it('TC-H12: Возвращает false и НЕ дергает API при ошибке валидации', async () => {
      vi.mocked(Api.ingredients_dashboard.getIngredients).mockResolvedValueOnce([]);
      const { result } = renderHook(() => useIngredients());

      let success;
      await act(async () => {
        success = await result.current.handleCreate({ name: '', price: 0, imageUrl: '' });
      });

      expect(success).toBe(false);
      expect(Api.ingredients_dashboard.createIngredient).not.toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalled();
    });

    it('TC-H9, TC-H11: Возвращает false и оставляет стейт нетронутым при ошибке сервера', async () => {
      vi.mocked(Api.ingredients_dashboard.getIngredients).mockResolvedValueOnce(mockIngredients);
      vi.mocked(Api.ingredients_dashboard.createIngredient).mockRejectedValueOnce(
        new Error('Server Error'),
      );

      const { result } = renderHook(() => useIngredients());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      let success;
      await act(async () => {
        success = await result.current.handleCreate({
          name: 'Error',
          price: 1,
          imageUrl: 'https://example.com/url.jpg',
        });
      });

      expect(success).toBe(false);
      expect(toast.error).toHaveBeenCalled();
      expect(result.current.ingredients).toEqual(mockIngredients);
    });
  });

  describe('handleDelete (Удаление)', () => {
    it('TC-H21: Успешно удаляет ингредиент из списка и возвращает true', async () => {
      vi.mocked(Api.ingredients_dashboard.getIngredients).mockResolvedValueOnce(mockIngredients);
      vi.mocked(Api.ingredients_dashboard.deleteIngredient).mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useIngredients());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      let success;
      await act(async () => {
        success = await result.current.handleDelete(1);
      });

      expect(success).toBe(true);
      expect(toast.success).toHaveBeenCalledWith('Ingrediente eliminato');
      expect(result.current.ingredients).toEqual([mockIngredients[1]]);
    });
  });
});
