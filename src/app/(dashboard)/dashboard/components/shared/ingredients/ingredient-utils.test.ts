import { describe, expect, it } from 'vitest';
import { formatPrice, validateIngredientData } from './ingredient-utils';

describe('Ingredient Utils', () => {
  describe('formatPrice', () => {
    it('TC-U11, TC-U12: formats standard numbers correctly', () => {
      expect(formatPrice(1.5)).toBe('1.50 €');
      expect(formatPrice(10)).toBe('10.00 €');
    });

    it('TC-U13, TC-U14: handles string inputs (Prisma Decimal serialization)', () => {
      expect(formatPrice('1.50')).toBe('1.50 €');
      expect(formatPrice('10')).toBe('10.00 €');
    });

    it('TC-U15: handles zero correctly', () => {
      expect(formatPrice(0)).toBe('0.00 €');
      expect(formatPrice('0')).toBe('0.00 €');
    });

    it('TC-U16: rounds numbers with more than 2 decimal places safely', () => {
      expect(formatPrice(1.006)).toBe('1.01 €');
      expect(formatPrice('1.006')).toBe('1.01 €');
    });
  });

  describe('validateIngredientData', () => {
    const validData = {
      name: 'Mozzarella',
      price: 2.5,
      imageUrl: 'https://example.com/mozzarella.jpg',
    };

    it('TC-U1, TC-U8: returns null for completely valid data', () => {
      expect(validateIngredientData(validData)).toBeNull();
    });

    it('TC-U2: returns error if name is empty', () => {
      expect(validateIngredientData({ ...validData, name: '' })).toBe(
        'Il nome non può essere vuoto',
      );
    });

    it('TC-U3: returns error if name contains only spaces', () => {
      expect(validateIngredientData({ ...validData, name: '   ' })).toBe(
        'Il nome non può essere vuoto',
      );
    });

    it('TC-U4: returns error if price is 0', () => {
      expect(validateIngredientData({ ...validData, price: 0 })).toBe('Inserisci un prezzo valido');
    });

    it('TC-U5: returns error if price is negative', () => {
      expect(validateIngredientData({ ...validData, price: -1.5 })).toBe(
        'Inserisci un prezzo valido',
      );
    });

    it('TC-U9: returns null for minimum valid price (0.01)', () => {
      expect(validateIngredientData({ ...validData, price: 0.01 })).toBeNull();
    });

    it('TC-U6: returns error if imageUrl is empty', () => {
      expect(validateIngredientData({ ...validData, imageUrl: '' })).toBe(
        "L'URL dell'immagine non può essere vuoto",
      );
    });

    it('TC-U10: returns null for valid URL without extension', () => {
      expect(
        validateIngredientData({ ...validData, imageUrl: 'https://example.com/image_uuid' }),
      ).toBeNull();
    });
  });
});
