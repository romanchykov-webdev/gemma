// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Product } from '../product-types';
import { ProductEditForm } from './product-edit-form';

// 1. Мокаем компонент картинки (исправленный путь)
vi.mock('../product-image-section', () => ({
  ProductImageSection: ({
    name,
    onNameChange,
    onImageChange,
  }: {
    name: string;
    onNameChange: (value: string) => void;
    onImageChange: (url: string) => void;
  }) => (
    <div data-testid="mock-image-section">
      <input
        placeholder="Nome prodotto..."
        value={name}
        onChange={e => onNameChange(e.target.value)}
      />
      <button type="button" onClick={() => onImageChange('https://new-image.png')}>
        Change image
      </button>
    </div>
  ),
}));

vi.mock('../product-create-form-dashboard/universal-ingredients-selector', () => ({
  UniversalIngredientsSelector: () => <div data-testid="ingredients-selector" />,
}));

vi.mock('../product-create-form-dashboard/product-variants-edit-table', () => ({
  ProductVariantsEditTable: () => <div data-testid="variants-table" />,
}));

vi.mock('lucide-react', () => ({
  Check: () => <svg />,
  X: () => <svg />,
  Upload: () => <svg />,
}));

describe('ProductEditForm', () => {
  // Мок продукта для редактирования
  const mockProduct = {
    id: 1,
    name: 'Pizza Originale',
    imageUrl: 'https://old-image.png',
    categoryId: 1,
    category: { id: 1, name: 'Pizze' },
    createdAt: new Date(),
    updatedAt: new Date(),
    variants: [],
    baseIngredients: [
      { id: 10, name: 'Cheese', imageUrl: 'cheese.png', removable: true, isDisabled: false },
    ],
    addableIngredientIds: [20],
  };

  const mockProps = {
    product: mockProduct as Product,
    categories: [{ id: 1, name: 'Pizze' }],
    ingredients: [{ id: 10, name: 'Cheese', price: 1, imageUrl: 'cheese.png' }],
    sizes: [],
    doughTypes: [],
    onSave: vi.fn(),
    onCancel: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('инициализирует поля формы данными существующего продукта', () => {
    render(<ProductEditForm {...mockProps} />);

    // Проверяем, что имя подтянулось в инпут
    const input = screen.getByPlaceholderText('Nome prodotto...');
    expect(input).toHaveValue('Pizza Originale');
  });

  it('вызывает onSave с обновленными данными и сохраняет previousImageUrl', async () => {
    render(<ProductEditForm {...mockProps} />);

    // 1. Меняем имя
    const input = screen.getByPlaceholderText(/nome prodotto/i);
    fireEvent.change(input, { target: { value: 'Pizza Updated' } });

    // 2. Меняем картинку
    const changeImgBtn = screen.getByText(/change image/i);
    fireEvent.click(changeImgBtn);

    // 3. Находим и жмем "Salva"
    const saveBtn = screen.getByRole('button', { name: /Salva modifiche/i });
    fireEvent.click(saveBtn);

    // 4. Ждем проверки, так как стейт обновляется асинхронно
    await waitFor(() => {
      expect(mockProps.onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Pizza Updated',
          imageUrl: 'https://new-image.png',
          previousImageUrl: 'https://old-image.png',
        }),
      );
    });
  });

  it('вызывает onCancel при нажатии на кнопку отмены', () => {
    render(<ProductEditForm {...mockProps} />);

    const cancelBtn = screen.getByRole('button', { name: /Annulla/i });
    fireEvent.click(cancelBtn);

    expect(mockProps.onCancel).toHaveBeenCalledTimes(1);
  });
});
