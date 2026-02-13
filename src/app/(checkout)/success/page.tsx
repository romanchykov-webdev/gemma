'use client';

import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

import { Button } from '@/components/ui/button';
import { useOrderPolling } from '@/hooks/use-order-polling';

import { OrderReceipt, OrderStepper, OrderSuccessHeader, StatusBlock } from './components';

const SuccessContent = () => {
  const { orderData, loading, orderId } = useOrderPolling();

  // 1. Твой кастомный лоадер (сохранил дизайн)
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

  // 2. Обработка ошибок
  if (!orderData) {
    if (orderId) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-lg font-medium">Ordine non trovato</p>
        </div>
      );
    }
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg font-medium">Link non valido</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 relative overflow-hidden">
      {/* фон-градиент */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-orange-50 to-transparent -z-10" />

      <div className="max-w-xl mx-auto text-center z-10 relative space-y-8">
        {/* Заголовок */}

        <OrderSuccessHeader data={orderData} />

        {/* Прогресс-бар */}
        {orderData.status !== 'CANCELLED' && <OrderStepper currentStatus={orderData.status} />}

        {/* ✅ StatusBlock */}
        <StatusBlock data={orderData} />

        {/* ✅ Чек */}
        <OrderReceipt data={orderData} />

        {/* Кнопка "Домой" */}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12"
        >
          <Link href="/">
            <Button variant="ghost" className="text-neutral-400 hover:text-neutral-600">
              Torna alla home
            </Button>
          </Link>
        </motion.div>
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
