import { Api } from '@/../services/api-client';
import { act, renderHook, waitFor } from '@testing-library/react';
import { toast } from 'react-hot-toast';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProductSize } from '../components/shared/product-sizes/product-size-types';
import { useProductSizes } from './use-product-sizes';

// ✅ Расширяем MockApi всеми методами, которые используем в тестах
type MockApi = {
  getProductSizes: ReturnType<typeof vi.fn>;
  createProductSize: ReturnType<typeof vi.fn>;
  updateProductSize: ReturnType<typeof vi.fn>;
  deleteProductSize: ReturnType<typeof vi.fn>;
};

// ✅ Добавляем недостающие методы в мок
vi.mock('@/../services/api-client', () => ({
  Api: {
    product_sizes_dashboard: {
      getProductSizes: vi.fn(),
      createProductSize: vi.fn(),
      updateProductSize: vi.fn(),
      deleteProductSize: vi.fn(),
    },
  },
}));

vi.mock('react-hot-toast', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe('useProductSizes: Integration Test', () => {
  // Безопасное приведение к MockApi через unknown
  const mockApi = Api.product_sizes_dashboard as unknown as MockApi;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize, load data, and successfully create a new size', async () => {
    const initialSizes: ProductSize[] = [{ id: 1, name: 'Small', value: 25, sortOrder: 0 }];
    const newSize: ProductSize = { id: 2, name: 'Large', value: 40, sortOrder: 1 };

    mockApi.getProductSizes.mockResolvedValue(initialSizes);
    mockApi.createProductSize.mockResolvedValue(newSize);

    const { result } = renderHook(() => useProductSizes());

    await waitFor(() => {
      expect(result.current.sizes).toEqual(initialSizes);
      expect(result.current.loading).toBe(false);
    });

    let success = false;
    await act(async () => {
      success = await result.current.handleCreate({
        name: 'Large',
        value: 40,
        sortOrder: 1, // ✅ Обязательное поле
      });
    });

    expect(success).toBe(true);
    expect(mockApi.createProductSize).toHaveBeenCalledTimes(1);
    expect(result.current.sizes[0]).toEqual(newSize);
    expect(toast.success).toHaveBeenCalledWith('Dimensione creata con successo');
  });

  it('should successfully update a size and update local state', async () => {
    const initialSizes: ProductSize[] = [{ id: 1, name: 'Small', value: 20, sortOrder: 0 }];
    const updatedSize: ProductSize = { id: 1, name: 'Small Updated', value: 21, sortOrder: 1 };

    mockApi.getProductSizes.mockResolvedValue(initialSizes);
    mockApi.updateProductSize.mockResolvedValue(updatedSize);

    const { result } = renderHook(() => useProductSizes());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      // ✅ Добавляем sortOrder, так как он обязателен в типе данных
      const success = await result.current.handleUpdate(1, {
        name: 'Small Updated',
        value: 21,
        sortOrder: 1,
      });
      expect(success).toBe(true);
    });

    expect(result.current.sizes[0].name).toBe('Small Updated');
    expect(result.current.sizes[0].value).toBe(21);
    expect(toast.success).toHaveBeenCalledWith('Dimensione aggiornata');
  });

  it('should successfully delete a size and remove it from state', async () => {
    const initialSizes: ProductSize[] = [
      { id: 1, name: 'Small', value: 20, sortOrder: 0 },
      { id: 2, name: 'Big', value: 40, sortOrder: 1 },
    ];

    mockApi.getProductSizes.mockResolvedValue(initialSizes);
    mockApi.deleteProductSize.mockResolvedValue({ success: true });

    const { result } = renderHook(() => useProductSizes());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.handleDelete(1);
    });

    expect(result.current.sizes).toHaveLength(1);
    expect(result.current.sizes[0].id).toBe(2);
    expect(toast.success).toHaveBeenCalledWith('Dimensione eliminata');
  });
});
