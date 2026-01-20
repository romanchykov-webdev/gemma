'use client';

import { useCartStore } from '@/store';
import React, { JSX, useState } from 'react';
import toast from 'react-hot-toast';
import { BaseIngredient, ProductWithRelations } from '../../../@types/prisma';
import { ChoosePizzaForm } from './choose-pizza-form';

interface IProductFormClientProps {
  product: ProductWithRelations;
  sizes?: Array<{ id: number; name: string; value: number }>;
  doughTypes?: Array<{ id: number; name: string; value: number }>;
  handleClose?: () => void;
}

export const ProductFormClient: React.FC<IProductFormClientProps> = ({
  product,
  // sizes,
  // doughTypes,
  // handleClose,
}): JSX.Element => {
  const addCartItem = useCartStore(state => state.addCartItem);

  const [submitting, setSubmitting] = useState(false);

  const firstItem = product.items[0];

  // 🔥 ИЗМЕНЕНО - Обработчик для пиццы (с ингредиентами)
  const onSubmitPizza = async (
    variantId: number,
    ingredients: number[],
    baseIngredientsSnapshot: BaseIngredient[],
    totalPrice?: number,
    size?: number | null,
    type?: number | null,
    ingredientsData?: Array<{ id: number; name: string; price: number }>,
  ) => {
    try {
      setSubmitting(true);

      addCartItem({
        productId: product.id,
        variantId: variantId,
        ingredients,
        baseIngredientsSnapshot,
        optimistic: {
          name: product.name,
          imageUrl: product.imageUrl,
          price: totalPrice ?? firstItem.price,
          size,
          type,
          ingredientsData,
        },
      });

      toast.success(product.name + ' aggiunto al carrello');
      // handleClose();
    } catch (error) {
      toast.error("Si è verificato un errore durante l'aggiunta al carrello");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  // 🔥 Форма выбора пиццы
  return (
    <ChoosePizzaForm
      imageUrl={product.imageUrl}
      name={product.name}
      onSubmit={onSubmitPizza}
      loading={submitting}
      ingredients={product.ingredients}
      baseIngredients={product.baseIngredients ?? []}
      items={product.items ?? []}
    />
  );
};
