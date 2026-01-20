'use client';

import { Button, Input } from '@/components/ui';
import { Check, Loader2, Pencil, Trash2, X } from 'lucide-react';
import React, { useState } from 'react';
import { ProductSize, UpdateProductSizeData } from './product-size-types';
import { formatSizeValue } from './product-size-utils';

interface Props {
  size: ProductSize;
  onUpdate: (id: number, data: UpdateProductSizeData) => void;
  onDelete: (id: number) => void;
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

  const handleUpdate = () => {
    onUpdate(size.id, {
      name: editingName.trim(),
      value: editingValue,
      sortOrder: editingSortOrder,
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (!confirm('Sei sicuro di voler eliminare questa dimensione?')) {
      return;
    }
    onDelete(size.id);
  };

  return (
    <div className="bg-white border rounded-lg p-4 relative overflow-hidden">
      {isLoading && (
        <div className="absolute top-0 left-0 w-full h-full bg-gray-500 opacity-50 flex items-center justify-center">
          <Loader2 className="animate-spin" size={50} />
        </div>
      )}
      {isEditing ? (
        <div className="flex gap-3 items-center">
          <Input
            value={editingName}
            onChange={e => setEditingName(e.target.value)}
            placeholder="Nome"
            className="flex-1"
            autoFocus
          />
          <Input
            type="number"
            value={editingValue || ''}
            onChange={e => setEditingValue(Number(e.target.value))}
            placeholder="Valore"
            className="w-32"
            min="1"
          />
          <Input
            type="number"
            value={editingSortOrder || ''}
            onChange={e => setEditingSortOrder(Number(e.target.value))}
            placeholder="Ordine"
            className="w-32"
          />
          <Button size="sm" onClick={handleUpdate} className="bg-green-600 hover:bg-green-700">
            <Check className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={cancelEditing}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{size.name}</h3>
            {/* <p className="text-sm text-gray-600">
							Valore: {formatSizeValue(size.value)} • Ordine: {size.sortOrder}
						</p> */}
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
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              <Pencil className="w-4 h-4 mr-1" />
              Modifica
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDelete}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Elimina
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
