import { OrderStats } from '@/@types/orders';
import { cn } from '@/lib/utils';
import React, { JSX } from 'react';
import { InfoOrderItem } from './info-order-item';
import { InfoOrderTopItem } from './info-order-top-item';

interface Props {
  className?: string;
  stats: OrderStats;
}

const IncassoColors = {
  bgColor: '#FCFEFE',
  topTextColor: '#007F00',
  bottomTextColor: '#424543',
};

const OrdiiTotaleColors = {
  bgColor: '#3F83D3',
  topTextColor: '#FFFFFF',
  bottomTextColor: '#FFFFFF',
};

const ScontrinoMedioColors = {
  bgColor: '#F8CD64',
  topTextColor: '#000000',
  bottomTextColor: '#000000',
};
const TopProdottoColors = {
  bgColor: '#E88142',
  topTextColor: 'F5FFFF',
  bottomTextColor: 'F5FFFF',
};

export const OrderInnfoSection: React.FC<Props> = ({ className, stats }): JSX.Element => {
  console.log('OrderInnfoSection status', stats);

  return (
    <div
      className={cn(' mt-5 mb-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4', className)}
    >
      {/* incasso - Общая выручка */}
      <InfoOrderItem
        bgColor={IncassoColors.bgColor}
        topTextColor={IncassoColors.topTextColor}
        topText={`${stats.totalRevenue.toFixed(2)}\u00A0€`}
        bottomTextColor={IncassoColors.bottomTextColor}
        bottomText="Totale incassa"
      />

      {/* ordii totale - Всего заказов */}
      <InfoOrderItem
        bgColor={OrdiiTotaleColors.bgColor}
        topTextColor={OrdiiTotaleColors.topTextColor}
        topText={stats.totalOrders.toString()}
        bottomTextColor={OrdiiTotaleColors.bottomTextColor}
        bottomText="Totale ordini"
      />

      {/* scontrino medio - Средний чек */}
      <InfoOrderItem
        bgColor={ScontrinoMedioColors.bgColor}
        topTextColor={ScontrinoMedioColors.topTextColor}
        topText={`${stats.averageCheck.toFixed(2)}\u00A0€`}
        bottomTextColor={ScontrinoMedioColors.bottomTextColor}
        bottomText="Scontrino medio"
      />

      {/* top prodotto - Топ продукт */}
      <InfoOrderTopItem
        imageUrl={stats.topProduct?.imageUrl || '/logo.png'}
        bgColor={TopProdottoColors.bgColor}
        topTextColor={TopProdottoColors.topTextColor}
        topText="Prodotto TOP:"
        bottomTextColor={TopProdottoColors.bottomTextColor}
        bottomText={stats.topProduct?.name || 'N/A'}
      />
    </div>
  );
};
