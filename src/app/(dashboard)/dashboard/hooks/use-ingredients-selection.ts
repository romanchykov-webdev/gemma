import { useMemo, useState } from 'react';
import { Ingredient } from '../components/shared/ingredients/ingredient-types';

export type SelectedBaseIngredient = {
  id: number;
  removable: boolean;
  isDisabled: boolean;
};

export type EnrichedBaseIngredient = {
  id: number;
  name: string;
  imageUrl: string;
  removable: boolean;
  isDisabled: boolean;
};

interface UseIngredientsSelectionOptions {
  availableIngredients: Ingredient[];
  initialBaseIngredients?: SelectedBaseIngredient[];
  initialAddableIngredientIds?: number[];
}

export const useIngredientsSelection = ({
  availableIngredients,
  initialBaseIngredients = [],
  initialAddableIngredientIds = [],
}: UseIngredientsSelectionOptions) => {
  const [baseIngredients, setBaseIngredients] =
    useState<SelectedBaseIngredient[]>(initialBaseIngredients);
  const [addableIngredientIds, setAddableIngredientIds] = useState<number[]>(
    initialAddableIngredientIds,
  );

  const toggleBaseIngredient = (id: number) => {
    setBaseIngredients(prev => {
      const exists = prev.some(ing => ing.id === id);
      if (exists) return prev.filter(ing => ing.id !== id);
      return [...prev, { id, removable: true, isDisabled: false }];
    });
  };

  const toggleRemovable = (id: number) => {
    setBaseIngredients(prev =>
      prev.map(ing => (ing.id === id ? { ...ing, removable: !ing.removable } : ing)),
    );
  };

  const toggleAddableIngredient = (id: number) => {
    setAddableIngredientIds(prev =>
      prev.includes(id) ? prev.filter(ingId => ingId !== id) : [...prev, id],
    );
  };

  const resetIngredients = () => {
    setBaseIngredients([]);
    setAddableIngredientIds([]);
  };

  // Обогащаем базовые ингредиенты полными данными из справочника (имя, картинка)
  const enrichedBaseIngredients = useMemo<EnrichedBaseIngredient[]>(() => {
    return baseIngredients
      .map(selected => {
        const ing = availableIngredients.find(i => i.id === selected.id);
        if (!ing) return null;
        return {
          id: ing.id,
          name: ing.name,
          imageUrl: ing.imageUrl,
          removable: selected.removable,
          isDisabled: selected.isDisabled,
        };
      })
      .filter((ing): ing is NonNullable<typeof ing> => ing !== null);
  }, [baseIngredients, availableIngredients]);

  return {
    baseIngredients,
    addableIngredientIds,
    toggleBaseIngredient,
    toggleRemovable,
    toggleAddableIngredient,
    resetIngredients,
    enrichedBaseIngredients,
  };
};
