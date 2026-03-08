import '@testing-library/jest-dom/vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProductSizeCreateForm } from './product-size-create-form';

// ✅ Мокаем LoadingOverlay — как в эталонных тестах ингредиентов
vi.mock('../loading-overlay', () => ({
  LoadingOverlay: ({ isVisible }: { isVisible: boolean }) =>
    isVisible ? <div data-testid="loading-overlay">Loading...</div> : null,
}));

describe('ProductSizeCreateForm', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should disable submit button when inputs are empty', () => {
    render(<ProductSizeCreateForm onSubmit={mockOnSubmit} isCreating={false} />);
    const button = screen.getByRole('button', { name: /aggiungi/i });
    expect(button).toBeDisabled();
  });

  it('should show LoadingOverlay when isCreating is true', () => {
    render(<ProductSizeCreateForm onSubmit={mockOnSubmit} isCreating={true} />);
    // ✅ Находим через data-testid — надёжно и независимо от DOM-структуры
    expect(screen.getByTestId('loading-overlay')).toBeInTheDocument();
  });

  it('should not clear form if onSubmit returns false', async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockResolvedValueOnce(false);

    render(<ProductSizeCreateForm onSubmit={mockOnSubmit} isCreating={false} />);

    const nameInput = screen.getByPlaceholderText(/Nome/i);
    const valueInput = screen.getByPlaceholderText(/Valore/i);

    await user.type(nameInput, 'Grande');
    await user.type(valueInput, '35');
    await user.click(screen.getByRole('button', { name: /aggiungi/i }));

    await waitFor(() => {
      expect(nameInput).toHaveValue('Grande');
    });
  });

  it('should clear form if onSubmit returns true', async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockResolvedValueOnce(true);

    render(<ProductSizeCreateForm onSubmit={mockOnSubmit} isCreating={false} />);

    const nameInput = screen.getByPlaceholderText(/Nome/i);
    const valueInput = screen.getByPlaceholderText(/Valore/i);

    await user.type(nameInput, 'Grande');
    await user.type(valueInput, '35');
    await user.click(screen.getByRole('button', { name: /aggiungi/i }));

    await waitFor(() => {
      expect(nameInput).toHaveValue('');
      expect(valueInput).toHaveValue(null);
    });
  });
});
