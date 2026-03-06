import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import '@testing-library/jest-dom/vitest';
import { IngredientCreateForm } from './ingredient-create-form';

// 1. Мокаем next/image строго по типам и правилам a11y
vi.mock('next/image', () => ({
  default: ({ fill, alt, ...props }: { fill?: boolean; alt?: string; [key: string]: unknown }) => {
    return <img data-fill={fill ? 'true' : undefined} alt={alt || 'mock image'} {...props} />;
  },
}));

// 2. Мокаем ImageUpload со строгими типами
vi.mock('../image-upload', () => ({
  ImageUpload: ({
    imageUrl,
    onImageChange,
  }: {
    imageUrl: string;
    onImageChange: (url: string) => void;
  }) => (
    <input
      data-testid="mock-image-upload"
      value={imageUrl}
      onChange={e => onImageChange(e.target.value)}
      placeholder="Mock Image Upload"
    />
  ),
}));

// 3. Мокаем LoadingOverlay
vi.mock('../loading-overlay', () => ({
  LoadingOverlay: ({ isVisible }: { isVisible: boolean }) =>
    isVisible ? <div data-testid="loading-overlay">Loading...</div> : null,
}));

describe('IngredientCreateForm (Tier 3: Component Integration)', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('TC-C1...TC-C4: Кнопка Submit задизаблена, пока все поля не станут валидными', async () => {
    const user = userEvent.setup();
    render(<IngredientCreateForm onSubmit={mockOnSubmit} />);

    const submitBtn = screen.getByRole('button', { name: /Aggiungi Ingrediente/i });
    const nameInput = screen.getByPlaceholderText(/Nome ingrediente/i);
    const priceInput = screen.getByPlaceholderText(/Prezzo/i);
    const imageUpload = screen.getByTestId('mock-image-upload');

    expect(submitBtn).toBeDisabled();

    await user.type(nameInput, 'Pomodoro');
    expect(submitBtn).toBeDisabled();

    await user.type(priceInput, '1.5');
    expect(submitBtn).toBeDisabled();

    // Загружаем картинку
    await user.type(imageUpload, 'https://example.com/test.jpg');
    // Теперь форма полностью валидна!
    expect(submitBtn).toBeEnabled();
  });

  it('TC-C6: Форма ОЧИЩАЕТСЯ, если onSubmit возвращает true (Успех)', async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockResolvedValueOnce(true);

    render(<IngredientCreateForm onSubmit={mockOnSubmit} />);

    const nameInput = screen.getByPlaceholderText(/Nome ingrediente/i);
    const priceInput = screen.getByPlaceholderText(/Prezzo/i);
    const imageUpload = screen.getByTestId('mock-image-upload');
    const submitBtn = screen.getByRole('button', { name: /Aggiungi Ingrediente/i });

    await user.type(nameInput, 'Mozzarella');
    await user.type(priceInput, '2.5');
    await user.type(imageUpload, 'https://example.com/mozzarella.jpg');

    await user.click(submitBtn);

    expect(mockOnSubmit).toHaveBeenCalledWith({
      name: 'Mozzarella',
      price: 2.5,
      imageUrl: 'https://example.com/mozzarella.jpg',
    });

    await waitFor(() => {
      expect(nameInput).toHaveValue('');
      expect(imageUpload).toHaveValue('');
      expect(priceInput).toHaveValue(null);
    });
  });

  it('TC-C7: Форма НЕ ОЧИЩАЕТСЯ, если onSubmit возвращает false (Ошибка сервера)', async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockResolvedValueOnce(false);

    render(<IngredientCreateForm onSubmit={mockOnSubmit} />);

    const nameInput = screen.getByPlaceholderText(/Nome ingrediente/i);
    const priceInput = screen.getByPlaceholderText(/Prezzo/i);
    const imageUpload = screen.getByTestId('mock-image-upload');
    const submitBtn = screen.getByRole('button', { name: /Aggiungi Ingrediente/i });

    await user.type(nameInput, 'Basilico');
    await user.type(priceInput, '0.5');
    await user.type(imageUpload, 'https://example.com/basilico.jpg');

    await user.click(submitBtn);

    await waitFor(() => {
      expect(nameInput).toHaveValue('Basilico');
      expect(priceInput).toHaveValue(0.5);
      expect(imageUpload).toHaveValue('https://example.com/basilico.jpg');
    });
  });
});
