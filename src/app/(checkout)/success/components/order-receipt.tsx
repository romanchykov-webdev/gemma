'use client';

import { motion } from 'framer-motion';
import { Receipt } from 'lucide-react';
import { OrderStatusData } from './order-status-data';

export const OrderReceipt = ({ data }: { data: OrderStatusData }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.4 }}
    className="bg-white relative p-6 rounded-t-2xl shadow-sm border border-neutral-100 w-full max-w-sm mx-auto mt-8"
  >
    {/* Зубчики чека снизу */}
    <div
      className="absolute bottom-0 left-0 w-full h-4 bg-white translate-y-1/2"
      style={{
        maskImage: 'radial-gradient(circle, transparent 50%, black 50%)',
        maskSize: '20px 20px',
        maskRepeat: 'repeat-x',
      }}
    />

    {/* Шапка */}
    <div className="flex items-center justify-between mb-4 pb-4 border-b border-dashed border-neutral-200">
      <div className="flex items-center gap-2 text-neutral-500">
        <Receipt className="w-4 h-4" />
        <span className="text-sm font-medium">Scontrino digitale</span>
      </div>
      <span className="text-xs bg-neutral-100 px-2 py-1 rounded text-neutral-600 font-mono">
        #{data.orderId.split('-')[0].toUpperCase()}
      </span>
    </div>

    {/* 🛒 СПИСОК ТОВАРОВ (GRID LAYOUT) */}
    <div className="mb-4 pb-4  space-y-4">
      {data.items?.map((item, index) => {
        // Считаем цену
        const ingredientsPrice = item.ingredients?.reduce((acc, ing) => acc + ing.price, 0) || 0;
        const oneItemPrice = item.price + ingredientsPrice;
        const totalItemPrice = oneItemPrice * item.quantity;

        // Детали (Размер, Тесто)
        const details = [item.sizeName, item.typeName].filter(Boolean).join(' • ');

        return (
          <div
            key={index}
            className="grid grid-cols-12 gap-2 text-sm border-b border-dashed border-neutral-200 "
          >
            {/* КОЛОНКА 1: Название и Тип (5/12 ширины) */}
            <div className="col-span-5 flex flex-col  items-start">
              <span className="font-bold text-neutral-900 leading-tight mb-1">
                {item.quantity}x {item.name}
              </span>
              {details && (
                <span className="text-[10px] text-neutral-400 leading-tight">{details}</span>
              )}
            </div>

            {/* КОЛОНКА 2: Ингредиенты (4/12 ширины) */}
            <div className="col-span-4 flex flex-col text-[10px] leading-tight pt-0.5 ">
              {/* Добавки (Зеленым) */}
              {item.ingredients && item.ingredients.length > 0 && (
                <div className="text-green-700 mb-1  text-left">
                  +{item.ingredients.map(ing => ` ${ing.name}`).join(', ')}
                </div>
              )}
              {/* Убрано (Красным) */}
              {item.removedIngredients && item.removedIngredients.length > 0 && (
                <div className="text-red-500/80 text-left">
                  -{item.removedIngredients.map(ing => `${ing.name}`).join(', ')}
                </div>
              )}
            </div>

            {/* КОЛОНКА 3: Цена (3/12 ширины) */}
            <div className="col-span-3 text-right font-bold text-neutral-900  ">
              <div className="flex items-center justify-end h-full">
                {totalItemPrice.toFixed(2)} €
              </div>
            </div>
          </div>
        );
      })}
    </div>

    {/* Итоговая информация */}
    <div className="space-y-3">
      <div className="flex justify-between text-sm">
        <span className="text-neutral-600">Cliente</span>
        <span className="font-semibold text-neutral-900 text-right">{data.fullName}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-neutral-600">Metodo</span>
        <span className="text-neutral-900 text-right">
          {data.deliveryType === 'pickup' ? 'Asporto (Ritiro)' : 'Consegna a domicilio'}
        </span>
      </div>

      {/* Жирный итог */}
      <div className="flex justify-between items-end mt-2 pt-2 border-t border-dashed border-neutral-200">
        <span className="font-bold text-neutral-900 text-lg">Totale</span>
        <span className="font-bold text-primary text-xl">{data.totalAmount.toFixed(2)} €</span>
      </div>
    </div>
  </motion.div>
);
