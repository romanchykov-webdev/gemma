import { cn } from '@/lib/utils';
import { Ingredient as IIngredient } from '@prisma/client';
import React from 'react';
import { Ingredient } from './ingredient';

interface Props {
  onClickAdd: (id: number) => void;
  ingredients: IIngredient[];
  // ingredients: any[];
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
    <div className={cn('grid grid-cols-3 gap-3 scrollbar max-h-[350px] ', className)}>
      {ingredients.map(item => (
        <Ingredient
          onClick={() => onClickAdd(item.id)}
          key={item.id}
          name={item.name}
          imageUrl={item.imageUrl}
          price={item.price}
          active={selectedIds.has(item.id)}
        />
      ))}
    </div>
  );
};
