'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Api } from '../../../../../services/api-client';

import { deleteImage } from '../lib/supabase';

import {
  Category,
  CreateProductData,
  CreateProductRequest,
  DoughType,
  Ingredient,
  Product,
  ProductSize,
  UpdateProductData,
  UpdateProductRequest,
} from '../components/shared/products/product-types';
import { validateProductData } from '../components/shared/products/product-utils';

interface UseProductsReturn {
  categories: Category[];
  products: Product[];
  loading: boolean;
  selectedCategoryId: number | null;
  ingredients: Ingredient[];
  sizes: ProductSize[];
  doughTypes: DoughType[];
  loadingProductIds: Set<number>;
  setSelectedCategoryId: (id: number | null) => void;
  handleCreate: (data: CreateProductData) => Promise<void>;
  handleUpdate: (id: number, data: UpdateProductData) => Promise<void>;
  handleDelete: (id: number) => Promise<void>;
}

export const useProducts = (): UseProductsReturn => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  // Данные для форм
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [sizes, setSizes] = useState<ProductSize[]>([]);
  const [doughTypes, setDoughTypes] = useState<DoughType[]>([]);

  const [loadingProductIds, setLoadingProductIds] = useState<Set<number>>(new Set());

  // Загрузка категорий
  const loadCategories = async () => {
    try {
      const data = await Api.categories_dashboard.getCategories();
      setCategories(data);
    } catch (error) {
      toast.error('Errore nel caricamento delle categorie');
      console.error(error);
    }
  };

  // 🔄 Загрузка продуктов (с защитой от Race Condition)
  const loadProducts = async (signal?: AbortSignal) => {
    try {
      setLoading(true);

      const data = await Api.product_dashboard.getProducts(selectedCategoryId || undefined);

      const normalizedData: Product[] = data.map(product => ({
        ...product,
        variants: (product.variants || []).map(variant => ({
          ...variant,
          price: Number(variant.price),
        })),
        baseIngredients: product.baseIngredients || [],
        addableIngredientIds: product.addableIngredientIds || [],
      }));

      // Если запрос был отменен (компонент размонтирован или id сменился), не обновляем стейт
      if (signal?.aborted) return;

      setProducts(normalizedData);
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        (error.name === 'AbortError' || error.name === 'CanceledError')
      ) {
        console.log('Загрузка продуктов отменена (смена категории)');
        return;
      }
      console.error('Errore nel caricamento dei prodotti:', error);
      toast.error('Impossibile caricare i prodotti');
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  };

  // Загрузка справочников
  const loadFormData = async () => {
    try {
      const [ingredientsData, sizesData, doughTypesData] = await Promise.all([
        Api.ingredients.getAll(),
        Api.product_sizes_dashboard.getProductSizes(),
        Api.dough_types_dashboard.getDoughTypes(),
      ]);

      setIngredients(
        ingredientsData.map(ing => ({
          ...ing,
          price: Number(ing.price),
        })),
      );
      setSizes(sizesData);
      setDoughTypes(doughTypesData);
    } catch (error) {
      console.error('Errore nel caricamento dei dati del modulo:', error);
    }
  };

  // 🔄 Создание продукта
  const handleCreate = async (data: CreateProductData) => {
    const validationError = validateProductData(data);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      const apiData = {
        name: data.name,
        imageUrl: data.imageUrl,
        categoryId: data.categoryId,
        baseIngredients: data.baseIngredients,
        addableIngredientIds: data.addableIngredientIds,
        variants: data.variants?.map(variant => ({
          variantId: variant.variantId,
          price: variant.price,
          sizeId: variant.sizeId ?? undefined,
          typeId: variant.typeId ?? undefined,
        })),
      };

      const newProduct = await Api.product_dashboard.createProduct(apiData as CreateProductRequest);

      const normalized: Product = {
        ...newProduct,
        variants: (newProduct.variants || []).map(v => ({ ...v, price: Number(v.price) })),
        baseIngredients: newProduct.baseIngredients || [],
        addableIngredientIds: newProduct.addableIngredientIds || [],
      };

      setProducts(prev => [normalized, ...prev]);
      toast.success('Prodotto creato con successo');
    } catch (error: unknown) {
      console.error(error);
      const message =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : 'Errore nella creazione';
      toast.error(message || 'Errore nella creazione del prodotto');
    }
  };

  // 🔄 Обновление продукта
  const handleUpdate = async (id: number, data: UpdateProductData) => {
    const validationError = validateProductData(data);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setLoadingProductIds(prev => new Set(prev).add(id));

    try {
      const apiData = {
        name: data.name,
        imageUrl: data.imageUrl,
        categoryId: data.categoryId,
        baseIngredients: data.baseIngredients,
        addableIngredientIds: data.addableIngredientIds,
        variants: data.variants?.map(variant => ({
          variantId: variant.variantId,
          price: Number(variant.price),
          sizeId: variant.sizeId,
          typeId: variant.typeId,
        })),
      };

      const updated = await Api.product_dashboard.updateProduct(
        id,
        apiData as UpdateProductRequest,
      );

      if (data.previousImageUrl && data.previousImageUrl !== data.imageUrl) {
        try {
          console.log('[CLEANUP] Удаляем старую картинку:', data.previousImageUrl);
          await deleteImage(data.previousImageUrl);
        } catch (err) {
          console.error('[CLEANUP] Ошибка при удалении старой картинки:', err);
        }
      }

      const normalized: Product = {
        ...updated,
        variants: (updated.variants || []).map(v => ({ ...v, price: Number(v.price) })),
        baseIngredients: updated.baseIngredients || [],
        addableIngredientIds: updated.addableIngredientIds || [],
      };

      setProducts(prev => prev.map(prod => (prod.id === id ? normalized : prod)));
      toast.success('Prodotto aggiornato');
    } catch (error: unknown) {
      console.error(error);
      const message =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : "Errore nell'aggiornamento";
      toast.error(message || "Errore nell'aggiornamento");
    } finally {
      setLoadingProductIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleDelete = async (id: number) => {
    setLoadingProductIds(prev => new Set(prev).add(id));

    try {
      await Api.product_dashboard.deleteProduct(id);

      setProducts(prev => prev.filter(prod => prod.id !== id));
      toast.success('Prodotto eliminato');
    } catch (error: unknown) {
      const message =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : "Errore nell'eliminazione";
      toast.error(message || "Errore nell'eliminazione");
    } finally {
      setLoadingProductIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  useEffect(() => {
    loadCategories();
    loadFormData();
  }, []);

  useEffect(() => {
    // Ждем, пока загрузятся категории, прежде чем грузить продукты
    if (categories.length === 0) return;

    // Создаем "пульт управления" запросом
    const controller = new AbortController();

    // Передаем сигнал от пульта в функцию загрузки
    loadProducts(controller.signal);

    // Функция очистки: срабатывает КАЖДЫЙ РАЗ, когда меняется selectedCategoryId
    return () => {
      controller.abort(); // Нажимаем кнопку "Отмена" на пульте для старого запроса
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategoryId, categories]);

  return {
    categories,
    products,
    loading,
    selectedCategoryId,
    ingredients,
    sizes,
    doughTypes,
    loadingProductIds,
    setSelectedCategoryId,
    handleCreate,
    handleUpdate,
    handleDelete,
  };
};
