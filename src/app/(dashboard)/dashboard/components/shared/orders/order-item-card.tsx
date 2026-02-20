'use client';

import { Package } from 'lucide-react';
import Image from 'next/image';
import React from 'react';
import { OrderItem } from './order-types';

interface Props {
  item: OrderItem;
}

export const OrderItemCard: React.FC<Props> = ({ item }) => {
  const itemPrice = Number(item.productItem.price);
  const ingredientsPrice = item.ingredients.reduce((sum, ing) => sum + Number(ing.price), 0);
  const totalItemPrice = (itemPrice + ingredientsPrice) * item.quantity;

  return (
    <div className="bg-gray-50 rounded-lg p-3 border">
      <div className="flex gap-3">
        {/* Изображение продукта */}
        <div className="w-16 h-16 flex-shrink-0 rounded-md overflow-hidden bg-white border">
          {item.productItem.product.imageUrl ? (
            <Image
              src={item.productItem.product.imageUrl}
              alt={item.productItem.product.name}
              width={64}
              height={64}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <Package className="w-8 h-8" />
            </div>
          )}
        </div>

        {/* Информация о продукте */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h5 className="font-semibold text-sm">{item.productItem.product.name}</h5>
            <span className="font-bold text-sm flex-shrink-0">{totalItemPrice.toFixed(2)} €</span>
          </div>

          {/* Размер и тип теста */}
          <div className="text-xs text-gray-600 space-y-0.5">
            {item.productItem.size && (
              <div>
                <span className="font-medium">Dimensione:</span> {item.productItem.size.name} (
                {item.productItem.size.value} cm)
              </div>
            )}
            {item.productItem.doughType && (
              <div>
                <span className="font-medium">Impasto:</span> {item.productItem.doughType.name}
              </div>
            )}
            <div>
              <span className="font-medium">Quantità:</span> {item.quantity} x{' '}
              {itemPrice.toFixed(2)} €
            </div>
          </div>

          {/* Ингредиенты */}
          {item.ingredients.length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <div className="text-xs">
                <span className="font-medium text-gray-700">Ingredienti extra:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {item.ingredients.map(ing => (
                    <span
                      key={ing.id}
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-white border border-gray-200"
                    >
                      {ing.name} (+{Number(ing.price).toFixed(2)} €)
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
