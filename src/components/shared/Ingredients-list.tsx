import { cn } from '@/lib/utils';
import React from 'react';
import { OptimizedIngredient } from '../../../@types/prisma';
import { Ingredient } from './ingredient';

interface Props {
  onClickAdd: (id: number) => void;
  ingredients: OptimizedIngredient[];
  selectedIds: Set<number>;
  className?: string;
}

export const IngredientsList: React.FC<Props> = ({
  ingredients,
  selectedIds,
  onClickAdd,
  className,
}) => {
  return (
    <div className={cn('grid grid-cols-3 gap-3 pb-4 scrollbar max-h-[350px] ', className)}>
      {ingredients.map(item => (
        <Ingredient
          onClick={() => onClickAdd(item.id)}
          key={item.id}
          name={item.name}
          imageUrl={item.imageUrl}
          price={Number(item.price)}
          active={selectedIds.has(item.id)}
          removable={item.removable ?? true}
        />
      ))}
    </div>
  );
};
