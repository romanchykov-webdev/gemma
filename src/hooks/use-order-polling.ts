import { OrderStatusData } from '@/app/(checkout)/success/components/order-status-data';
import confetti from 'canvas-confetti';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export const useOrderPolling = () => {
  const params = useSearchParams();
  const orderId = params.get('orderId');
  const [orderData, setOrderData] = useState<OrderStatusData | null>(null);
  const [loading, setLoading] = useState(true);

  // 🛠️ DEV MODE: Раскомментируй, чтобы тестировать UI без базы данных
  useEffect(() => {
    setOrderData({
      orderId: 'TEST-123-DEV',
      // 1. МЕНЯЙ СТАТУС ЗДЕСЬ: 'PENDING' | 'PROCESSING' | 'READY' | 'CANCELLED'
      status: 'READY',

      // 2. МЕНЯЙ ТИП ДОСТАВКИ: 'pickup' | 'delivery'
      deliveryType: 'delivery',

      // 3. ДОБАВИЛ АДРЕС ДЛЯ ТЕСТА
      address: 'Via Molino, 42 interrno 3, 30020 Torre di Mosto VE',

      // Время готовности (+30 минут от сейчас)
      expectedReadyAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      readyAt: null,
      createdAt: new Date().toISOString(),
      fullName: 'Luigi Mario',
      totalAmount: 12.5,
    });
    setLoading(false); // Отключаем загрузку
    return; // Прерываем, чтобы реальный fetch не сработал поверх
  }, []);

  // Конфетти
  useEffect(() => {
    if (orderData?.status === 'READY') {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ff5e00', '#ffffff', '#009b4d'],
      });
    }
  }, [orderData?.status]);

  // 2. Fetch Logic
  const fetchOrderStatus = useCallback(async () => {
    if (!orderId) return false;
    try {
      const response = await fetch(`/api/order/status?orderId=${orderId}`);
      if (!response.ok) throw new Error();
      const data = await response.json();
      setOrderData(data);
      if (data.status === 'READY' || data.status === 'CANCELLED') {
        setLoading(false);
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  // 3. Polling Effect
  //   useEffect(() => {
  //     if (!orderId) return;
  //     fetchOrderStatus();
  //     const pollInterval = setInterval(async () => {
  //       const shouldStop = await fetchOrderStatus();
  //       if (shouldStop) clearInterval(pollInterval);
  //     }, 5000);
  //     return () => clearInterval(pollInterval);
  //   }, [orderId, fetchOrderStatus]);

  // 4. Confetti Effect
  useEffect(() => {
    if (orderData?.status === 'READY') {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ff5e00', '#ffffff', '#009b4d'],
      });
    }
  }, [orderData?.status]);

  return { orderData, loading, orderId };
};
