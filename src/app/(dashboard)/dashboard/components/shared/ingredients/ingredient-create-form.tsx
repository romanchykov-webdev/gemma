'use client';

import { Button, Input } from '@/components/ui';
import { ImageIcon, Plus, X } from 'lucide-react';
import Image from 'next/image';
import React, { useState } from 'react';
import { ImageUpload } from '../image-upload';
import { LoadingOverlay } from '../loading-overlay';
import { CreateIngredientData } from './ingredient-types';

interface Props {
  onSubmit: (data: CreateIngredientData) => Promise<boolean>;
  isCreating?: boolean;
}

export const IngredientCreateForm: React.FC<Props> = ({ onSubmit, isCreating = false }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async () => {
    const success = await onSubmit({
      name: name.trim(),
      price: price,
      imageUrl: imageUrl.trim(),
    });

    if (success) {
      setName('');
      setPrice(0);
      setImageUrl('');
    }
  };

  const isFormValid = name.trim() && price > 0 && imageUrl.trim();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && isFormValid && !isCreating && !isUploading) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="bg-white p-5 rounded-lg border relative overflow-hidden">
      <LoadingOverlay isVisible={!!isCreating || isUploading} />

      <h3 className="font-semibold text-lg mb-4">Aggiungi nuovo ingrediente</h3>

      <div className="flex flex-col gap-5">
        {/* ✅ СТРОКА 1: Инпуты  */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            placeholder="Nome ingrediente..."
            value={name}
            onChange={e => setName(e.target.value)}
            disabled={isCreating || isUploading}
            onKeyDown={handleKeyDown}
            className="h-11"
          />
          <Input
            type="number"
            placeholder="Prezzo (€)..."
            value={price || ''}
            onChange={e => setPrice(Number(e.target.value))}
            disabled={isCreating || isUploading}
            min="0"
            step="0.01"
            onKeyDown={handleKeyDown}
            className="h-11"
          />
        </div>

        {/* ✅ СТРОКА 2: Медиа (Загрузчик + Превью во всю ширину) */}
        <div className="space-y-4">
          {/* Загрузчик */}
          <div className="w-full">
            <ImageUpload
              imageUrl={imageUrl}
              onImageChange={setImageUrl}
              folder="ingredients"
              label="Immagine ingrediente"
              required
              isUploading={isUploading}
              setIsUploading={setIsUploading}
              classNameButton="w-full text-brand-primary border-brand-primary/50 hover:bg-brand-primary/5 hover:text-brand-primary"
            />
          </div>

          {/* Превью во всю ширину */}
          <div className="w-full">
            {imageUrl ? (
              <div className="relative flex items-center justify-center w-full h-48 border border-gray-200 bg-gray-50 rounded-lg overflow-hidden">
                <Image
                  src={imageUrl}
                  alt="Preview"
                  fill
                  className="object-contain p-4 drop-shadow-sm"
                />
                <Button
                  type="button"
                  onClick={() => setImageUrl('')}
                  size="icon"
                  variant="destructive"
                  className="absolute top-3 right-3 h-8 w-8 rounded-full shadow-md hover:scale-105 transition-transform"
                  disabled={isCreating || isUploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-200 bg-gray-50/50 rounded-lg text-gray-400">
                <ImageIcon className="h-10 w-10 mb-2 opacity-50 text-gray-400" />
                <span className="text-sm font-medium">Anteprima immagine</span>
              </div>
            )}
          </div>
        </div>

        {/* ✅ кнопка сохранения */}
        <Button
          onClick={handleSubmit}
          disabled={isCreating || !isFormValid || isUploading}
          className="w-full h-12 text-base mt-2"
        >
          <Plus className="w-5 h-5 mr-2" />
          Aggiungi Ingrediente
        </Button>
      </div>
    </div>
  );
};
