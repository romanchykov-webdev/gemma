import '@testing-library/jest-dom/vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { IngredientCard } from './ingredient-card';

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

describe('IngredientCard (Tier 3: Component Integration)', () => {
  const mockIngredient = {
    id: 1,
    name: 'Pomodoro',
    price: 1.5,
    imageUrl: 'https://example.com/pomodoro.jpg',
  };

  const mockOnUpdate = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('TC-C12, TC-C13, TC-C16: Переключает режимы Просмотр <-> Редактирование', async () => {
    const user = userEvent.setup();
    render(
      <IngredientCard
        ingredient={mockIngredient}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />,
    );

    expect(screen.getByText('Pomodoro')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Modifica/i }));

    const nameInput = screen.getByDisplayValue('Pomodoro');
    expect(nameInput).toBeInTheDocument();

    await user.clear(nameInput);
    await user.type(nameInput, 'Basilico');
    await user.click(screen.getByRole('button', { name: /Annulla/i }));

    expect(screen.queryByDisplayValue('Basilico')).not.toBeInTheDocument();
    expect(screen.getByText('Pomodoro')).toBeInTheDocument();
  });

  it('TC-C14: При успешном onUpdate (true) карточка ЗАКРЫВАЕТ режим редактирования', async () => {
    const user = userEvent.setup();
    mockOnUpdate.mockResolvedValueOnce(true);

    render(
      <IngredientCard
        ingredient={mockIngredient}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />,
    );

    await user.click(screen.getByRole('button', { name: /Modifica/i }));

    const nameInput = screen.getByDisplayValue('Pomodoro');
    await user.clear(nameInput);
    await user.type(nameInput, 'Pomodoro Fresco');

    await user.click(screen.getByRole('button', { name: /Salva/i }));

    expect(mockOnUpdate).toHaveBeenCalledWith(1, {
      name: 'Pomodoro Fresco',
      price: 1.5,
      imageUrl: 'https://example.com/pomodoro.jpg',
    });

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /Salva/i })).not.toBeInTheDocument();
    });
  });

  it('TC-C15: При ошибке onUpdate (false) карточка ОСТАЕТСЯ в режиме редактирования', async () => {
    const user = userEvent.setup();
    mockOnUpdate.mockResolvedValueOnce(false);

    render(
      <IngredientCard
        ingredient={mockIngredient}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />,
    );

    await user.click(screen.getByRole('button', { name: /Modifica/i }));

    const nameInput = screen.getByDisplayValue('Pomodoro');
    await user.clear(nameInput);
    await user.type(nameInput, 'Pomodoro Guasto');

    await user.click(screen.getByRole('button', { name: /Salva/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Salva/i })).toBeInTheDocument();
      expect(screen.getByDisplayValue('Pomodoro Guasto')).toBeInTheDocument();
    });
  });

  it('TC-C20, TC-C21, TC-C22: Корректно работает с модалкой удаления', async () => {
    const user = userEvent.setup();

    render(
      <IngredientCard
        ingredient={mockIngredient}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />,
    );

    // 1. Нажимаем удалить на карточке
    await user.click(screen.getByRole('button', { name: /Elimina/i }));

    // 2. Ждем появления модалки (используем итальянский текст из твоего лога)
    const modalTitle = await screen.findByText('Elimina Ingrediente');
    expect(modalTitle).toBeInTheDocument();

    // 3. Нажимаем отмену внутри модалки
    await user.click(screen.getByRole('button', { name: /Annulla/i, hidden: true }));
    expect(mockOnDelete).not.toHaveBeenCalled();

    // 4. Снова нажимаем удалить на карточке
    await user.click(screen.getByRole('button', { name: /Elimina/i }));

    // 5. Ждем модалку и подтверждаем
    await screen.findByText('Elimina Ingrediente');
    await user.click(screen.getByRole('button', { name: /Conferma/i, hidden: true }));

    // 6. Проверяем вызов
    expect(mockOnDelete).toHaveBeenCalledWith(1);
  });
});
