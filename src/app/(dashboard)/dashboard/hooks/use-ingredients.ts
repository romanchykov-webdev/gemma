'use client';

import { Api } from '@/../services/api-client';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  CreateIngredientData,
  Ingredient,
  UpdateIngredientData,
} from '../components/shared/ingredients/ingredient-types';
import { validateIngredientData } from '../components/shared/ingredients/ingredient-utils';

import { getErrorMessage } from '../lib/utils/api-error';

interface UseIngredientsReturn {
  ingredients: Ingredient[];
  loading: boolean;
  isCreating: boolean;
  loadingIngredientIds: Set<number>;
  loadIngredients: (signal?: AbortSignal) => Promise<void>;
  handleCreate: (data: CreateIngredientData) => Promise<boolean>;
  handleUpdate: (id: number, data: UpdateIngredientData) => Promise<boolean>;
  handleDelete: (id: number) => Promise<boolean>;
}

/**
 * Кастомный хук для управления ингредиентами
 * Изолирует всю логику работы с API и состоянием от UI компонента
 */
export const useIngredients = (): UseIngredientsReturn => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [loadingIngredientIds, setLoadingIngredientIds] = useState<Set<number>>(new Set());

  // Загрузка ингредиентов
  const loadIngredients = async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      const data = await Api.ingredients_dashboard.getIngredients({ signal });
      setIngredients(data);
    } catch (error) {
      if (error instanceof Error && error.name === 'CanceledError') return;
      toast.error('Errore nel caricamento degli ingredienti');
      console.error(error);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  };

  // Создание нового ингредиента
  const handleCreate = async (data: CreateIngredientData): Promise<boolean> => {
    const validationError = validateIngredientData(data);
    if (validationError) {
      toast.error(validationError);
      return false;
    }

    try {
      setIsCreating(true);
      const newIngredient = await Api.ingredients_dashboard.createIngredient(data);
      setIngredients(prev => [newIngredient, ...prev]);
      toast.success('Ingrediente creato con successo');
      return true;
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Errore nella creazione'));
      return false;
    } finally {
      setIsCreating(false);
    }
  };

  // Обновление ингредиента
  const handleUpdate = async (id: number, data: UpdateIngredientData): Promise<boolean> => {
    const validationError = validateIngredientData(data);
    if (validationError) {
      toast.error(validationError);
      return false;
    }

    try {
      setLoadingIngredientIds(prev => new Set(prev).add(id));
      const updated = await Api.ingredients_dashboard.updateIngredient(id, data);
      setIngredients(prev => prev.map(ing => (ing.id === id ? updated : ing)));
      toast.success('Ingrediente aggiornato');
      return true;
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Errore nell'aggiornamento"));
      return false;
    } finally {
      setLoadingIngredientIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  // Удаление ингредиента
  const handleDelete = async (id: number): Promise<boolean> => {
    try {
      setLoadingIngredientIds(prev => new Set(prev).add(id));
      await Api.ingredients_dashboard.deleteIngredient(id);
      setIngredients(prev => prev.filter(ing => ing.id !== id));
      toast.success('Ingrediente eliminato');
      return true;
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Errore nell'eliminazione"));
      return false;
    } finally {
      setLoadingIngredientIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  // Загрузка при монтировании с AbortController
  useEffect(() => {
    const controller = new AbortController();
    loadIngredients(controller.signal);
    return () => controller.abort();
  }, []);

  return {
    ingredients,
    loading,
    isCreating,
    loadingIngredientIds,
    loadIngredients,
    handleCreate,
    handleUpdate,
    handleDelete,
  };
};
