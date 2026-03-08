import { describe, expect, it } from 'vitest';
import { formatSizeValue, isDuplicateName, validateProductSizeData } from './product-size-utils';

describe('Product Size Utils', () => {
  describe('validateProductSizeData', () => {
    it('should return error if name is empty', () => {
      const result = validateProductSizeData({ name: '', value: 10, sortOrder: 0 });
      expect(result).toBe('Il nome non può essere vuoto');
    });

    it('should return error if value is zero or negative', () => {
      expect(validateProductSizeData({ name: 'S', value: 0, sortOrder: 0 })).toBe(
        'Inserisci un valore valido maggiore di zero',
      );
      expect(validateProductSizeData({ name: 'S', value: -5, sortOrder: 0 })).toBe(
        'Inserisci un valore valido maggiore di zero',
      );
    });

    it('should return null for valid data', () => {
      const result = validateProductSizeData({ name: 'Media', value: 30, sortOrder: 5 });
      expect(result).toBeNull();
    });
  });

  describe('formatSizeValue', () => {
    it('should return string representation of the number', () => {
      // ✅ Проверяем, что "cm" больше не добавляется
      expect(formatSizeValue(30)).toBe('30');
      expect(formatSizeValue(0.5)).toBe('0.5');
    });
  });

  describe('isDuplicateName', () => {
    const mockSizes = [
      { id: 1, name: 'Piccola', value: 25 },
      { id: 2, name: 'Media', value: 30 },
    ];

    it('should detect duplicate regardless of case', () => {
      expect(isDuplicateName('piccola', mockSizes)).toBe(true);
      expect(isDuplicateName('MEDIA', mockSizes)).toBe(true);
    });

    it('should return false if name is unique', () => {
      expect(isDuplicateName('Grande', mockSizes)).toBe(false);
    });

    it('should ignore the item itself when excludeId is provided', () => {
      // Если мы редактируем размер #1 и не меняем ему имя "Piccola", это не дубликат
      expect(isDuplicateName('Piccola', mockSizes, 1)).toBe(false);
    });
  });
});
