import { OrderItemDTO } from '@/app/(checkout)/success/components/order-status-data';
import { describe, expect, it } from 'vitest';
import { calculateOrderItemPrice, formatItemDetails } from './order-calc';

// describe - это блок, который объединяет тесты одной функции (как заголовок)
describe('calculateOrderItemPrice (Расчет цены товара)', () => {
  // it - это сам конкретный тест
  it('должен правильно считать базовую цену (цена * количество)', () => {
    // 1. ARRANGE (Подготовка): создаем фейковый товар
    const mockItem: Partial<OrderItemDTO> = {
      price: 8,
      quantity: 2,
    };

    // 2. ACT (Действие): вызываем нашу функцию
    const result = calculateOrderItemPrice(mockItem as OrderItemDTO);

    // 3. ASSERT (Проверка): мы ожидаем, что 8 * 2 будет 16
    expect(result).toBe(16);
  });

  it('должен возвращать 0, если передать undefined (проверка нашей защиты!)', () => {
    const result = calculateOrderItemPrice(undefined);
    expect(result).toBe(0);
  });

  it('должен учитывать цену ингредиентов', () => {
    const mockItem: Partial<OrderItemDTO> = {
      price: 10,
      quantity: 1,
      ingredients: [
        { id: 1, name: 'Сыр', price: 2 },
        { id: 2, name: 'Грибы', price: 3 },
      ],
    };

    const result = calculateOrderItemPrice(mockItem as OrderItemDTO);

    // Ожидаем: 10 (пицца) + 2 (сыр) + 3 (грибы) = 15
    expect(result).toBe(15);
  });
});

describe('formatItemDetails (Форматирование деталей товара)', () => {
  it('должен склеивать размер и тип теста через точку', () => {
    // Подготовка
    const mockItem: Partial<OrderItemDTO> = {
      sizeName: 'Grande',
      typeName: 'Tradizionale',
    };

    // Действие
    const result = formatItemDetails(mockItem as OrderItemDTO);

    // Проверка
    expect(result).toBe('Grande • Tradizionale');
  });

  it('должен выводить только одно значение без лишних точек, если второго нет', () => {
    // Подготовка (например, для напитка есть только размер)
    const mockItem: Partial<OrderItemDTO> = {
      sizeName: 'Media',
      // typeName мы специально не передаем
    };

    const result = formatItemDetails(mockItem as OrderItemDTO);

    // Ожидаем просто 'Media', без висячей 'Media • '
    expect(result).toBe('Media');
  });

  it('должен возвращать пустую строку, если передать undefined', () => {
    const result = formatItemDetails(undefined);
    expect(result).toBe('');
  });
});
