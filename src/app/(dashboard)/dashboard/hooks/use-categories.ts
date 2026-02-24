'use client';

import { Api } from '@/../services/api-client';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  Category,
  CreateCategoryData,
  UpdateCategoryData,
} from '../components/shared/categories/category-types';
import {
  canDeleteCategory,
  getDeleteErrorMessage,
  validateCategoryData,
} from '../components/shared/categories/category-utils';

// 🔄 Утилита для безопасного извлечения сообщений об ошибках (защита от [object Object])
const getErrorMessage = (error: unknown, fallback: string): string => {
  if (!(error instanceof Error) || !('response' in error)) return fallback;
  const msg = (error as { response?: { data?: { message?: unknown } } }).response?.data?.message;
  if (typeof msg === 'string') return msg;
  if (Array.isArray(msg)) return msg.join(', ');
  return fallback;
};

//
interface UseCategoriesReturn {
  categories: Category[];
  loading: boolean;
  isCreating: boolean;
  loadingCategoryIds: Set<number>;
  loadCategories: (signal?: AbortSignal) => Promise<void>;
  handleCreate: (data: CreateCategoryData) => Promise<boolean>;
  handleUpdate: (id: number, data: UpdateCategoryData) => Promise<boolean>;
  handleDelete: (id: number, productsCount: number) => Promise<boolean>;
}

export const useCategories = (): UseCategoriesReturn => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [loadingCategoryIds, setLoadingCategoryIds] = useState<Set<number>>(new Set());

  // 🔄 Защита от Race Condition при загрузке (AbortController)
  const loadCategories = async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      const data = await Api.categories_dashboard.getCategories();

      if (signal?.aborted) return;
      setCategories(data);
    } catch (error: unknown) {
      // 1. Проверяем, является ли это ошибкой отмены запроса (тихо выходим)
      if (
        error instanceof Error &&
        (error.name === 'CanceledError' || error.name === 'AbortError')
      ) {
        return;
      }

      // 2. Если это настоящая ошибка (упал сервер, нет сети), показываем тост
      toast.error(getErrorMessage(error, 'Errore nel caricamento delle categorie'));
      console.error(error);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  };

  const handleCreate = async (data: CreateCategoryData): Promise<boolean> => {
    const validationError = validateCategoryData(data);
    if (validationError) {
      toast.error(validationError);
      return false;
    }

    try {
      setIsCreating(true);
      const newCategory = await Api.categories_dashboard.createCategory(data.name);

      // 🔄  Функциональный setState защищает от потери данных при быстрых кликах
      setCategories(prev => [...prev, newCategory]);
      toast.success('Categoria creata con successo');
      return true;
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Errore nella creazione'));
      return false;
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdate = async (id: number, data: UpdateCategoryData): Promise<boolean> => {
    const validationError = validateCategoryData(data);
    if (validationError) {
      toast.error(validationError);
      return false;
    }

    setLoadingCategoryIds(prev => new Set(prev).add(id));

    try {
      const updated = await Api.categories_dashboard.updateCategory(id, data.name);
      // 🔄 Функциональный setState
      setCategories(prev => prev.map(cat => (cat.id === id ? updated : cat)));
      toast.success('Categoria aggiornata');
      return true;
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Errore nell'aggiornamento"));
      return false;
    } finally {
      setLoadingCategoryIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleDelete = async (id: number, productsCount: number): Promise<boolean> => {
    if (!canDeleteCategory(productsCount)) {
      toast.error(getDeleteErrorMessage(productsCount));
      return false;
    }

    setLoadingCategoryIds(prev => new Set(prev).add(id));

    try {
      await Api.categories_dashboard.deleteCategory(id);
      // 🔄 Функциональный setState
      setCategories(prev => prev.filter(cat => cat.id !== id));
      toast.success('Categoria eliminata');
      return true;
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Errore nell'eliminazione"));
      return false;
    } finally {
      setLoadingCategoryIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  // 🔄 Отписка при размонтировании
  useEffect(() => {
    const controller = new AbortController();
    loadCategories(controller.signal);

    return () => {
      controller.abort();
    };
  }, []);

  return {
    categories,
    loading,
    isCreating,
    loadingCategoryIds,
    loadCategories,
    handleCreate,
    handleUpdate,
    handleDelete,
  };
};
