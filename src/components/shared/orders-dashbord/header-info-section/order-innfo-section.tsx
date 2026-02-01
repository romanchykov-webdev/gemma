import { cn } from '@/lib/utils';
import React, { JSX } from 'react';
import { InfoOrderItem } from './info-order-item';
import { InfoOrderTopItem } from './info-order-top-item';

interface Props {
  className?: string;
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

const totaleInncassa = '12,783,28';
const totaleOrdini = '84';
const scontrinnoMedio = '12,14';
const prodottoTop = 'Margarita';

export const OrderInnfoSection: React.FC<Props> = ({ className }): JSX.Element => {
  return (
    <div
      className={cn(' mt-5 mb-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4', className)}
    >
      {/* incasso */}
      <InfoOrderItem
        bgColor={IncassoColors.bgColor}
        topTextColor={IncassoColors.topTextColor}
        topText={`${totaleInncassa}\u00A0€`}
        bottomTextColor={IncassoColors.bottomTextColor}
        bottomText="Totale incassa"
      />

      {/* ordii totale */}
      <InfoOrderItem
        bgColor={OrdiiTotaleColors.bgColor}
        topTextColor={OrdiiTotaleColors.topTextColor}
        topText={totaleOrdini}
        bottomTextColor={OrdiiTotaleColors.bottomTextColor}
        bottomText="Totale ordini"
      />

      {/* scontrino medio */}
      <InfoOrderItem
        bgColor={ScontrinoMedioColors.bgColor}
        topTextColor={ScontrinoMedioColors.topTextColor}
        topText={`${scontrinnoMedio}\u00A0€`}
        bottomTextColor={ScontrinoMedioColors.bottomTextColor}
        bottomText="Scontrino medio"
      />

      {/* top prodotto */}
      <InfoOrderTopItem
        imageUrl="/logo.png"
        bgColor={TopProdottoColors.bgColor}
        topTextColor={TopProdottoColors.topTextColor}
        topText="Prodotto TOP:"
        bottomTextColor={TopProdottoColors.bottomTextColor}
        bottomText={prodottoTop}
      />
    </div>
  );
};
