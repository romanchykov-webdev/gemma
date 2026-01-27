import { getCartItemDetails } from '@/lib';
import { CartStateItem } from '@/lib/get-cart-details';
import { cn } from '@/lib/utils';
import React, { JSX } from 'react';
import { CheckoutItemOrder } from '../checkout-item-order';
import { CheckoutItemSkeleton } from '../skeletons/checkout-item-skeleton';
import { WhiteBlock } from '../white-block';

interface ICheckoutCartProps {
  items: CartStateItem[];
  loading: boolean;
  removeCartItem: (id: string) => void; // UUID
  changeItemCount: (id: string, quantity: number, type: 'plus' | 'minus') => void; // UUID
  className?: string;
}

export const CheckoutCart: React.FC<ICheckoutCartProps> = ({
  items,
  loading,
  removeCartItem,
  changeItemCount,
  className,
}): JSX.Element => {
  return (
    <WhiteBlock
      title="1. Carrello"
      contentClassName={cn('flex flex-col gap-5')}
      className={className}
    >
      {items.length > 0
        ? items.map(item => {
            // ✅ Используем готовые данные из CartStateItem

            return (
              <CheckoutItemOrder
                key={item.id}
                name={item.name}
                loading={loading}
                price={item.price}
                imageUrl={item.imageUrl}
                details={getCartItemDetails(
                  item.ingredients,
                  item.sizeName,
                  item.typeName,
                  item.removedIngredients,
                )}
                quantity={item.quantity}
                id={item.id}
                onClickCountButton={type => changeItemCount(item.id, item.quantity, type)}
                onClickRemove={() => removeCartItem(item.id)}
              />
            );
          })
        : [...Array(3)].map((_, index) => <CheckoutItemSkeleton key={index} />)}
    </WhiteBlock>
  );
};
