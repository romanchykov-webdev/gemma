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
            // Маппинг типов пиццы: 1 -> "Традиционное" / 2 -> "Тонкое"
            const mapPizzaTypes: Record<number, string> = {
              1: 'Tradizionale',
              2: 'Sottile',
            };

            // sizeName ожидается как string | null | undefined
            // item.pizzaSize может быть number (например 30) или string (например "500 ml") или null/undefined
            const sizeName =
              item.size === null || item.size === undefined
                ? undefined
                : typeof item.size === 'number'
                  ? `${item.size}` // если число — превращаем в строку
                  : item.size;

            // doughTypeName — строка из маппинга либо undefined
            const doughTypeName =
              item.type === null || item.type === undefined ? undefined : mapPizzaTypes[item.type];

            return (
              <CheckoutItemOrder
                key={item.id}
                name={item.name}
                loading={loading}
                price={item.price}
                imageUrl={item.imageUrl}
                details={getCartItemDetails(item.ingredients, sizeName, doughTypeName)}
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
