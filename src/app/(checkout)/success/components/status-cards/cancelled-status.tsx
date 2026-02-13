import errorAnimation from '../../../../../../public/assets/lottie/error.json';

import Lottie from 'lottie-react';

export const CancelledStatus = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12">
      <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6">
        <Lottie animationData={errorAnimation} loop={true} />
      </div>
      <h2 className="text-2xl font-bold text-neutral-900 mb-2">Ordine annullato</h2>
      <p className="text-neutral-500 max-w-md">
        Ci dispiace, ma il tuo ordine è stato annullato. Contatta la pizzeria per maggiori
        informazioni.
      </p>
    </div>
  );
};
