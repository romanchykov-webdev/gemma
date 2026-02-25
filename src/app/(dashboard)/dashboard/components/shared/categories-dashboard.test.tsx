import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useCategories } from '../../hooks/use-categories';
import { CategoriesDashboard } from './categories-dashboard';

// 1. ИСПРАВЛЕНИЕ ОШИБКИ VITEST: Явно возвращаем объект с vi.fn()
vi.mock('../../hooks/use-categories', () => ({
  useCategories: vi.fn(),
}));

const mockUseCategories = vi.mocked(useCategories);

// 2. ИСПРАВЛЕНИЕ ТИПИЗАЦИИ (Без any!): Вытаскиваем точный тип массива категорий из самого хука
type CategoriesType = ReturnType<typeof useCategories>['categories'];

// Фабрика дефолтных значений хука
const createDefaultHookReturn = (
  overrides: Partial<ReturnType<typeof useCategories>> = {},
): ReturnType<typeof useCategories> => ({
  categories: [],
  loading: false,
  isCreating: false,
  loadingCategoryIds: new Set<number>(),
  loadCategories: vi.fn(),
  handleCreate: vi.fn().mockResolvedValue(true),
  handleUpdate: vi.fn().mockResolvedValue(true),
  handleDelete: vi.fn().mockResolvedValue(true),
  ...overrides,
});

describe('CategoriesDashboard (Интеграционные тесты)', () => {
  // Строгая типизация через unknown, как требует наше Правило №1
  const mockCategories = [
    { id: 1, name: 'Pizze', _count: { products: 3 } },
    { id: 2, name: 'Bevande', _count: { products: 0 } },
  ] as unknown as CategoriesType;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Группа 1: UI States ─────────────────────────────────────────────────

  it('S1: рендерит скелетоны при loading:true, скрывает контент', () => {
    mockUseCategories.mockReturnValue(createDefaultHookReturn({ loading: true }));
    const { container } = render(<CategoriesDashboard />);

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.queryByText(/gestione categorie/i)).not.toBeInTheDocument();
    expect(container.querySelector('.space-y-4')).toBeInTheDocument();
  });

  it('S2: рендерит пустое состояние при пустом массиве', () => {
    mockUseCategories.mockReturnValue(createDefaultHookReturn({ categories: [] }));
    render(<CategoriesDashboard />);

    expect(screen.getByText(/nessuna categoria trovata/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /aggiungi/i })).toBeInTheDocument();
  });

  it('S3 & S4: рендерит карточки и корректный счетчик "Totale"', () => {
    mockUseCategories.mockReturnValue(createDefaultHookReturn({ categories: mockCategories }));
    render(<CategoriesDashboard />);

    expect(screen.getByText(/totale: 2 categorie/i)).toBeInTheDocument();
    expect(screen.getByText('Pizze')).toBeInTheDocument();
    expect(screen.getByText('Bevande')).toBeInTheDocument();
    expect(screen.queryByText(/nessuna categoria trovata/i)).not.toBeInTheDocument();
  });

  // ── Группа 2: Prop Drilling ─────────────────────────────────────────────

  it('P2: isLoading пробрасывается только в карточку из loadingCategoryIds', () => {
    mockUseCategories.mockReturnValue(
      createDefaultHookReturn({
        categories: mockCategories,
        loadingCategoryIds: new Set([1]),
      }),
    );

    const { container } = render(<CategoriesDashboard />);
    const cards = container.querySelectorAll('.flex.items-center.gap-2.p-3');

    const pizzeOverlay = cards[0].querySelector('.animate-spin');
    expect(pizzeOverlay).toBeInTheDocument();

    const bevandeOverlay = cards[1].querySelector('.animate-spin');
    expect(bevandeOverlay).not.toBeInTheDocument();
  });

  // ── Группа 3: Handler Delegation ────────────────────────────────────────

  it('D1: форма корректно делегирует создание в handleCreate из хука', async () => {
    const mockHandleCreate = vi.fn().mockResolvedValue(true);
    mockUseCategories.mockReturnValue(
      createDefaultHookReturn({ categories: [], handleCreate: mockHandleCreate }),
    );

    render(<CategoriesDashboard />);

    await userEvent.type(screen.getByRole('textbox'), 'Dolci');
    await userEvent.click(screen.getByRole('button', { name: /aggiungi/i }));

    expect(mockHandleCreate).toHaveBeenCalledWith({ name: 'Dolci' });
  });
});
