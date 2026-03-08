'use client';

import { Button, Input } from '@/components/ui';
import { Check, Pencil, Trash2, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { ConfirmModal } from '../confirm-modal';
import { LoadingOverlay } from '../loading-overlay';
import { ProductSize, UpdateProductSizeData } from './product-size-types';
import { formatSizeValue } from './product-size-utils';

interface Props {
  size: ProductSize;
  onUpdate: (id: number, data: UpdateProductSizeData) => Promise<boolean>;
  onDelete: (id: number) => Promise<boolean>;
  isLoading?: boolean;
}

export const ProductSizeCard: React.FC<Props> = ({ size, onUpdate, onDelete, isLoading }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingName, setEditingName] = useState(size.name);
  const [editingValue, setEditingValue] = useState(size.value);
  const [editingSortOrder, setEditingSortOrder] = useState(size.sortOrder);

  const startEditing = () => {
    setIsEditing(true);
    setEditingName(size.name);
    setEditingValue(size.value);
    setEditingSortOrder(size.sortOrder);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditingName(size.name);
    setEditingValue(size.value);
    setEditingSortOrder(size.sortOrder);
  };

  const handleUpdate = async () => {
    const success = await onUpdate(size.id, {
      name: editingName.trim(),
      value: editingValue,
      sortOrder: editingSortOrder,
    });

    if (success) {
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    await onDelete(size.id);
  };

  // ✅ ПАРАНОИДАЛЬНЫЙ ФИКС: Синхронизация стейта при внешнем обновлении
  useEffect(() => {
    if (!isEditing) {
      setEditingName(size.name);
      setEditingValue(size.value);
      setEditingSortOrder(size.sortOrder);
    }
  }, [size.name, size.value, size.sortOrder, isEditing]);

  return (
    <div className="bg-white border rounded-lg p-4 relative overflow-hidden">
      <LoadingOverlay isVisible={!!isLoading} />

      {isEditing ? (
        <div className="flex gap-3 items-center">
          <Input
            value={editingName}
            onChange={e => setEditingName(e.target.value)}
            placeholder="Nome"
            className="flex-1"
            autoFocus
            disabled={isLoading}
          />
          <Input
            type="number"
            value={editingValue || ''}
            onChange={e => setEditingValue(Number(e.target.value))}
            placeholder="Valore"
            className="w-32"
            min="1"
            disabled={isLoading}
          />
          <Input
            type="number"
            value={editingSortOrder || ''}
            onChange={e => setEditingSortOrder(Number(e.target.value))}
            placeholder="Ordine"
            className="w-32"
            disabled={isLoading}
          />
          <Button
            size="sm"
            onClick={handleUpdate}
            disabled={isLoading || !editingName.trim() || editingValue <= 0}
            className="bg-green-600 hover:bg-green-700"
            aria-label="Salva modifiche"
          >
            <Check className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={cancelEditing} disabled={isLoading}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{size.name}</h3>
            <p className="text-sm text-gray-600">
              Valore: {formatSizeValue(size.value)} • Ordine: {size.sortOrder}
              {size._count && size._count.productItems > 0 && (
                <> • Prodotti: {size._count.productItems}</>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={startEditing}
              disabled={isLoading}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              <Pencil className="w-4 h-4 mr-1" />
              Modifica
            </Button>

            <ConfirmModal
              onConfirm={handleDelete}
              title="Elimina Dimensione"
              description={`Sei sicuro di voler eliminare la dimensione "${size.name}"? Questa azione non può essere annullata.`}
            >
              <Button
                size="sm"
                variant="outline"
                disabled={isLoading}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Elimina
              </Button>
            </ConfirmModal>
          </div>
        </div>
      )}
    </div>
  );
};
