import { describe, expect, it } from 'vitest';
import { canDeleteCategory, getDeleteErrorMessage, validateCategoryData } from './category-utils';

describe('Category Utils', () => {
  describe('validateCategoryData', () => {
    it('возвращает сообщение об ошибке для пустого имени', () => {
      // Имя путое
      expect(typeof validateCategoryData({ name: '' })).toBe('string');
    });

    it('возвращает сообщение об ошибке для имени, состоящего только из пробелов', () => {
      // Только пробелы
      expect(typeof validateCategoryData({ name: '   ' })).toBe('string');
    });

    it('возвращает null (нет ошибок) для валидного имени', () => {
      // Валидное имя
      expect(validateCategoryData({ name: 'Pizza' })).toBeNull(); // или undefined, в зависимости от твоей реализации
    });
  });

  describe('canDeleteCategory', () => {
    it('разрешает удаление (true), если товаров 0', () => {
      expect(canDeleteCategory(0)).toBe(true);
    });

    it('запрещает удаление (false), если есть привязанные товары', () => {
      expect(canDeleteCategory(5)).toBe(false);
    });
  });

  describe('getDeleteErrorMessage', () => {
    it('формирует правильное сообщение, подставляя количество товаров', () => {
      const message = getDeleteErrorMessage(3);
      expect(message).toContain('3'); // Проверяем, что число интерполировалось в строку
      expect(typeof message).toBe('string');
    });
  });
});
