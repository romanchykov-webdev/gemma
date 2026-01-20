import { CreateStoryData, UpdateStoryData } from './stories-types';

/**
 * Валидация URL
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Валидация данных при создании истории
 */
export const validateCreateStoryData = (data: CreateStoryData): string | null => {
  if (!data.previewImageUrl || !data.previewImageUrl.trim()) {
    return "L'URL dell'immagine di anteprima è obbligatorio";
  }

  if (!isValidUrl(data.previewImageUrl)) {
    return "L'URL dell'immagine di anteprima non è valido";
  }

  if (!data.items || data.items.length === 0) {
    return 'Almeno un elemento della storia è obbligatorio';
  }

  // Проверка каждого item
  for (let i = 0; i < data.items.length; i++) {
    const item = data.items[i];
    if (!item.sourceUrl || !item.sourceUrl.trim()) {
      return `L'elemento ${i + 1} deve avere un URL`;
    }
    if (!isValidUrl(item.sourceUrl)) {
      return `L'URL dell'elemento ${i + 1} non è valido`;
    }
  }

  return null;
};

/**
 * Валидация данных при обновлении истории
 */
export const validateUpdateStoryData = (data: UpdateStoryData): string | null => {
  if (data.previewImageUrl !== undefined) {
    if (!data.previewImageUrl.trim()) {
      return "L'URL dell'immagine di anteprima non può essere vuoto";
    }
    if (!isValidUrl(data.previewImageUrl)) {
      return "L'URL dell'immagine di anteprima non è valido";
    }
  }

  if (data.items !== undefined) {
    if (data.items.length === 0) {
      return 'Almeno un elemento della storia è obbligatorio';
    }

    for (let i = 0; i < data.items.length; i++) {
      const item = data.items[i];
      if (!item.sourceUrl || !item.sourceUrl.trim()) {
        return `L'elemento ${i + 1} deve avere un URL`;
      }
      if (!isValidUrl(item.sourceUrl)) {
        return `L'URL dell'elemento ${i + 1} non è valido`;
      }
    }
  }

  return null;
};

/**
 * Форматирование даты
 */
export const formatDate = (date: Date | string): string => {
  return new Date(date).toLocaleDateString('it-IT', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Получение типа файла по URL
 */
export const getFileType = (url: string): 'image' | 'video' | 'unknown' => {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/)) {
    return 'image';
  }
  if (lowerUrl.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/)) {
    return 'video';
  }
  return 'unknown';
};
