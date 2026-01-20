'use client';

import { Api } from '@/../services/api-client';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { CreateUserData, UpdateUserData, User } from '../components/shared/users/users-types';
import {
  validateCreateUserData,
  validateUpdateUserData,
} from '../components/shared/users/users-utils';

interface UseUsersReturn {
  users: User[];
  loading: boolean;
  isCreating: boolean;
  loadingUserIds: Set<string>;
  loadUsers: () => Promise<void>;
  handleCreate: (data: CreateUserData) => Promise<void>;
  handleUpdate: (id: string, data: UpdateUserData) => Promise<void>;
  handleDelete: (id: string, ordersCount: number) => Promise<void>;
}

/**
 * Кастомный хук для управления пользователями
 * Изолирует всю логику работы с API и состоянием от UI компонента
 */
export const useUsers = (): UseUsersReturn => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [loadingUserIds, setLoadingUserIds] = useState<Set<string>>(new Set());

  // Загрузка пользователей
  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await Api.users_dashboard.getUsers();
      setUsers(data);
    } catch (error) {
      toast.error('Errore nel caricamento degli utenti');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Создание пользователя
  const handleCreate = async (data: CreateUserData) => {
    // Валидация
    const validationError = validateCreateUserData(data);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      setIsCreating(true);
      const newUser = await Api.users_dashboard.createUser(data);
      setUsers([newUser, ...users]);
      toast.success('Utente creato con successo');
    } catch (error: unknown) {
      const message =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : 'Errore nella creazione';
      toast.error(message || "Errore nella creazione dell'utente");
    } finally {
      setIsCreating(false);
    }
  };

  // Обновление пользователя
  const handleUpdate = async (id: string, data: UpdateUserData) => {
    // Валидация
    const validationError = validateUpdateUserData(data);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    // Добавляем ID в состояние загрузки
    setLoadingUserIds(prev => new Set(prev).add(id));

    try {
      const updated = await Api.users_dashboard.updateUser(id, data);
      setUsers(users.map(user => (user.id === id ? updated : user)));
      toast.success('Utente aggiornato');
    } catch (error: unknown) {
      const message =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : "Errore nell'aggiornamento";
      toast.error(message || "Errore nell'aggiornamento dell'utente");
    } finally {
      // Удаляем ID из состояния загрузки
      setLoadingUserIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  // Удаление пользователя
  const handleDelete = async (id: string, ordersCount: number) => {
    // Проверка на наличие заказов
    if (ordersCount > 0) {
      toast.error(`Impossibile eliminare. L'utente ha ${ordersCount} ordini associati.`);
      return;
    }

    if (!confirm('Sei sicuro di voler eliminare questo utente?')) {
      return;
    }

    // Добавляем ID в состояние загрузки
    setLoadingUserIds(prev => new Set(prev).add(id));

    try {
      await Api.users_dashboard.deleteUser(id);
      setUsers(users.filter(user => user.id !== id));
      toast.success('Utente eliminato');
    } catch (error: unknown) {
      const message =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : "Errore nell'eliminazione";
      toast.error(message || "Errore nell'eliminazione dell'utente");
    } finally {
      // Удаляем ID из состояния загрузки
      setLoadingUserIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  // Загрузка при монтировании
  useEffect(() => {
    loadUsers();
  }, []);

  return {
    users,
    loading,
    isCreating,
    loadingUserIds,
    loadUsers,
    handleCreate,
    handleUpdate,
    handleDelete,
  };
};
