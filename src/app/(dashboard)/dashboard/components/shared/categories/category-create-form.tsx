'use client';

import { Button, Input } from '@/components/ui';
import { Plus } from 'lucide-react';
import React, { useState } from 'react';
import { CreateCategoryData } from './category-types';

interface Props {
  onSubmit: (data: CreateCategoryData) => Promise<boolean>;
  isCreating?: boolean;
}

export const CategoryCreateForm: React.FC<Props> = ({ onSubmit, isCreating = false }) => {
  const [name, setName] = useState('');

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    const success = await onSubmit({ name: trimmedName });

    // ✅ Очищаем инпут ТОЛЬКО если категория успешно создана
    if (success) {
      setName('');
    }
  };

  const isFormValid = name.trim().length > 0;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && isFormValid && !isCreating) {
      void handleSubmit();
    }
  };

  return (
    <div className="flex gap-2 items-center">
      <Input
        placeholder="Nome nuova categoria..."
        value={name}
        onChange={e => setName(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isCreating}
        className="flex-1"
      />

      <Button onClick={handleSubmit} disabled={isCreating || !isFormValid} className="h-10">
        <Plus className="w-4 h-4 mr-2" />
        Aggiungi
      </Button>
    </div>
  );
};
