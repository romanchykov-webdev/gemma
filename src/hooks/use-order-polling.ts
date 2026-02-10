import { OrderStatusData } from '@/app/(checkout)/success/components/order-status-data';
import confetti from 'canvas-confetti';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import useSWR from 'swr';

// Простой фетчер для SWR
const fetcher = (url: string) => fetch(url).then(res => res.json());

export const useOrderPolling = () => {
  const params = useSearchParams();
  const orderId = params.get('orderId');

  // ===========================================================================
  // 🛠️ DEV MODE (ТЕСТОВЫЙ РЕЖИМ)
  // ===========================================================================
  //  true, чтобы включить мок-данные и отключить запросы к серверу
  const IS_DEV_MODE = false;

  const [devData, setDevData] = useState<OrderStatusData | null>(null);

  useEffect(() => {
    if (IS_DEV_MODE) {
      setDevData({
        orderId: 'TEST-123-DEV',
        status: 'CANCELLED', // PENDING | PROCESSING | READY | CANCELLED
        deliveryType: 'pickup', // pickup | delivery
        address: 'Via Molino, 42 interrno 3, 30020 Torre di Mosto VE',
        expectedReadyAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        readyAt: null,
        createdAt: new Date().toISOString(),
        fullName: 'Luigi Mario',
        totalAmount: 22.8,
        items: [
          {
            id: 1,
            name: 'Pollo BBQ',
            price: 9.9,
            quantity: 1,
            sizeName: 'Grande',
            typeName: 'Tradizionale',
            ingredients: [
              { id: 5, name: 'Pollo tenero', price: 2.9 },
              { id: 6, name: 'Funghi prataioli', price: 2.0 },
            ],
            removedIngredients: [{ name: 'Cipolla rossa' }],
          },
          {
            id: 2,
            name: 'Margherita',
            price: 8.0,
            quantity: 1,
            sizeName: 'Media',
            typeName: 'Sottile',
            ingredients: [],
            removedIngredients: [],
          },
        ],
      } as unknown as OrderStatusData);
    }
  }, [IS_DEV_MODE]);

  // ===========================================================================
  // 🚀 SWR IMPLEMENTATION (PROD MODE)
  // ===========================================================================

  // Если включен Dev Mode, мы передаем null в ключ SWR, чтобы запросы НЕ шли
  const shouldFetch = !IS_DEV_MODE && orderId;

  const { data: swrData, isLoading: swrLoading } = useSWR<OrderStatusData>(
    shouldFetch ? `/api/order/status?orderId=${orderId}` : null,
    fetcher,
    {
      // 🔥 Умный интервал опроса
      refreshInterval: latestData => {
        // Если статус PENDING (ждем подтверждения) -> часто (4 сек)
        if (latestData?.status === 'PENDING') return 4000;
        // Если PROCESSING (готовится) -> редко (15 сек), чтобы не грузить сервер
        if (latestData?.status === 'PROCESSING') return 15000;
        // Если READY или CANCELLED -> 0 (остановить опрос)
        return 0;
      },
      // Обновлять данные, когда юзер возвращается на вкладку (экономия батареи)
      revalidateOnFocus: true,
    },
  );

  // Определяем, какие данные возвращать (Dev или Real)
  const orderData = IS_DEV_MODE ? devData : swrData;
  const loading = IS_DEV_MODE ? false : swrLoading;

  // ===========================================================================
  // 🎉 ЭФФЕКТЫ (Конфетти)
  // ===========================================================================
  const confettiFiredRef = useRef(false);

  useEffect(() => {
    if (orderData?.status === 'READY' && !confettiFiredRef.current) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ff5e00', '#ffffff', '#009b4d'],
      });
      confettiFiredRef.current = true;
    }
  }, [orderData?.status]);

  return { orderData, loading: loading && !orderData, orderId };
};

/* ================================================================================
🎓 INTERVIEW REFERENCE: CUSTOM POLLING HOOK
================================================================================
Ниже приведена ручная реализация поллинга. 
Я сохранил её здесь, чтобы продемонстрировать понимание работы "под капотом":
1. Управление таймерами (setTimeout vs setInterval).
2. Обработка Visibility API (Revalidate on Focus).
3. Exponential Backoff (защита от сбоев сети).
4. Очистка эффектов (Cleanup).

В продакшене я использую SWR, так как это стандартизированное и более легкое решение,
но я полностью понимаю, как написать эту логику с нуля.
================================================================================

import { useState, useEffect, useRef, useCallback } from 'react';

export const useCustomOrderPolling = () => {
  const params = useSearchParams();
  const orderId = params.get('orderId');
  const [data, setData] = useState(null);
  
  // Ref нужен для доступа к актуальному статусу внутри замыкания setTimeout
  const statusRef = useRef(data?.status);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/order/status?orderId=${orderId}`);
      if (!res.ok) return false; // Обработка ошибок сети (Retry)
      const json = await res.json();
      setData(json);
      statusRef.current = json.status;
      return json.status === 'READY' || json.status === 'CANCELLED'; // Stop condition
    } catch (e) {
      console.error(e);
      return false;
    }
  }, [orderId]);

  useEffect(() => {
    if (!orderId) return;

    let timeoutId;
    
    // Рекурсивный поллинг (лучше setInterval, т.к. гарантирует завершение запроса)
    const poll = async () => {
      const shouldStop = await fetchStatus();
      if (!shouldStop) {
        // Динамический интервал
        const interval = statusRef.current === 'PENDING' ? 4000 : 15000;
        timeoutId = setTimeout(poll, interval);
      }
    };

    poll(); // Первый запуск

    // Слушатель фокуса вкладки (аналог revalidateOnFocus)
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') poll();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [orderId, fetchStatus]);

  return { data };
};
*/
