'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Switch,
} from '@/components/ui';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import Image from 'next/image';
import React from 'react';
import { Ingredient } from '../product-types';

interface CommonProps {
  title: string;
  description?: string;
  availableIngredients: Ingredient[];
  isCreating?: boolean;
}

interface AddableModeProps {
  mode: 'addable';
  selectedIngredientIds: number[];
  onToggle: (id: number) => void;
}

interface BaseModeProps {
  mode: 'base';
  selectedIngredients: Array<{ id: number; removable: boolean; isDisabled: boolean }>;
  onToggleIngredient: (id: number) => void;
  onToggleRemovable: (id: number) => void;
}

type UniversalIngredientsSelectorProps = CommonProps & (AddableModeProps | BaseModeProps);

export const UniversalIngredientsSelector: React.FC<UniversalIngredientsSelectorProps> = props => {
  const { availableIngredients, mode, title, description, isCreating = false } = props;

  // Вычисляем количество выбранных для отображения в заголовке
  const selectedCount =
    mode === 'addable' ? props.selectedIngredientIds.length : props.selectedIngredients.length;

  return (
    // 👈 Оборачиваем в Accordion от shadcn
    <Accordion type="single" collapsible className="w-full border-t pt-2 mt-4">
      <AccordionItem value={mode} className="border-none">
        {/* Кнопка раскрытия (Trigger) */}
        <AccordionTrigger className="hover:no-underline py-2">
          <div className="flex flex-col items-start text-left">
            <h4 className="text-sm font-semibold text-gray-800">
              {title}{' '}
              {selectedCount > 0 && <span className="text-blue-600">({selectedCount})</span>}
            </h4>
            {description && (
              <p className="text-xs text-gray-500 mt-0.5 font-normal leading-snug">{description}</p>
            )}
          </div>
        </AccordionTrigger>

        {/* Содержимое (наш грид) */}
        <AccordionContent className="pt-4 pb-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 items-start">
            {availableIngredients.map(ingredient => {
              let isSelected = false;
              let selectedBaseItem = null;

              if (mode === 'addable') {
                isSelected = props.selectedIngredientIds.includes(ingredient.id);
              } else {
                selectedBaseItem = props.selectedIngredients.find(i => i.id === ingredient.id);
                isSelected = !!selectedBaseItem;
              }

              const handleCardClick = () => {
                if (isCreating) return;
                if (mode === 'addable') {
                  props.onToggle(ingredient.id);
                } else {
                  props.onToggleIngredient(ingredient.id);
                }
              };

              return (
                <div
                  key={ingredient.id}
                  onClick={handleCardClick}
                  className={cn(
                    'relative flex flex-col p-3 rounded-lg border cursor-pointer transition-all duration-200 h-full',
                    isSelected
                      ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                      : 'border-gray-200 bg-white hover:border-blue-300',
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors',
                        isSelected
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-gray-300 bg-white',
                      )}
                    >
                      {isSelected && <Check className="h-3 w-3" strokeWidth={3} />}
                    </div>

                    <div className="h-10 w-10 shrink-0 flex items-center justify-center">
                      {ingredient.imageUrl ? (
                        <Image
                          src={ingredient.imageUrl}
                          alt={ingredient.name}
                          width={40}
                          height={40}
                          className="max-h-full max-w-full object-contain drop-shadow-sm"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
                      )}
                    </div>

                    <span className="text-sm font-medium leading-tight text-gray-700">
                      {ingredient.name}
                    </span>
                  </div>

                  {mode === 'base' && isSelected && selectedBaseItem && (
                    <div
                      onClick={e => e.stopPropagation()}
                      className="mt-3 pt-2 border-t border-blue-200 animate-in fade-in slide-in-from-top-2 duration-300 ease-out"
                    >
                      <div className="flex items-center gap-2">
                        <Switch
                          id={`removable-${ingredient.id}`}
                          checked={selectedBaseItem.removable}
                          onCheckedChange={() => props.onToggleRemovable(ingredient.id)}
                          disabled={isCreating}
                          className="data-[state=checked]:bg-green-500"
                        />
                        <label
                          htmlFor={`removable-${ingredient.id}`}
                          className={cn(
                            'text-xs cursor-pointer hover:text-green-700 whitespace-nowrap transition-colors duration-200',
                            selectedBaseItem.removable ? 'text-green-600' : 'text-gray-600',
                          )}
                        >
                          {`L'acquirente può rimuovere`}
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
