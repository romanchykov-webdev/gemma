'use client';

import { Button } from '@/components/ui';
import React from 'react';

interface Props {
  categories: { id: number; name: string }[];
  selectedCategoryId: number | null;
  onCategoryChange: (categoryId: number | null) => void;
}

export const ProductCategoryFilter: React.FC<Props> = ({
  categories,
  selectedCategoryId,
  onCategoryChange,
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={selectedCategoryId === null ? 'default' : 'outline'}
        onClick={() => onCategoryChange(null)}
      >
        Tutti i prodotti
      </Button>
      {categories.map(category => (
        <Button
          key={category.id}
          variant={selectedCategoryId === category.id ? 'default' : 'outline'}
          onClick={() => onCategoryChange(category.id)}
        >
          {category.name}
        </Button>
      ))}
    </div>
  );
};
