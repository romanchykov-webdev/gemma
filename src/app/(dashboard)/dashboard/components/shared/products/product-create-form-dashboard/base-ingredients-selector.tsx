'use client';

import { Button, Switch } from '@/components/ui';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { Ingredient } from '../product-types';

// 🔄 Тип для выбранного базового ингредиента
interface SelectedBaseIngredient {
  id: number;
  removable: boolean;
  isDisabled: boolean;
}

interface Props {
  availableIngredients: Ingredient[];
  selectedIngredients: SelectedBaseIngredient[];
  onAdd: (id: number) => void;
  onRemove: (id: number) => void;
  onToggleRemovable: (id: number) => void;
  showSelector: boolean;
  setShowSelector: (show: boolean) => void;
  isCreating: boolean;
}

export const BaseIngredientsSelector: React.FC<Props> = ({
  availableIngredients,
  selectedIngredients,
  onAdd,
  onRemove,
  onToggleRemovable,
  showSelector,
  setShowSelector,
  isCreating,
}) => {
  const selectedIds = selectedIngredients.map(ing => ing.id);

  return (
    <div className="border-t pt-3">
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">
          Ingredienti Base {selectedIngredients.length > 0 && `(${selectedIngredients.length})`}
        </span>
        {selectedIngredients.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowSelector(!showSelector)}
            disabled={isCreating}
          >
            {showSelector ? 'Nascondi selezione' : 'Aggiungi ingrediente'}
          </Button>
        )}
      </div>

      {/* Список выбранных базовых ингредиентов */}
      {selectedIngredients.length > 0 ? (
        <div className="flex flex-col gap-2 mb-3">
          {selectedIngredients.map(selected => {
            const ingredient = availableIngredients.find(ing => ing.id === selected.id);
            if (!ingredient) return null;

            return (
              <div
                key={selected.id}
                className="flex items-center gap-3 bg-blue-50 border border-blue-200 px-3 py-2 rounded-md"
              >
                {/* Изображение */}
                <img
                  src={ingredient.imageUrl}
                  alt={ingredient.name}
                  className="w-10 h-10 rounded object-cover"
                />

                {/* Название */}
                <span className="text-sm font-medium flex-1">{ingredient.name}</span>

                {/* Управление флагом removable */}
                <div className="flex items-center gap-2">
                  <Switch
                    id={`removable-${selected.id}`}
                    checked={selected.removable}
                    onCheckedChange={() => onToggleRemovable(selected.id)}
                    disabled={isCreating}
                    className="data-[state=checked]:bg-green-500"
                  />
                  <label
                    htmlFor={`removable-${selected.id}`}
                    className={cn(
                      'text-xs cursor-pointer hover:text-green-700 whitespace-nowrap transform transition-all duration-200',
                      selected.removable ? 'text-green-600' : 'text-gray-600',
                    )}
                  >
                    {`L'acquirente può rimuovere`}
                  </label>
                </div>

                {/* Кнопка удаления */}
                <button
                  type="button"
                  onClick={() => onRemove(selected.id)}
                  disabled={isCreating}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mb-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowSelector(true)}
            disabled={isCreating}
            className="w-full"
          >
            + Aggiungi ingrediente base
          </Button>
        </div>
      )}

      {/* Селектор для добавления ингредиентов */}
      {showSelector && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-60 overflow-y-auto border rounded-lg p-3 bg-gray-50 mb-3">
          {availableIngredients.map(ingredient => {
            const isSelected = selectedIds.includes(ingredient.id);
            return (
              <label
                key={ingredient.id}
                className={`flex items-center gap-2 p-2 rounded cursor-pointer transition ${
                  isSelected
                    ? 'bg-blue-100 border border-blue-300'
                    : 'hover:bg-white border border-transparent'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => (isSelected ? onRemove(ingredient.id) : onAdd(ingredient.id))}
                  disabled={isCreating}
                  className="rounded"
                />
                <img
                  src={ingredient.imageUrl}
                  alt={ingredient.name}
                  className="w-6 h-6 rounded object-cover"
                />
                <span className="text-sm flex-1">{ingredient.name}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
};
