// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import toast from 'react-hot-toast';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Api } from '../../../../../services/api-client';
import { CreateProductData } from '../components/shared/products/product-types';
import { useProducts } from './use-products';

// 1. МОКАЕМ ВНЕШНИЕ БИБЛИОТЕКИ И API
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('../../../../../services/api-client', () => ({
  Api: {
    categories_dashboard: { getCategories: vi.fn() },
    product_dashboard: {
      getProducts: vi.fn(),
      createProduct: vi.fn(),
      updateProduct: vi.fn(),
      deleteProduct: vi.fn(),
    },
    ingredients: { getAll: vi.fn() },
    product_sizes_dashboard: { getProductSizes: vi.fn() },
    dough_types_dashboard: { getDoughTypes: vi.fn() },
  },
}));

vi.mock('../lib/supabase', () => ({
  deleteImage: vi.fn(),
}));

describe('useProducts', () => {
  // Перед каждым тестом очищаем историю вызовов наших моков и задаем дефолтные ответы
  beforeEach(() => {
    vi.clearAllMocks();

    // Имитируем успешные ответы от сервера при первичной загрузке
    vi.mocked(Api.categories_dashboard.getCategories).mockResolvedValue([]);
    vi.mocked(Api.ingredients.getAll).mockResolvedValue([]);
    vi.mocked(Api.product_sizes_dashboard.getProductSizes).mockResolvedValue([]);
    vi.mocked(Api.dough_types_dashboard.getDoughTypes).mockResolvedValue([]);
    vi.mocked(Api.product_dashboard.getProducts).mockResolvedValue([]);
  });

  describe('handleCreate', () => {
    it('блокирует создание и показывает ошибку, если данные невалидны (нет имени)', async () => {
      const { result } = renderHook(() => useProducts());

      const invalidData: CreateProductData = {
        name: '   ', // Пустое имя!
        imageUrl: 'https://test.com/img.jpg',
        categoryId: 1,
      };

      await act(async () => {
        await result.current.handleCreate(invalidData);
      });

      // Проверяем, что API НЕ был вызван
      expect(Api.product_dashboard.createProduct).not.toHaveBeenCalled();
      // Проверяем, что показалась ошибка
      expect(toast.error).toHaveBeenCalledWith('Il nome del prodotto è obbligatorio');
    });

    it('вызывает API и добавляет продукт при валидных данных', async () => {
      // Имитируем ответ сервера при успешном создании пиццы
      const mockCreatedProduct = {
        id: 99,
        name: 'Margarita',
        imageUrl: 'https://test.com/img.jpg',
        categoryId: 1,
        category: { id: 1, name: 'Pizze' },
        createdAt: new Date(),
        updatedAt: new Date(),
        variants: [],
        baseIngredients: [],
        addableIngredientIds: [],
      };

      vi.mocked(Api.product_dashboard.createProduct).mockResolvedValue(mockCreatedProduct);

      const { result } = renderHook(() => useProducts());

      const validData: CreateProductData = {
        name: 'Margarita',
        imageUrl: 'https://test.com/img.jpg',
        categoryId: 1,
      };

      await act(async () => {
        await result.current.handleCreate(validData);
      });

      // Проверяем, что API был вызван с правильными параметрами
      expect(Api.product_dashboard.createProduct).toHaveBeenCalledWith({
        name: 'Margarita',
        imageUrl: 'https://test.com/img.jpg',
        categoryId: 1,
        baseIngredients: undefined,
        addableIngredientIds: undefined,
        variants: undefined,
      });

      // Проверяем, что появилось уведомление об успехе
      expect(toast.success).toHaveBeenCalledWith('Prodotto creato con successo');

      // Проверяем, что новый продукт добавился в стейт `products`
      expect(result.current.products).toHaveLength(1);
      expect(result.current.products[0].name).toBe('Margarita');
    });
  });
});
