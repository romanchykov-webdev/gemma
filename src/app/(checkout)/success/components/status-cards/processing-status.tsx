import Lottie from 'lottie-react';
import chefAnimation from '../../../../../../public/assets/lottie/chef.json';

import { formatOrderTime, getRemainingMinutes } from '@/lib/order-time-utils';
import { OrderStatusData } from '../order-status-data';

interface Props {
  data: OrderStatusData;
}

export const ProcessingStatus = ({ data }: Props) => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-8">
      <div className="w-64 h-64 mb-4">
        <Lottie animationData={chefAnimation} loop={true} />
      </div>

      <h2 className="text-2xl font-bold text-neutral-900 mb-2">Stiamo cucinando!</h2>
      <p className="text-neutral-500 mb-8 max-w-md">{`I nostri chef sono all'opera!`}</p>

      {/* Блок времени */}
      {data.expectedReadyAt && (
        <div className="bg-orange-50 rounded-2xl p-6 border border-orange-100 w-full max-w-xs">
          <div className="text-sm text-neutral-500 font-medium mb-1 uppercase tracking-wide">
            Pronto per le
          </div>
          <div className="text-4xl font-bold text-primary mb-2">
            {formatOrderTime(data.expectedReadyAt)}
          </div>
          <div className="text-sm text-neutral-600 font-medium bg-white/50 py-1 px-3 rounded-full inline-block">
            ⏳ Circa {getRemainingMinutes(data.expectedReadyAt)} min rimanenti
          </div>
        </div>
      )}
    </div>
  );
};
