import { describe, expect, it } from 'vitest';
import {
  formatPrice,
  getCategoryName,
  getVariantsCount,
  hasIngredients,
  validateProductData,
} from './product-utils';

describe('product-utils', () => {
  describe('validateProductData', () => {
    it('возвращает ошибку, если имя пустое', () => {
      expect(validateProductData({ name: '', imageUrl: 'http://test.com', categoryId: 1 })).toBe(
        'Il nome del prodotto è obbligatorio',
      );
      expect(validateProductData({ name: '   ', imageUrl: 'http://test.com', categoryId: 1 })).toBe(
        'Il nome del prodotto è obbligatorio',
      );
    });

    it('возвращает ошибку, если imageUrl пустой', () => {
      expect(validateProductData({ name: 'Pizza', imageUrl: '', categoryId: 1 })).toBe(
        "L'URL dell'immagine è obbligatorio",
      );
    });

    it('возвращает ошибку, если categoryId не указан (0)', () => {
      expect(
        validateProductData({ name: 'Pizza', imageUrl: 'http://test.com', categoryId: 0 }),
      ).toBe('Seleziona una categoria');
    });

    it('возвращает ошибку, если URL невалидный', () => {
      expect(validateProductData({ name: 'Pizza', imageUrl: 'not-a-url', categoryId: 1 })).toBe(
        "Inserisci un URL valido per l'immagine",
      );
    });

    it('возвращает null, если все данные валидны', () => {
      expect(
        validateProductData({ name: 'Pizza', imageUrl: 'https://test.com/img.jpg', categoryId: 1 }),
      ).toBeNull();
    });
  });

  describe('formatPrice', () => {
    it('правильно форматирует числа', () => {
      expect(formatPrice(9.5)).toBe('9.50 €');
      expect(formatPrice(0)).toBe('0.00 €');
    });

    it('справляется с NaN или некорректными данными', () => {
      expect(formatPrice(NaN)).toBe('0.00 €');
    });
  });

  describe('getCategoryName', () => {
    const categories = [
      { id: 1, name: 'Pizze' },
      { id: 2, name: 'Bevande' },
    ];

    it('возвращает имя, если категория найдена', () => {
      expect(getCategoryName(1, categories)).toBe('Pizze');
    });

    it('возвращает "Sconosciuta", если категория не найдена', () => {
      expect(getCategoryName(99, categories)).toBe('Sconosciuta');
    });
  });

  describe('getVariantsCount', () => {
    it('возвращает правильную длину массива вариантов', () => {
      expect(getVariantsCount({ variants: [{}, {}] })).toBe(2);
    });

    it('возвращает 0, если вариантов нет или массив undefined', () => {
      expect(getVariantsCount({})).toBe(0);
      expect(getVariantsCount({ variants: [] })).toBe(0);
    });
  });

  describe('hasIngredients', () => {
    it('возвращает true, если есть базовые ингредиенты', () => {
      expect(hasIngredients({ baseIngredients: [{}] })).toBe(true);
    });

    it('возвращает false, если ингредиентов нет', () => {
      expect(hasIngredients({})).toBe(false);
      expect(hasIngredients({ baseIngredients: [] })).toBe(false);
    });
  });
});
