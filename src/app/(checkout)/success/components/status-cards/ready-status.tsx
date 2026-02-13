import Lottie from 'lottie-react';

import readyAnimation from '../../../../../../public/assets/lottie/Pizza-ready.json';

import deliveryAnimation from '../../../../../../public/assets/lottie/Delivery.json';

import { PickupLocationCard } from '@/components/shared/pickup-location-card';
import { OrderStatusData } from '../order-status-data';

interface Props {
  data: OrderStatusData;
}

export const ReadyStatus = ({ data }: Props) => {
  const isPickup = data.deliveryType === 'pickup';

  return (
    <div className="flex flex-col items-center justify-center text-center py-6">
      <div className="w-64 h-64 mb-4">
        <Lottie animationData={isPickup ? readyAnimation : deliveryAnimation} loop={true} />
      </div>

      <h2 className="text-2xl font-bold text-neutral-900 mb-2">
        {isPickup ? 'Il tuo ordine è pronto!' : 'In consegna!'}
      </h2>

      <p className="text-neutral-500 mb-8 max-w-md">
        {isPickup
          ? 'Puoi venire a ritirare il tuo ordine.'
          : 'Il nostro corriere sta arrivando da te.'}
      </p>

      {/* Логика отображения адреса */}
      {isPickup ? (
        // Карточка пиццерии (с данными из базы!)
        <PickupLocationCard className="w-full max-w-sm" storeInfo={data.storeInfo} />
      ) : (
        // Адрес клиента
        <div className="bg-neutral-50 rounded-xl p-4 w-full max-w-sm border border-neutral-200">
          <div className="text-xs text-neutral-500 uppercase font-bold mb-1">
            Indirizzo di consegna
          </div>
          <div className="text-neutral-900 font-medium">{data.address}</div>
        </div>
      )}
    </div>
  );
};
