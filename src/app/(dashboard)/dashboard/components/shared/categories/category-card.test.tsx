import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CategoryCard } from './category-card';

describe('CategoryCard', () => {
  const mockCategory = { id: 1, name: 'Pizze', _count: { products: 5 } };
  const mockOnUpdate = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('рендерит название категории и количество продуктов', () => {
    render(
      <CategoryCard category={mockCategory} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />,
    );
    expect(screen.getByText('Pizze')).toBeInTheDocument();
    expect(screen.getByText('5 prodotti')).toBeInTheDocument();
  });

  it('не закрывает форму редактирования, если сервер вернул ошибку (false)', async () => {
    mockOnUpdate.mockResolvedValueOnce(false); // Имитируем ошибку API
    const { container } = render(
      <CategoryCard category={mockCategory} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />,
    );

    // 1. Нажимаем кнопку редактирования (синяя кнопка с Pencil)
    const editButton = container.querySelector('.text-blue-600') as HTMLButtonElement;
    await userEvent.click(editButton);

    // 2. Вводим новый текст
    const input = screen.getByRole('textbox');
    await userEvent.clear(input);
    await userEvent.type(input, 'Nuove Pizze');

    // 3. Нажимаем кнопку сохранения (зеленая кнопка с Check)
    const saveButton = container.querySelector('.text-green-600') as HTMLButtonElement;
    await userEvent.click(saveButton);

    // 4. Проверяем: запрос ушел, НО инпут остался на экране с введенным текстом
    expect(mockOnUpdate).toHaveBeenCalledWith(1, { name: 'Nuove Pizze' });
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveValue('Nuove Pizze');
  });

  it('закрывает форму редактирования при успехе (true)', async () => {
    mockOnUpdate.mockResolvedValueOnce(true); // Имитируем успех

    // 1. Достаем функцию rerender из render
    const { container, rerender } = render(
      <CategoryCard category={mockCategory} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />,
    );

    // Открываем редактирование
    const editButton = container.querySelector('.text-blue-600') as HTMLButtonElement;
    await userEvent.click(editButton);

    // Меняем текст
    const input = screen.getByRole('textbox');
    await userEvent.clear(input);
    await userEvent.type(input, 'Super Pizze');

    // Сохраняем
    const saveButton = container.querySelector('.text-green-600') as HTMLButtonElement;
    await userEvent.click(saveButton);

    // 2. Имитируем, что родитель (Dashboard) получил новые данные
    // и передал их в карточку
    rerender(
      <CategoryCard
        category={{ ...mockCategory, name: 'Super Pizze' }}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />,
    );

    // Проверяем: запрос ушел, инпут исчез (вернулись в режим просмотра)
    expect(mockOnUpdate).toHaveBeenCalledWith(1, { name: 'Super Pizze' });
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();

    // 3. Теперь обновленный текст будет найден!
    expect(screen.getByText('Super Pizze')).toBeInTheDocument();
  });

  it('отменяет редактирование без вызова API, если имя не изменилось', async () => {
    const { container } = render(
      <CategoryCard category={mockCategory} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />,
    );

    const editButton = container.querySelector('.text-blue-600') as HTMLButtonElement;
    await userEvent.click(editButton);

    const saveButton = container.querySelector('.text-green-600') as HTMLButtonElement;
    await userEvent.click(saveButton); // Сохраняем без изменений текста

    // API не должно вызываться, форма должна закрыться
    expect(mockOnUpdate).not.toHaveBeenCalled();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });
});
