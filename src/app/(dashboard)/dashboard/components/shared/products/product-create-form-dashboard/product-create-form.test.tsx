// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProductCreateFormDashboard } from './product-create-form';

// 1. ПОДМЕНЯЕМ КОМПОНЕНТ КАРТИНКИ
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
    <div>
      <input
        placeholder="Nome prodotto test..."
        value={name}
        onChange={e => onNameChange(e.target.value)}
      />
      <button
        type="button"
        data-testid="trigger-upload"
        onClick={() => onImageChange('https://test.com/pizza.png')}
      >
        Upload
      </button>
    </div>
  ),
}));

// 2. МОКАЕМ ИКОНКИ LUCIDE-REACT
vi.mock('lucide-react', async importOriginal => {
  const actual = await importOriginal<typeof import('lucide-react')>();
  return { ...actual };
});

describe('ProductCreateFormDashboard', () => {
  const mockCategories = [
    { id: 1, name: 'Pizze' },
    { id: 2, name: 'Bevande' },
  ];
  const mockIngredients = [{ id: 1, name: 'Pomodoro', price: 1, imageUrl: 'pomodoro.png' }];
  const mockSizes = [{ id: 1, name: 'Piccola', value: 25 }];
  const mockDoughTypes = [{ id: 1, name: 'Classico', value: 1 }];

  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('рендерит форму и держит кнопку отправки заблокированной до ввода данных', () => {
    render(
      <ProductCreateFormDashboard
        categories={mockCategories}
        ingredients={mockIngredients}
        sizes={mockSizes}
        doughTypes={mockDoughTypes}
        onSubmit={mockOnSubmit}
      />,
    );

    const submitBtn = screen.getByRole('button', { name: /Aggiungi Prodotto/i });
    expect(submitBtn).toBeDisabled();
  });

  it('разблокирует кнопку и вызывает onSubmit с правильными данными при заполнении формы', async () => {
    render(
      <ProductCreateFormDashboard
        categories={mockCategories}
        ingredients={mockIngredients}
        sizes={mockSizes}
        doughTypes={mockDoughTypes}
        onSubmit={mockOnSubmit}
      />,
    );

    const submitBtn = screen.getByRole('button', { name: /Aggiungi Prodotto/i });
    expect(submitBtn).toBeDisabled();

    const nameInput = screen.getByPlaceholderText('Nome prodotto test...');
    fireEvent.change(nameInput, { target: { value: 'Margherita Test' } });

    const uploadBtn = screen.getByTestId('trigger-upload');
    fireEvent.click(uploadBtn);

    const categorySelect = screen.getByRole('combobox');
    fireEvent.change(categorySelect, { target: { value: '1' } });

    expect(submitBtn).not.toBeDisabled();

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'Margherita Test',
        imageUrl: 'https://test.com/pizza.png',
        categoryId: 1,
        baseIngredients: undefined,
        addableIngredientIds: [],
        variants: undefined,
      });
    });
  });
});
