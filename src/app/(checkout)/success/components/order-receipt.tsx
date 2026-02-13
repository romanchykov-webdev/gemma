'use client';

import { PickupLocationCard } from '@/components/shared/pickup-location-card';
import { calculateOrderItemPrice, formatItemDetails } from '@/lib/order-calc';
import { motion } from 'framer-motion';
import { ReceiptEuro } from 'lucide-react';
import { OrderStatusData } from './order-status-data';

export const OrderReceipt = ({ data }: { data?: OrderStatusData }) => {
  // 1. Самая первая защита: если data вообще нет — ничего не рендерим
  if (!data) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-white relative p-6 rounded-t-2xl shadow-sm border border-neutral-100 w-full max-w-sm mx-auto mt-8"
    >
      {/* Зубчики чека */}
      <div
        className="absolute bottom-0 left-0 w-full h-4 bg-white translate-y-1/2"
        style={{
          maskImage: 'radial-gradient(circle, transparent 50%, black 50%)',
          maskSize: '20px 20px',
          maskRepeat: 'repeat-x',
        }}
      />

      {/* Шапка */}
      <div className="flex items-center justify-between pb-4 border-b border-dashed border-neutral-200">
        <div className="flex items-center gap-2 text-neutral-500">
          <ReceiptEuro className="w-4 h-4" />
          <span className="text-sm font-medium">Scontrino digitale</span>
        </div>
        <span className="text-xs bg-neutral-100 px-2 py-1 rounded text-neutral-600 font-mono">
          {/* 🛡️ ИСПРАВЛЕНИЕ 1: Безопасное получение ID */}
          {data.orderId ? `#${data.orderId.split('-')[0].toUpperCase()}` : '#???'}
        </span>
      </div>

      {/* Список товаров */}
      <div className="">
        {/* 🛡️ Защита массива: (items || []) */}
        {(data.items || []).filter(Boolean).map((item, index) => {
          const totalItemPrice = calculateOrderItemPrice(item);
          const details = formatItemDetails(item);

          return (
            <div
              key={index}
              className="grid grid-cols-12 text-sm border-b border-dashed border-neutral-200 py-4"
            >
              <div className="col-span-5 flex flex-col items-start">
                <span className="font-bold text-neutral-900 leading-tight mb-1 text-left">
                  {item.quantity}x {item.name}
                </span>
                {details && (
                  <span className="text-[10px] text-neutral-400 leading-tight text-left">
                    {details}
                  </span>
                )}
              </div>

              <div className="col-span-4 flex flex-col text-[10px] leading-tight pt-0.5">
                {item.ingredients && item.ingredients.length > 0 && (
                  <div className="text-green-700 mb-1 text-left">
                    +{item.ingredients.map(ing => ` ${ing.name}`).join(', ')}
                  </div>
                )}
                {item.removedIngredients && item.removedIngredients.length > 0 && (
                  <div className="text-red-500/80 text-left">
                    -{item.removedIngredients.map(ing => `${ing.name}`).join(', ')}
                  </div>
                )}
              </div>

              <div className="col-span-3 text-right font-bold text-neutral-900">
                <div className="flex items-center justify-end h-full">
                  {totalItemPrice.toFixed(2)} €
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Итоговая информация */}
      <div className="">
        <div className="flex justify-between text-sm py-4 border-b border-dashed border-neutral-200">
          <span className="text-neutral-600">Cliente</span>
          <span className="font-semibold text-neutral-900 text-right">
            {data.fullName || 'Cliente'}
          </span>
        </div>

        <div className="flex justify-between text-sm py-4 border-b border-dashed border-neutral-200">
          <span className="text-neutral-600">Metodo</span>
          <span className="text-neutral-900 text-right">
            {data.deliveryType === 'pickup' ? 'Asporto (Ritiro)' : 'Consegna a domicilio'}
          </span>
        </div>

        <div className="flex justify-between items-center py-4 border-b border-dashed border-neutral-200">
          <span className="text-gray-500">Pizzeria</span>
          <a
            href={`tel:${data.storeInfo?.phone || '+39 345 357 5021'}`}
            className="font-medium text-primary hover:underline"
          >
            {data.storeInfo?.phone || '+39 345 357 5021'}
          </a>
        </div>

        <div className="flex flex-col py-4">
          <span className="text-gray-500 text-left">
            {data.deliveryType === 'delivery' ? 'Indirizzo' : ''}
          </span>
          <span className="font-medium text-left">
            {data.deliveryType === 'delivery' ? (
              data.address || 'Indirizzo non disponibile'
            ) : (
              // Передаем storeInfo безопасно
              <PickupLocationCard storeInfo={data.storeInfo} />
            )}
          </span>
        </div>

        <div className="flex justify-between items-end pt-2 border-t border-dashed border-neutral-200">
          <span className="font-bold text-neutral-900 text-lg">Totale</span>
          {/* 🛡️ ИСПРАВЛЕНИЕ 2: Защита от undefined суммы */}
          <span className="font-bold text-primary text-xl">
            {(data.totalAmount || 0).toFixed(2)} €
          </span>
        </div>
      </div>
    </motion.div>
  );
};
