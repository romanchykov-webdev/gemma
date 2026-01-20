'use client';

import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import React, { useState } from 'react';
import { CreateStoryData } from './stories-types';

interface Props {
  isCreating: boolean;
  onSubmit: (data: CreateStoryData) => Promise<void>;
}

export const StoryCreateForm: React.FC<Props> = ({ isCreating, onSubmit }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState('');
  const [items, setItems] = useState<{ sourceUrl: string }[]>([{ sourceUrl: '' }]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data: CreateStoryData = {
      previewImageUrl: previewImageUrl.trim(),
      items: items
        .map(item => ({ sourceUrl: item.sourceUrl.trim() }))
        .filter(item => item.sourceUrl !== ''),
    };

    await onSubmit(data);

    // Сброс формы
    setPreviewImageUrl('');
    setItems([{ sourceUrl: '' }]);
    setIsOpen(false);
  };

  const addItem = () => {
    setItems([...items, { sourceUrl: '' }]);
  };

  const removeItem = (index: number) => {
    // console.log(index);

    if (items.length >= 0) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, sourceUrl: string) => {
    const newItems = [...items];
    newItems[index] = { sourceUrl };
    setItems(newItems);
  };

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} className="w-full">
        + Aggiungi Nuova Storia
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
      <h3 className="text-lg font-semibold">Nuova Storia</h3>

      {/* Preview Image URL */}
      <div className="flex flex-col gap-2 md:flex-row">
        <div className="flex flex-col gap-2 flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            URL Immagine di Anteprima <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="url"
              value={previewImageUrl}
              onChange={e => setPreviewImageUrl(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="https://example.com/preview.jpg"
              required
              disabled={isCreating}
            />
            <Button
              type="button"
              onClick={() => setPreviewImageUrl('')}
              size="sm"
              variant="outline"
              // disabled={items.length === 1 || isCreating}
            >
              <X className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </div>
        {previewImageUrl && (
          <div className="mt-3 flex items-center justify-center">
            <img
              src={previewImageUrl}
              alt="Preview"
              className=" h-40 object-cover rounded border"
              onError={e => {
                e.currentTarget.src = '/assets/images/not-found.png';
              }}
            />
          </div>
        )}
      </div>

      {/* Story Items */}
      <div>
        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
          <label className="block text-sm font-medium text-gray-700">
            Elementi della Storia <span className="text-red-500">*</span>
          </label>
          <Button type="button" onClick={addItem} size="sm" variant="outline" disabled={isCreating}>
            <Plus className="h-4 w-4 mr-1" />
            Aggiungi Elemento
          </Button>
        </div>

        <div className="">
          {items.map((item, index) => (
            <div
              key={index}
              className="flex flex-col md:flex-row items-center gap-2 p-3 border rounded bg-gray-50 "
            >
              {/* link to media */}
              <div className="flex flex-1 w-full flex-col md:flex-row items-center gap-2 ">
                <span className="text-sm  font-medium text-gray-500 min-w-[30px]">
                  {index + 1}.
                </span>
                <div className="flex flex-1 w-full items-center gap-2">
                  <input
                    type="url"
                    value={item.sourceUrl}
                    onChange={e => updateItem(index, e.target.value)}
                    className="flex-1 w-full border rounded px-3 py-2 text-sm bg-white"
                    placeholder="https://example.com/media.jpg o .mp4"
                    required
                    disabled={isCreating}
                  />
                  <Button
                    type="button"
                    onClick={() => removeItem(index)}
                    size="sm"
                    variant="outline"
                    // disabled={items.length === 1 || isCreating}
                  >
                    <X className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
              {/* image */}
              {items[index].sourceUrl && (
                <div className="flex   ">
                  <img
                    src={items[index].sourceUrl}
                    alt="Preview"
                    className=" h-40 object-cover rounded border"
                    onError={e => {
                      e.currentTarget.src = '/assets/images/not-found.png';
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-500 mt-2">
          💡 Supportati: immagini (.jpg, .png, .gif, .webp)
        </p>
      </div>

      {/* Кнопки */}
      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={isCreating} className="flex-1">
          {isCreating ? 'Creazione...' : 'Crea Storia'}
        </Button>
        <Button
          type="button"
          onClick={() => setIsOpen(false)}
          variant="outline"
          disabled={isCreating}
        >
          Annulla
        </Button>
      </div>
    </form>
  );
};
