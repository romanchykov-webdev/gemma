import Lottie from 'lottie-react';
import loadingAnimation from '../../../../../../public/assets/lottie/Loading.json';

export const PendingStatus = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-10">
      <div className="w-64 h-64 mb-6">
        <Lottie animationData={loadingAnimation} loop={true} />
      </div>
      <h2 className="text-2xl font-bold text-neutral-900 mb-2">In attesa di conferma</h2>
      <p className="text-neutral-500 max-w-md">Il ristorante sta ricevendo il tuo ordine.</p>
    </div>
  );
};
