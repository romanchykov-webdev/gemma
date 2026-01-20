'use client';

import { Api } from '@/../services/api-client';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  CreateStoryData,
  Story,
  UpdateStoryData,
} from '../components/shared/stories/stories-types';
import {
  validateCreateStoryData,
  validateUpdateStoryData,
} from '../components/shared/stories/stories-utils';

interface UseStoriesReturn {
  stories: Story[];
  loading: boolean;
  isCreating: boolean;
  loadingStoryIds: Set<number>;
  loadStories: () => Promise<void>;
  handleCreate: (data: CreateStoryData) => Promise<void>;
  handleUpdate: (id: number, data: UpdateStoryData) => Promise<void>;
  handleDelete: (id: number) => Promise<void>;
}

/**
 * Кастомный хук для управления stories
 * Изолирует всю логику работы с API и состоянием от UI компонента
 */
export const useStories = (): UseStoriesReturn => {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [loadingStoryIds, setLoadingStoryIds] = useState<Set<number>>(new Set());

  // Загрузка stories
  const loadStories = async () => {
    try {
      setLoading(true);
      const data = await Api.stories_dashboard.getStories();
      setStories(data);
    } catch (error) {
      console.error('[USE_STORIES] Load error:', error);
      toast.error('Errore nel caricamento delle storie');
    } finally {
      setLoading(false);
    }
  };

  // Создание story
  const handleCreate = async (data: CreateStoryData) => {
    // Валидация
    const validationError = validateCreateStoryData(data);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      setIsCreating(true);
      const newStory = await Api.stories_dashboard.createStory(data);
      setStories([newStory, ...stories]);
      toast.success('Storia creata con successo');
    } catch (error: unknown) {
      console.error('[USE_STORIES] Create error:', error);
      const message =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : error instanceof Error
            ? error.message
            : 'Errore nella creazione';
      toast.error(message || 'Errore nella creazione della storia');
    } finally {
      setIsCreating(false);
    }
  };

  // Обновление story
  const handleUpdate = async (id: number, data: UpdateStoryData) => {
    console.log('[USE_STORIES] Update start:', id, data);

    // Валидация
    const validationError = validateUpdateStoryData(data);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    // Добавляем ID в состояние загрузки
    setLoadingStoryIds(prev => {
      const newSet = new Set(prev).add(id);
      console.log('[USE_STORIES] Loading IDs after add:', Array.from(newSet));
      return newSet;
    });

    try {
      const updated = await Api.stories_dashboard.updateStory(id, data);
      console.log('[USE_STORIES] Update success:', updated);
      setStories(stories.map(story => (story.id === id ? updated : story)));
      toast.success('Storia aggiornata con successo');
    } catch (error: unknown) {
      console.error('[USE_STORIES] Update error:', error);
      const message =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : error instanceof Error
            ? error.message
            : "Errore nell'aggiornamento";
      toast.error(message || "Errore nell'aggiornamento della storia");
    } finally {
      // Удаляем ID из состояния загрузки
      setLoadingStoryIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        console.log('[USE_STORIES] Loading IDs after delete:', Array.from(newSet));
        return newSet;
      });
    }
  };

  // Удаление story
  const handleDelete = async (id: number) => {
    if (!confirm('Sei sicuro di voler eliminare questa storia?')) {
      return;
    }

    console.log('[USE_STORIES] Delete start:', id);

    // Добавляем ID в состояние загрузки
    setLoadingStoryIds(prev => new Set(prev).add(id));

    try {
      await Api.stories_dashboard.deleteStory(id);
      console.log('[USE_STORIES] Delete success');
      setStories(stories.filter(story => story.id !== id));
      toast.success('Storia eliminata con successo');
    } catch (error: unknown) {
      console.error('[USE_STORIES] Delete error:', error);
      const message =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : error instanceof Error
            ? error.message
            : "Errore nell'eliminazione";
      toast.error(message || "Errore nell'eliminazione della storia");
    } finally {
      // Удаляем ID из состояния загрузки
      setLoadingStoryIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  // Загрузка при монтировании
  useEffect(() => {
    loadStories();
  }, []);

  return {
    stories,
    loading,
    isCreating,
    loadingStoryIds,
    loadStories,
    handleCreate,
    handleUpdate,
    handleDelete,
  };
};
