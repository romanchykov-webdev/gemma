// @vitest-environment jsdom

import { Api } from '@/../services/api-client';
import { act, renderHook, waitFor } from '@testing-library/react';
import { toast } from 'react-hot-toast';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Category } from '../components/shared/categories/category-types';
import { useCategories } from './use-categories';

// ─── Моки внешних зависимостей ──────────────────────────────────────────────

vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/../services/api-client', () => ({
  Api: {
    categories_dashboard: {
      getCategories: vi.fn(),
      createCategory: vi.fn(),
      updateCategory: vi.fn(),
      deleteCategory: vi.fn(),
    },
  },
}));

// ─── Вспомогательные утилиты ─────────────────────────────────────────────────

/**
 * Фабрика Axios-подобных ошибок.
 * Гарантирует: `instanceof Error === true` И `'response' in error === true`
 */
const makeAxiosError = (message: unknown): Error =>
  Object.assign(new Error('Request failed'), {
    response: { data: { message } },
  });

const initialCategories: Category[] = [
  { id: 1, name: 'Pizze', _count: { products: 3 } },
  { id: 2, name: 'Bevande', _count: { products: 0 } },
];

/**
 * Рендерит хук и ждёт завершения начальной загрузки (loading → false).
 */
const setup = async () => {
  const rendered = renderHook(() => useCategories());
  // Флашим useEffect → loadCategories → Promise resolved
  await act(async () => {});
  return rendered;
};

// ─── Тесты ───────────────────────────────────────────────────────────────────

describe('useCategories', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Дефолтный ответ для начальной загрузки при каждом renderHook
    vi.mocked(Api.categories_dashboard.getCategories).mockResolvedValue(initialCategories);
  });

  // ══════════════════════════════════════════════════════════════════════════
  // H1 — getErrorMessage: защита от [object Object]
  // ══════════════════════════════════════════════════════════════════════════
  describe('getErrorMessage', () => {
    it('показывает строку из response.data.message напрямую', async () => {
      vi.mocked(Api.categories_dashboard.createCategory).mockRejectedValueOnce(
        makeAxiosError('Categoria già esistente'),
      );
      const { result } = await setup();

      await act(async () => {
        await result.current.handleCreate({ name: 'Pizze' });
      });

      expect(toast.error).toHaveBeenCalledWith('Categoria già esistente');
    });

    it('склеивает массив строк через ", " — защита от [object Object]', async () => {
      vi.mocked(Api.categories_dashboard.createCategory).mockRejectedValueOnce(
        makeAxiosError(['name must be a string', 'name is too short']),
      );
      const { result } = await setup();

      await act(async () => {
        await result.current.handleCreate({ name: 'Pizze' });
      });

      expect(toast.error).toHaveBeenCalledWith('name must be a string, name is too short');
    });

    it('использует fallback если message — это объект', async () => {
      vi.mocked(Api.categories_dashboard.createCategory).mockRejectedValueOnce(
        makeAxiosError({ code: 'DUPLICATE', detail: 'exists' }),
      );
      const { result } = await setup();

      await act(async () => {
        await result.current.handleCreate({ name: 'Pizze' });
      });

      const toastCall = vi.mocked(toast.error).mock.calls[0][0] as string;
      expect(toastCall).not.toContain('[object Object]');
      expect(typeof toastCall).toBe('string');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // H2, H3 — loadCategories (AbortController & Network)
  // ══════════════════════════════════════════════════════════════════════════
  describe('loadCategories', () => {
    it('H2: тихо подавляет CanceledError — нет тоста, нет setCategories', async () => {
      const canceledError = Object.assign(new Error('canceled'), { name: 'CanceledError' });
      vi.mocked(Api.categories_dashboard.getCategories).mockRejectedValueOnce(canceledError);

      const { result } = renderHook(() => useCategories());
      await act(async () => {});

      expect(toast.error).not.toHaveBeenCalled();
      expect(result.current.categories).toHaveLength(0);
    });

    it('H3: показывает тост при сетевой ошибке (не отмена)', async () => {
      // 🔇 Временно глушим console.error
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const networkError = new Error('Network Error');
      vi.mocked(Api.categories_dashboard.getCategories).mockRejectedValueOnce(networkError);

      renderHook(() => useCategories());
      await act(async () => {});

      expect(toast.error).toHaveBeenCalledTimes(1);

      consoleSpy.mockRestore(); // 🔄 Возвращаем консоль на место
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // H4, H5, H6, H7 — handleCreate (Race Conditions & State)
  // ══════════════════════════════════════════════════════════════════════════
  describe('handleCreate', () => {
    it('H4: возвращает false и не вызывает API при пустом имени', async () => {
      const { result } = await setup();

      let returnValue!: boolean;
      await act(async () => {
        returnValue = await result.current.handleCreate({ name: '   ' });
      });

      expect(returnValue).toBe(false);
      expect(Api.categories_dashboard.createCategory).not.toHaveBeenCalled();
    });

    it('H5: возвращает true, добавляет категорию в стейт', async () => {
      const newCat: Category = { id: 99, name: 'Dolci', _count: { products: 0 } };
      vi.mocked(Api.categories_dashboard.createCategory).mockResolvedValueOnce(newCat);

      const { result } = await setup();

      let returnValue!: boolean;
      await act(async () => {
        returnValue = await result.current.handleCreate({ name: 'Dolci' });
      });

      expect(returnValue).toBe(true);
      expect(result.current.categories).toContainEqual(newCat);
      expect(result.current.isCreating).toBe(false);
    });

    it('H7: функциональный setState — два параллельных вызова не теряют данные', async () => {
      const cat3: Category = { id: 3, name: 'Dolci', _count: { products: 0 } };
      const cat4: Category = { id: 4, name: 'Insalate', _count: { products: 0 } };

      let resolve3!: (v: Category) => void;
      let resolve4!: (v: Category) => void;
      const deferred3 = new Promise<Category>(r => (resolve3 = r));
      const deferred4 = new Promise<Category>(r => (resolve4 = r));

      vi.mocked(Api.categories_dashboard.createCategory)
        .mockReturnValueOnce(deferred3)
        .mockReturnValueOnce(deferred4);

      const { result } = await setup();

      let p3!: Promise<boolean>;
      let p4!: Promise<boolean>;
      act(() => {
        p3 = result.current.handleCreate({ name: 'Dolci' });
        p4 = result.current.handleCreate({ name: 'Insalate' });
      });

      await act(async () => {
        resolve3(cat3);
        resolve4(cat4);
        await Promise.all([p3, p4]);
      });

      expect(result.current.categories).toHaveLength(initialCategories.length + 2);
      expect(result.current.categories).toContainEqual(cat3);
      expect(result.current.categories).toContainEqual(cat4);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // H8, H9, H10, H11 — handleUpdate
  // ══════════════════════════════════════════════════════════════════════════
  describe('handleUpdate', () => {
    it('H9: success → возвращает true, обновляет нужную категорию', async () => {
      const updatedCat: Category = { ...initialCategories[0], name: 'Pizze Speciali' };
      vi.mocked(Api.categories_dashboard.updateCategory).mockResolvedValueOnce(updatedCat);

      const { result } = await setup();

      let returnValue!: boolean;
      await act(async () => {
        returnValue = await result.current.handleUpdate(1, { name: 'Pizze Speciali' });
      });

      expect(returnValue).toBe(true);
      expect(result.current.categories.find(c => c.id === 1)?.name).toBe('Pizze Speciali');
    });

    it('H11: функциональный setState — оба ID одновременно в loadingCategoryIds', async () => {
      let resolve1!: (v: Category) => void;
      let resolve2!: (v: Category) => void;
      const deferred1 = new Promise<Category>(r => (resolve1 = r));
      const deferred2 = new Promise<Category>(r => (resolve2 = r));

      vi.mocked(Api.categories_dashboard.updateCategory)
        .mockReturnValueOnce(deferred1)
        .mockReturnValueOnce(deferred2);

      const { result } = await setup();

      act(() => {
        void result.current.handleUpdate(1, { name: 'New Pizze' });
        void result.current.handleUpdate(2, { name: 'New Bevande' });
      });

      await waitFor(() => {
        expect(result.current.loadingCategoryIds.has(1)).toBe(true);
        expect(result.current.loadingCategoryIds.has(2)).toBe(true);
      });

      await act(async () => {
        resolve1({ id: 1, name: 'New Pizze', _count: { products: 3 } });
        resolve2({ id: 2, name: 'New Bevande', _count: { products: 0 } });
      });

      expect(result.current.loadingCategoryIds.size).toBe(0);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // H12, H13, H14 — handleDelete
  // ══════════════════════════════════════════════════════════════════════════
  describe('handleDelete', () => {
    it('H12: блокирует удаление если productsCount > 0', async () => {
      const { result } = await setup();

      let returnValue!: boolean;
      await act(async () => {
        returnValue = await result.current.handleDelete(1, 3);
      });

      expect(returnValue).toBe(false);
      expect(Api.categories_dashboard.deleteCategory).not.toHaveBeenCalled();
    });

    it('H13: success → удаляет категорию из стейта', async () => {
      vi.mocked(Api.categories_dashboard.deleteCategory).mockResolvedValueOnce(undefined);
      const { result } = await setup();

      let returnValue!: boolean;
      await act(async () => {
        returnValue = await result.current.handleDelete(2, 0);
      });

      expect(returnValue).toBe(true);
      expect(result.current.categories.find(c => c.id === 2)).toBeUndefined();
    });
  });
});
