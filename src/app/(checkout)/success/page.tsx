'use client';

import { Button } from '@/components/ui';

import { useRouter } from 'next/navigation';
import { Suspense } from 'react';

import { motion } from 'framer-motion';

import { useOrderPolling } from '@/hooks/use-order-polling';
import { Loader2 } from 'lucide-react';
import { OrderReceipt, OrderStepper, OrderSuccessHeader, StatusBlock } from './components';

const SuccessContent = () => {
  const router = useRouter();

  // 1. Используем наш кастомный хук!
  // (Вставь код хука useOrderPolling выше или импортируй его)
  const { orderData, loading, orderId } = useOrderPolling();

  // Обработка загрузки
  if (loading && !orderData) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        >
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
        </motion.div>
        <p className="text-neutral-500 font-medium animate-pulse">Caricamento ordine...</p>
      </div>
    );
  }

  if (!orderData) {
    if (orderId)
      return (
        <div className="min-h-screen flex items-center justify-center">Ordine non trovato</div>
      );
    // Если вообще нет ID
    return <div className="min-h-screen flex items-center justify-center">Link non valido</div>;
  }

  return (
    <div className="min-h-screen  py-12 px-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-orange-50 to-transparent -z-10" />

      <div className="max-w-xl mx-auto text-center z-10 relative">
        {/* Заголовок */}
        <OrderSuccessHeader data={orderData} />

        {/* Прогресс-бар (скрываем при отмене) */}
        {orderData.status !== 'CANCELLED' && <OrderStepper currentStatus={orderData.status} />}

        {/* Блок с карточками статусов */}
        <StatusBlock data={orderData} />

        {/* Чек */}
        <OrderReceipt data={orderData} />

        {/* Кнопка "Домой" */}
        {orderData.status !== 'CANCELLED' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-12"
          >
            <Button
              variant="ghost"
              onClick={() => router.push('/')}
              className="text-neutral-400 hover:text-neutral-600"
            >
              Torna alla home
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-neutral-50">
          <Loader2 className="animate-spin text-primary" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
