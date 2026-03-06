'use client';

import { Button, Input } from '@/components/ui';
import { Check, Pencil, Trash2, X } from 'lucide-react';
import React, { useState } from 'react';
import { ConfirmModal } from '../confirm-modal';

import { ImageUpload } from '../image-upload';
import { LoadingOverlay } from '../loading-overlay';

import { IngredientImagePreview } from './ingredient-image-preview';
import { Ingredient, UpdateIngredientData } from './ingredient-types';
import { formatPrice } from './ingredient-utils';

interface Props {
  ingredient: Ingredient;
  onUpdate: (id: number, data: UpdateIngredientData) => Promise<boolean>;
  onDelete: (id: number) => Promise<boolean>;
  isLoading?: boolean;
}

export const IngredientCard: React.FC<Props> = ({ ingredient, onUpdate, onDelete, isLoading }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingName, setEditingName] = useState(ingredient.name);
  const [editingPrice, setEditingPrice] = useState(Number(ingredient.price));
  const [editingImageUrl, setEditingImageUrl] = useState(ingredient.imageUrl);
  const [isUploading, setIsUploading] = useState(false);

  const startEditing = () => {
    setIsEditing(true);
    setEditingName(ingredient.name);
    setEditingPrice(Number(ingredient.price));
    setEditingImageUrl(ingredient.imageUrl);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditingName(ingredient.name);
    setEditingPrice(Number(ingredient.price));
    setEditingImageUrl(ingredient.imageUrl);
  };

  const handleUpdate = async () => {
    const success = await onUpdate(ingredient.id, {
      name: editingName.trim(),
      price: editingPrice,
      imageUrl: editingImageUrl.trim(),
    });

    if (success) {
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    await onDelete(ingredient.id);
  };

  const isBusy = isLoading || isUploading;

  return (
    <div className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition relative ">
      <LoadingOverlay isVisible={!!isBusy} className="bg-white/60 backdrop-blur-sm z-10" />

      {isEditing ? (
        // 📝 Режим редактирования
        <div className="p-4 space-y-3">
          <IngredientImagePreview imageUrl={editingImageUrl} className="rounded-lg" />

          <ImageUpload
            imageUrl={editingImageUrl}
            onImageChange={setEditingImageUrl}
            folder="ingredients"
            label="Cambia immagine"
            isUploading={isUploading}
            setIsUploading={setIsUploading}
            classNameButton="w-full text-brand-primary border-brand-primary/50 hover:bg-brand-primary/5 hover:text-brand-primary"
          />

          <Input
            value={editingName}
            onChange={e => setEditingName(e.target.value)}
            placeholder="Nome"
            autoFocus
            disabled={isBusy}
          />
          <Input
            type="number"
            value={editingPrice || ''}
            onChange={e => setEditingPrice(Number(e.target.value))}
            placeholder="Prezzo"
            min="0"
            step="0.01"
            disabled={isBusy}
          />

          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              onClick={handleUpdate}
              disabled={
                isBusy || !editingName.trim() || editingPrice <= 0 || !editingImageUrl.trim()
              }
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              <Check className="w-4 h-4 mr-1" />
              Salva
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={cancelEditing}
              disabled={isBusy}
              className="flex-1"
            >
              <X className="w-4 h-4 mr-1" />
              Annulla
            </Button>
          </div>
        </div>
      ) : (
        // 👁️ Режим просмотра
        <>
          <IngredientImagePreview imageUrl={ingredient.imageUrl} alt={ingredient.name} />

          <div className="p-4">
            <h3 className="font-semibold text-lg mb-1 line-clamp-2" title={ingredient.name}>
              {ingredient.name}
            </h3>
            <p className="text-brand-primary font-bold text-xl mb-3">
              {formatPrice(ingredient.price)}
            </p>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={startEditing}
                disabled={isBusy}
                className="flex-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                <Pencil className="w-4 h-4 mr-1" />
                Modifica
              </Button>

              <ConfirmModal
                onConfirm={handleDelete}
                title="Elimina Ingrediente"
                description={`Sei sicuro di voler eliminare l'ingrediente "${ingredient.name}"? Questa azione non può essere annullata.`}
              >
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isBusy}
                  className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Elimina
                </Button>
              </ConfirmModal>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
