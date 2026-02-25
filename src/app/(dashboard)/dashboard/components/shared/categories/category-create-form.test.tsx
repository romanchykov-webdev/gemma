import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CategoryCreateForm } from './category-create-form';

describe('CategoryCreateForm', () => {
  it('сохраняет текст в инпуте, если сервер вернул ошибку (Promise resolves to false)', async () => {
    // 1. Мокаем отказ сервера (false)
    const mockSubmit = vi.fn().mockResolvedValue(false);
    render(<CategoryCreateForm onSubmit={mockSubmit} />);

    const input = screen.getByRole('textbox');
    // Ищем кнопку по тексту (Aggiungi)
    const button = screen.getByRole('button', { name: /aggiungi/i });

    // 2. Вводим текст и жмем сабмит
    await userEvent.type(input, 'Nuova Categoria');
    await userEvent.click(button);

    // 3. Проверяем, что запрос ушел, НО инпут НЕ очистился
    expect(mockSubmit).toHaveBeenCalledWith({ name: 'Nuova Categoria' });
    expect(input).toHaveValue('Nuova Categoria');
  });

  it('очищает инпут, если категория успешно создана (Promise resolves to true)', async () => {
    // 1. Мокаем успех сервера (true)
    const mockSubmit = vi.fn().mockResolvedValue(true);
    render(<CategoryCreateForm onSubmit={mockSubmit} />);

    const input = screen.getByRole('textbox');
    const button = screen.getByRole('button', { name: /aggiungi/i });

    // 2. Вводим текст и жмем сабмит
    await userEvent.type(input, 'Dolci');
    await userEvent.click(button);

    // 3. Проверяем, что запрос ушел и инпут очистился
    expect(mockSubmit).toHaveBeenCalledWith({ name: 'Dolci' });
    expect(input).toHaveValue('');
  });

  it('блокирует кнопку отправки, если инпут пуст или содержит только пробелы', async () => {
    render(<CategoryCreateForm onSubmit={vi.fn()} />);

    const input = screen.getByRole('textbox');
    const button = screen.getByRole('button', { name: /aggiungi/i });

    // Изначально кнопка заблокирована
    expect(button).toBeDisabled();

    // Вводим пробелы - всё еще заблокирована
    await userEvent.type(input, '   ');
    expect(button).toBeDisabled();

    // Вводим нормальный текст - кнопка разблокируется
    await userEvent.clear(input);
    await userEvent.type(input, 'Pizza');
    expect(button).not.toBeDisabled();
  });
});
