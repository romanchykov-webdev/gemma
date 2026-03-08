import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProductSizeCard } from './product-size-card';
import { ProductSize } from './product-size-types';

// ✅ Мокаем LoadingOverlay — как в эталонных тестах ингредиентов
vi.mock('../loading-overlay', () => ({
  LoadingOverlay: ({ isVisible }: { isVisible: boolean }) =>
    isVisible ? <div data-testid="loading-overlay">Loading...</div> : null,
}));

// ✅ Мокаем ConfirmModal — чтобы изолировать тест от его внутренней логики
vi.mock('../confirm-modal', () => ({
  ConfirmModal: ({ children, onConfirm }: { children: React.ReactNode; onConfirm: () => void }) => (
    <div>
      {children}
      <button onClick={onConfirm} data-testid="confirm-delete">
        Conferma
      </button>
    </div>
  ),
}));

const mockSize: ProductSize = {
  id: 1,
  name: 'Piccola',
  value: 25,
  sortOrder: 0,
};

describe('ProductSizeCard', () => {
  const mockOnUpdate = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render size data correctly', () => {
    render(
      <ProductSizeCard
        size={mockSize}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        isLoading={false}
      />,
    );
    expect(screen.getByText('Piccola')).toBeInTheDocument();
    expect(screen.getByText(/25/)).toBeInTheDocument();
  });

  it('should switch to edit mode and show inputs', () => {
    render(
      <ProductSizeCard
        size={mockSize}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        isLoading={false}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /modifica/i }));
    expect(screen.getByDisplayValue('Piccola')).toBeInTheDocument();
  });

  it('should show loading overlay when isLoading is true', () => {
    render(
      <ProductSizeCard
        size={mockSize}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        isLoading={true}
      />,
    );
    // ✅ Надёжный поиск через data-testid, без хрупкого DOM-траверсала
    expect(screen.getByTestId('loading-overlay')).toBeInTheDocument();
  });

  it('should NOT close edit mode if onUpdate returns false', async () => {
    const user = userEvent.setup();
    mockOnUpdate.mockResolvedValueOnce(false);

    render(
      <ProductSizeCard
        size={mockSize}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        isLoading={false}
      />,
    );

    await user.click(screen.getByRole('button', { name: /modifica/i }));
    await user.click(screen.getByRole('button', { name: /salva modifiche/i }));

    await waitFor(() => {
      expect(screen.getByDisplayValue('Piccola')).toBeInTheDocument();
    });
  });
});
