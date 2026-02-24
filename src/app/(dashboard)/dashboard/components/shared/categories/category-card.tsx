'use client';

import { Button, Input } from '@/components/ui';
import { Check, Loader2, Pencil, Trash2, X } from 'lucide-react';
import React, { useState } from 'react';
import { ConfirmModal } from '../confirm-modal';
import { Category, UpdateCategoryData } from './category-types';

interface Props {
  category: Category;

  onUpdate: (id: number, data: UpdateCategoryData) => Promise<boolean>;
  onDelete: (id: number, productsCount: number) => Promise<boolean>;
  isLoading?: boolean;
}

export const CategoryCard: React.FC<Props> = ({
  category,
  onUpdate,
  onDelete,
  isLoading = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingName, setEditingName] = useState(category.name);

  const startEditing = () => {
    setIsEditing(true);
    setEditingName(category.name);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditingName(category.name);
  };

  const handleUpdate = async () => {
    const trimmedName = editingName.trim();

    // 🛡️ ЗАЩИТА: Если имя не изменилось или стало пустым, просто отменяем редактирование без запроса
    if (trimmedName === category.name || !trimmedName) {
      cancelEditing();
      return;
    }

    // ⏳ Ждем ответа от сервера. Если success === true, форма закрывается.
    // Если false - форма остается открытой, текст не теряется!
    const success = await onUpdate(category.id, { name: trimmedName });
    if (success) {
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    await onDelete(category.id, category._count?.products || 0);
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) {
      void handleUpdate();
    }
  };
  return (
    <div className="flex items-center gap-2 p-3 bg-white border rounded-lg hover:shadow-md transition relative overflow-hidden">
      {isLoading && (
        <div className="absolute top-0 left-0 w-full h-full bg-white/70 z-10 flex items-center justify-center">
          <Loader2 className="animate-spin text-blue-600" size={24} />
        </div>
      )}
      {isEditing ? (
        <>
          <Input
            value={editingName}
            onChange={e => setEditingName(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
            autoFocus
            disabled={isLoading}
          />
          <Button
            size="icon"
            variant="ghost"
            onClick={handleUpdate}
            disabled={isLoading}
            className="text-green-600 hover:text-green-700 hover:bg-green-50"
          >
            <Check className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={cancelEditing}
            disabled={isLoading}
            className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
          >
            <X className="w-4 h-4" />
          </Button>
        </>
      ) : (
        <>
          <div className="flex-1">
            <p className="font-medium">{category.name}</p>
            <p className="text-sm text-gray-500">{category._count?.products || 0} prodotti</p>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={startEditing}
            disabled={isLoading}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <ConfirmModal
            title="Elimina categoria"
            description={`Vuoi davvero eliminare la categoria "${category.name}"?`}
            onConfirm={handleDelete}
          >
            <Button
              size="icon"
              variant="outline"
              disabled={isLoading}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </ConfirmModal>
        </>
      )}
    </div>
  );
};
