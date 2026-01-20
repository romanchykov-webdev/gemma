'use client';

import { cn } from '@/lib/utils';
import React, { useState } from 'react';
import { OptimizedIngredient, OptimizedProductItem } from '../../../@types/prisma';
import { Button } from '../ui/button';
import { GroupVariants, Variant } from './group-variants';
import { Title } from './title';

interface Props {
  imageUrl: string;
  name: string;
  loading: boolean;
  items: OptimizedProductItem[];
  ingredients: OptimizedIngredient[];
  sizes?: Array<{ id: number; name: string; value: number }>;
  onSubmit?: (productItemId: number, totalPrice: number) => void;
  className?: string;
}

/**
 * Форма выбора продукта (не пицца)
 */

export const ChooseProductForm: React.FC<Props> = ({
  name,
  imageUrl,
  onSubmit,
  className,
  loading,
  items,
  ingredients,
  sizes,
}) => {
  // 🔥 Состояние для выбранного варианта
  const [selectedVariantId, setSelectedVariantId] = useState<number>(items[0]?.id);

  // console.log("ChooseProductForm sizes:", sizes);
  // console.log("ChooseProductForm items:", items);

  // 🔥 Создаем варианты для отображения (с проверкой sizes)
  const variants: Variant[] = items.map(item => {
    const size = sizes?.find(s => s.id === item.sizeId);
    return {
      name: size ? size.name : `Variante ${item.id}`,
      value: String(item.id),
      disabled: false,
    };
  });

  // 🔥 Текущий выбранный вариант
  const selectedVariant = items.find(item => item.id === selectedVariantId);
  const currentPrice = selectedVariant
    ? Number(selectedVariant.price)
    : Number(items[0]?.price || 0);

  // 🔥 Обработчик выбора варианта
  const handleVariantClick = (value: string) => {
    setSelectedVariantId(Number(value));
  };

  // 🔥 Обработчик добавления в корзину
  const handleSubmit = () => {
    if (selectedVariantId) {
      onSubmit?.(selectedVariantId, currentPrice);
    }
  };

  return (
    <div
      className={cn(
        className,
        'flex flex-col justify-between lg:flex-row flex-1 max-h-[90vh] overflow-auto ',
      )}
    >
      {/* Левая часть  */}
      <div className="w-full lg:w-[60%] h-auto min-h-[250px] sm:min-h-[300px] md:min-h-[400px] p-4 sm:p-6 flex flex-1 justify-center items-center">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-auto max-h-[250px] sm:max-h-[300px] md:max-h-[400px] object-contain"
        />
      </div>

      {/* Правая часть - нижняя часть */}
      <div className="bg-surface-off-white p-4 lg:p-7 w-full lg:w-[40%] flex flex-col justify-between">
        <div>
          <Title text={name} size="md" className="font-extrabold mb-1 text-center lg:text-left" />

          {/* 🔥 НОВОЕ: Варианты размеров (если их больше 1) */}
          {items.length > 1 && variants.length > 0 && sizes && sizes.length > 0 && (
            <div className="mt-5">
              <p className="text-sm text-gray-600 mb-2 font-medium">Seleziona il formato:</p>
              <GroupVariants
                items={variants}
                selectedValue={String(selectedVariantId)}
                onClick={handleVariantClick}
              />
            </div>
          )}

          {/* 🔥 Показать ингредиенты если есть */}
          {ingredients.length > 0 && (
            <div className="mt-5">
              <p className="text-sm text-gray-600 mb-2 font-medium">Contiene:</p>
              <div className="flex flex-wrap gap-2">
                {ingredients.map(ing => (
                  <span
                    key={ing.id}
                    className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full"
                  >
                    {ing.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <Button
          onClick={handleSubmit}
          loading={loading}
          className="h-[55px] px-10 text-base rounded-[18px] w-full mt-5"
        >
          Aggiungi al carrello per {currentPrice.toFixed(2)} €
        </Button>
      </div>
    </div>
  );
};
