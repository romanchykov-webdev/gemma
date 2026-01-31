import { cn } from '@/lib/utils';
import { ArrowRightIcon, PackageIcon, PercentIcon, TruckIcon } from 'lucide-react';
import React, { JSX } from 'react';
import { Button } from '../ui';
import { CheckoutItemDetails } from './checkout-item-details';
import { WhiteBlock } from './white-block';

interface ICheckoutSidebarProps {
  totalAmount: number;
  loading: boolean;
  syncing?: boolean; // ✅ Флаг синхронизации с сервером
  deliveryType?: 'delivery' | 'pickup';
  className?: string;
  onSubmitCash: () => void;
}

export const CheckoutSidebar: React.FC<ICheckoutSidebarProps> = ({
  totalAmount,
  loading,
  syncing = false,
  deliveryType = 'delivery',
  className,
  onSubmitCash,
}): JSX.Element => {
  const TASSO = 0;
  const DELIVERY_PRICE = 0;
  const allTotalPrice = (totalAmount + (totalAmount * TASSO) / 100 + DELIVERY_PRICE).toFixed(2);

  // console.log('🔄 deliveryType:', deliveryType);

  return (
    <WhiteBlock className={cn('p-4 sticky top-4 ', className)}>
      {/* totle price block */}

      <CheckoutItemDetails
        loading={loading}
        title="Totale"
        value={allTotalPrice}
        priceClassName="text-[34px]"
      />

      {/* delivery price block */}
      <CheckoutItemDetails
        loading={loading}
        title="Costo"
        value={totalAmount.toFixed(2)}
        icon={PackageIcon}
      />
      <CheckoutItemDetails
        loading={loading}
        title="Imposte"
        value={((totalAmount * TASSO) / 100).toFixed(2)}
        icon={PercentIcon}
      />
      <CheckoutItemDetails
        loading={loading}
        title="Consegna"
        value={DELIVERY_PRICE.toFixed(2)}
        icon={TruckIcon}
      />

      {/* <span className="text-xl cursor-pointer">У вас есть промокод?</span> */}

      {/* upload block */}
      <div className="flex flex-col gap-2">
        {/* <Button
          loading={loading || syncing}
          disabled={syncing}
          type="submit"
          className="w-full h-14 rounded-2xl mt-6 text-base font-bold"
        >
          Vai al pagamento
          <ArrowRightIcon className="w-5 ml-2" />
        </Button> */}

        {/* order without payment */}
        <Button
          loading={loading || syncing}
          disabled={syncing}
          type="button"
          onClick={onSubmitCash}
          className="w-full h-14 rounded-2xl mt-6 text-base font-bold"
        >
          {
            deliveryType === 'pickup'
              ? 'Pagamento al ritiro' // ← Текст для самовывоза
              : 'Pagamento alla consegna' // ← Текст для доставки
          }
          <ArrowRightIcon className="w-5 ml-2" />
        </Button>
      </div>
    </WhiteBlock>
  );
};
// Pagamento al ritiro
