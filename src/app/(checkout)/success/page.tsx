'use client';

import { Button } from '@/components/ui';
import { OrderStatus } from '@prisma/client';
import { CheckCircle2, Clock, Flame, Loader2, Package } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useState } from 'react';

// 📦 Тип данных статуса заказа
type OrderStatusData = {
  orderId: string;
  status: OrderStatus;
  expectedReadyAt: string | null;
  readyAt: string | null;
  createdAt: string;
  fullName: string;
  totalAmount: number;
};

const SuccessContent = () => {
  const params = useSearchParams();
  const router = useRouter();
  const orderId = params.get('orderId');

  // 🎯 State для хранения данных заказа
  const [orderData, setOrderData] = useState<OrderStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔄 Функция для получения статуса заказа
  const fetchOrderStatus = useCallback(async () => {
    if (!orderId) {
      setError('ID ordine mancante');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/order/status?orderId=${orderId}`);

      if (!response.ok) {
        throw new Error('Errore nel caricamento dello stato');
      }

      const data: OrderStatusData = await response.json();
      setOrderData(data);
      setError(null);

      // ✅ Если заказ готов, останавливаем polling
      if (data.status === 'READY') {
        return true; // Сигнал для остановки polling
      }

      return false;
    } catch (err) {
      console.error('[ORDER_STATUS] Error:', err);
      setError("Impossibile caricare lo stato dell'ordine");
      return false;
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  // 🔄 Polling: проверяем статус каждые 5 секунд
  useEffect(() => {
    if (!orderId) return;

    // Первый запрос сразу
    fetchOrderStatus();

    // Устанавливаем интервал для polling
    const pollInterval = setInterval(async () => {
      const shouldStop = await fetchOrderStatus();

      // Останавливаем polling, если заказ готов
      if (shouldStop) {
        clearInterval(pollInterval);
      }
    }, 5000); // Каждые 5 секунд

    return () => {
      clearInterval(pollInterval);
    };
  }, [orderId, fetchOrderStatus]);

  // 🕐 Функция для форматирования времени expectedReadyAt
  const formatExpectedTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // ❌ Если нет orderId
  if (!orderId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
        <Package className="w-16 h-16 text-neutral-400 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Ordine non trovato</h1>
        <p className="text-neutral-600 mb-6">ID ordine mancante nell&apos;URL</p>
        <Button onClick={() => router.replace('/')}>Torna alla home</Button>
      </div>
    );
  }

  // ⏳ Загрузка
  if (loading && !orderData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-neutral-600">Caricamento stato ordine...</p>
      </div>
    );
  }

  // ❌ Ошибка
  if (error || !orderData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
        <Package className="w-16 h-16 text-red-400 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Errore</h1>
        <p className="text-neutral-600 mb-6">{error || 'Ordine non trovato'}</p>
        <Button onClick={() => router.replace('/')}>Torna alla home</Button>
      </div>
    );
  }

  // 🎨 Рендерим UI в зависимости от статуса
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <div className="max-w-2xl w-full">
        {/* Заголовок */}
        <h1 className="text-3xl font-bold mb-2">{"Grazie per l'ordine!"} 🎉</h1>
        <p className="text-neutral-600 mb-8">
          Ciao, {orderData.fullName}! Il tuo ordine è stato ricevuto.
        </p>

        {/* 🟡 СОСТОЯНИЕ 1: PENDING - Ждем подтверждения */}
        {orderData.status === 'PENDING' && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-8 mb-6 animate-pulse">
            <div className="flex items-center justify-center mb-4">
              <Clock className="w-16 h-16 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold text-yellow-800 mb-3">
              Ordine inviato alla pizzeria
            </h2>
            <p className="text-lg text-yellow-700 mb-4">
              Stiamo aspettando la conferma dal ristorante...
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-yellow-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verifica in corso...</span>
            </div>
          </div>
        )}

        {/* 🟠 СОСТОЯНИЕ 2: PROCESSING - Готовится */}
        {orderData.status === 'PROCESSING' && (
          <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-8 mb-6">
            <div className="flex items-center justify-center mb-4">
              <Flame className="w-16 h-16 text-orange-600 animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-orange-800 mb-3">👨‍🍳 Ordine in preparazione!</h2>
            <p className="text-lg text-orange-700 mb-4">
              Il tuo ordine è stato accettato e stiamo cucinando la tua pizza!
            </p>

            {/* Показываем время готовности, если оно есть */}
            {orderData.expectedReadyAt && (
              <div className="bg-white rounded-xl p-4 border border-orange-200">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-orange-600" />
                  <span className="font-semibold text-orange-800">Pronto alle:</span>
                </div>
                <div className="text-3xl font-bold text-orange-600">
                  {formatExpectedTime(orderData.expectedReadyAt)}
                </div>
                <p className="text-sm text-orange-600 mt-2">Tempo stimato di preparazione</p>
              </div>
            )}

            {!orderData.expectedReadyAt && (
              <div className="flex items-center justify-center gap-2 text-sm text-orange-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Preparazione in corso...</span>
              </div>
            )}
          </div>
        )}

        {/* 🟢 СОСТОЯНИЕ 3: READY - Готов! */}
        {orderData.status === 'READY' && (
          <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-8 mb-6">
            <div className="flex items-center justify-center mb-4">
              <CheckCircle2 className="w-20 h-20 text-green-600 animate-bounce" />
            </div>
            <h2 className="text-3xl font-bold text-green-800 mb-3">🍕 IL TUO ORDINE È PRONTO!</h2>
            <p className="text-xl text-green-700 mb-6">
              Puoi ritirarlo alla cassa! Buon appetito! 😋
            </p>

            {orderData.readyAt && (
              <div className="bg-white rounded-xl p-4 border border-green-200 mb-4">
                <p className="text-sm text-green-600">
                  Completato alle:{' '}
                  <span className="font-bold">{formatExpectedTime(orderData.readyAt)}</span>
                </p>
              </div>
            )}

            <div className="text-sm text-green-600">✅ Ti aspettiamo!</div>
          </div>
        )}

        {/* 🔴 СОСТОЯНИЕ 4: CANCELLED - Отменен */}
        {orderData.status === 'CANCELLED' && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 mb-6">
            <div className="flex items-center justify-center mb-4">
              <Package className="w-16 h-16 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-red-800 mb-3">Ordine annullato</h2>
            <p className="text-lg text-red-700 mb-4">Purtroppo il tuo ordine è stato annullato.</p>
            <p className="text-sm text-red-600">Per maggiori informazioni, contattaci.</p>
          </div>
        )}

        {/* Информация о заказе */}
        <div className="bg-neutral-50 rounded-xl p-6 mb-6 text-left">
          <h3 className="font-semibold text-neutral-800 mb-3">Dettagli ordine:</h3>
          <div className="space-y-2 text-sm text-neutral-600">
            <div className="flex justify-between">
              <span>ID ordine:</span>
              <span className="font-mono text-xs">{orderData.orderId.split('-')[0]}</span>
            </div>
            <div className="flex justify-between">
              <span>Totale:</span>
              <span className="font-bold text-neutral-800">
                €{orderData.totalAmount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Stato:</span>
              <span className="font-semibold capitalize">{orderData.status}</span>
            </div>
          </div>
        </div>

        {/* Кнопка домой (только если заказ готов или отменен) */}
        {(orderData.status === 'READY' || orderData.status === 'CANCELLED') && (
          <Button
            variant="default"
            onClick={() => router.replace('/')}
            className="w-full sm:w-auto"
          >
            Torna alla home
          </Button>
        )}

        {/* Автообновление для активных заказов */}
        {(orderData.status === 'PENDING' || orderData.status === 'PROCESSING') && (
          <div className="mt-4 text-sm text-neutral-500">
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>Aggiornamento automatico ogni 5 secondi</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[70vh] items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
