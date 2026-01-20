import { CreateUserData, UpdateUserData, UserRole } from './users-types';

/**
 * Метки ролей на итальянском
 */
export const roleLabels: Record<UserRole, string> = {
  [UserRole.USER]: 'Cliente',
  [UserRole.ADMIN]: 'Amministratore',
  [UserRole.CONTENT_MAKER]: 'Content Maker',
  [UserRole.OWNER]: 'Proprietario',
};

/**
 * Цвета для ролей
 */
export const roleColors: Record<UserRole, string> = {
  [UserRole.USER]: 'bg-gray-100 text-gray-800 border-gray-300',
  [UserRole.ADMIN]: 'bg-blue-100 text-blue-800 border-blue-300',
  [UserRole.CONTENT_MAKER]: 'bg-purple-100 text-purple-800 border-purple-300',
  [UserRole.OWNER]: 'bg-red-100 text-red-800 border-red-300',
};

/**
 * Список всех ролей для селекта
 */
export const allRoles: UserRole[] = [
  UserRole.USER,
  UserRole.ADMIN,
  UserRole.CONTENT_MAKER,
  UserRole.OWNER,
];

/**
 * Валидация email
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Валидация данных при создании пользователя
 */
export const validateCreateUserData = (data: CreateUserData): string | null => {
  if (!data.fullName.trim()) {
    return 'Il nome completo è obbligatorio';
  }

  if (data.fullName.trim().length < 2) {
    return 'Il nome deve contenere almeno 2 caratteri';
  }

  if (!data.email.trim()) {
    return "L'email è obbligatoria";
  }

  if (!isValidEmail(data.email)) {
    return "Inserisci un'email valida";
  }

  if (!data.password || data.password.length < 6) {
    return 'La password deve contenere almeno 6 caratteri';
  }

  return null;
};

/**
 * Валидация данных при обновлении пользователя
 */
export const validateUpdateUserData = (data: UpdateUserData): string | null => {
  if (data.fullName !== undefined && !data.fullName.trim()) {
    return 'Il nome completo non può essere vuoto';
  }

  if (data.fullName !== undefined && data.fullName.trim().length < 2) {
    return 'Il nome deve contenere almeno 2 caratteri';
  }

  if (data.email !== undefined && !data.email.trim()) {
    return "L'email non può essere vuota";
  }

  if (data.email !== undefined && !isValidEmail(data.email)) {
    return "Inserisci un'email valida";
  }

  return null;
};

/**
 * Форматирование даты
 */
export const formatDate = (date: Date | string | null): string => {
  if (!date) return 'Non verificato';
  return new Date(date).toLocaleDateString('it-IT', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Получение иконки провайдера
 */
export const getProviderLabel = (provider: string | null): string => {
  if (!provider) return 'Email';
  if (provider === 'google') return 'Google';
  if (provider === 'github') return 'GitHub';
  return provider;
};
