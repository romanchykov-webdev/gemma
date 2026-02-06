'use client';

import { Button } from '@/components/ui';
import { OrderStatus } from '@prisma/client';
import confetti from 'canvas-confetti';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  Check,
  ChefHat,
  Clock,
  ExternalLink,
  Flame,
  Loader2,
  MapPin,
  Receipt,
  ShoppingBag,
  UtensilsCrossed,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { Suspense, useCallback, useEffect, useState } from 'react';

// 📦 Тип данных
type OrderStatusData = {
  orderId: string;
  status: OrderStatus;
  expectedReadyAt: string | null;
  readyAt: string | null;
  createdAt: string;
  fullName: string;
  totalAmount: number;
  deliveryType: 'pickup' | 'delivery';
};

// --- КОМПОНЕНТЫ UI ---

// 1. Прогресс-бар (Stepper)
const OrderStepper = ({ currentStatus }: { currentStatus: OrderStatus }) => {
  const steps = [
    { status: 'PENDING', label: 'Ricevuto', icon: ShoppingBag },
    { status: 'PROCESSING', label: 'In forno', icon: ChefHat },
    { status: 'READY', label: 'Pronto', icon: UtensilsCrossed },
  ];

  const getCurrentStepIndex = () => {
    if (currentStatus === 'CANCELLED') return -1;
    if (currentStatus === 'PENDING') return 0;
    if (currentStatus === 'PROCESSING') return 1;
    return 2; // READY
  };

  const activeIndex = getCurrentStepIndex();

  return (
    <div className="w-full max-w-md mx-auto mb-10">
      <div className="relative flex justify-between items-center z-10">
        {/* Линия фона */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-neutral-200 -z-10 rounded-full" />

        {/* Активная линия (прогресс) */}
        <motion.div
          className="absolute top-1/2 left-0 h-1 bg-primary -z-10 rounded-full"
          initial={{ width: '0%' }}
          animate={{ width: `${(activeIndex / (steps.length - 1)) * 100}%` }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        />

        {steps.map((step, index) => {
          const isActive = index <= activeIndex;
          const isCurrent = index === activeIndex;
          const Icon = step.icon;

          return (
            <div key={step.status} className="flex flex-col items-center gap-2">
              <motion.div
                initial={false}
                animate={{
                  backgroundColor: isActive ? 'var(--primary)' : '#e5e5e5',
                  scale: isCurrent ? 1.2 : 1,
                  boxShadow: isCurrent ? '0px 0px 20px rgba(255, 94, 0, 0.4)' : 'none',
                }}
                className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white transition-colors duration-300`}
              >
                {isActive ? (
                  <Icon className="w-5 h-5 text-white" />
                ) : (
                  <span className="w-3 h-3 bg-neutral-400 rounded-full" />
                )}
              </motion.div>
              <span
                className={`text-xs font-semibold ${isActive ? 'text-neutral-900' : 'text-neutral-400'}`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 2. Карточка "Чек" (Receipt)
const OrderReceipt = ({ data }: { data: OrderStatusData }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.4 }}
    className="bg-white relative p-6 rounded-t-2xl shadow-sm border border-neutral-100 w-full max-w-sm mx-auto mt-8"
  >
    {/* Зубчики чека */}
    <div
      className="absolute bottom-0 left-0 w-full h-4 bg-white translate-y-1/2"
      style={{
        maskImage: 'radial-gradient(circle, transparent 50%, black 50%)',
        maskSize: '20px 20px',
        maskRepeat: 'repeat-x',
      }}
    />

    <div className="flex items-center justify-between mb-4 pb-4 border-b border-dashed border-neutral-200">
      <div className="flex items-center gap-2 text-neutral-500">
        <Receipt className="w-4 h-4" />
        <span className="text-sm font-medium">Scontrino digitale</span>
      </div>
      <span className="text-xs bg-neutral-100 px-2 py-1 rounded text-neutral-600 font-mono">
        #{data.orderId.split('-')[0].toUpperCase()}
      </span>
    </div>

    <div className="space-y-3">
      <div className="flex justify-between text-sm">
        <span className="text-neutral-600">Cliente</span>
        <span className="font-semibold text-neutral-900">{data.fullName}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-neutral-600">Metodo</span>
        {/* 👇 Теперь текст зависит от типа заказа */}
        <span className="text-neutral-900">
          {data.deliveryType === 'pickup' ? 'Asporto (Ritiro)' : 'Consegna a domicilio'}
        </span>
      </div>
      <div className="flex justify-between items-end mt-4 pt-4 border-t border-dashed border-neutral-200">
        <span className="font-bold text-neutral-900 text-lg">Totale</span>
        <span className="font-bold text-primary text-xl">€{data.totalAmount.toFixed(2)}</span>
      </div>
    </div>
  </motion.div>
);

// --- ОСНОВНОЙ КОНТЕНТ ---

const SuccessContent = () => {
  const params = useSearchParams();
  const router = useRouter();
  const orderId = params.get('orderId');

  const [orderData, setOrderData] = useState<OrderStatusData | null>(null);
  const [loading, setLoading] = useState(true);

  // Конфетти при статусе READY
  useEffect(() => {
    if (orderData?.status === 'READY') {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ff5e00', '#ffffff', '#009b4d'], // Цвета Италии/Пиццы
      });
    }
  }, [orderData?.status]);

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

  useEffect(() => {
    if (!orderId) return;
    fetchOrderStatus();
    const pollInterval = setInterval(async () => {
      const shouldStop = await fetchOrderStatus();
      if (shouldStop) clearInterval(pollInterval);
    }, 4000);
    return () => clearInterval(pollInterval);
  }, [orderId, fetchOrderStatus]);

  if (!orderId)
    return <div className="min-h-screen flex items-center justify-center">Ordine non trovato</div>;
  if (loading && !orderData)
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

  if (!orderData) return null;

  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4 relative overflow-hidden">
      {/* Декоративный фон */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-orange-50 to-transparent -z-10" />

      <div className="max-w-xl mx-auto text-center z-10 relative">
        {/* 1. Заголовок */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-extrabold text-neutral-900 mb-2 tracking-tight">
            {orderData.status === 'READY' ? 'Tutto pronto! 🍕' : "Grazie per l'ordine!"}
          </h1>
          <p className="text-neutral-500 text-lg">
            {orderData.status === 'READY'
              ? 'Corri a ritirare la tua pizza.'
              : 'Rilassati, ci pensiamo noi.'}
          </p>
        </motion.div>

        {/* 2. Stepper */}
        {orderData.status !== 'CANCELLED' && <OrderStepper currentStatus={orderData.status} />}

        {/* 3. Основная Карточка Статуса */}
        <AnimatePresence mode="wait">
          {orderData.status === 'PENDING' && (
            <StatusCard
              key="pending"
              icon={<Clock className="w-16 h-16 text-yellow-500" />}
              title="In attesa di conferma"
              description="Il ristorante sta ricevendo il tuo ordine."
              color="bg-white border-yellow-400"
              textColor="text-yellow-700"
            >
              <div className="flex items-center gap-2 justify-center mt-4 text-yellow-600 bg-yellow-50 py-2 px-4 rounded-full text-sm font-medium animate-pulse">
                <span className="w-2 h-2 bg-yellow-500 rounded-full" />
                Connessione con la pizzeria...
              </div>
            </StatusCard>
          )}

          {orderData.status === 'PROCESSING' && (
            <StatusCard
              key="processing"
              icon={
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <Flame className="w-20 h-20 text-orange-500" />
                </motion.div>
              }
              title="Stiamo cucinando!"
              description="I nostri chef sono all'opera."
              color="bg-white border-orange-200"
              textColor="text-neutral-900"
              shadow="shadow-orange-100"
            >
              {orderData.expectedReadyAt ? (
                <div className="mt-6 flex flex-col items-center">
                  <div className="text-sm text-neutral-400 font-medium uppercase tracking-wider mb-1">
                    Pronto stimato alle
                  </div>
                  <div className="text-5xl font-black text-neutral-900 tabular-nums tracking-tighter">
                    {new Date(orderData.expectedReadyAt).toLocaleTimeString('it-IT', {
                      hour: '2-digit',
                      minute: '2-digit',
                      timeZone: 'Europe/Rome', // Добавил timezone на всякий случай
                    })}
                  </div>
                  <div className="mt-2 text-orange-500 text-sm font-medium flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Circa{' '}
                    {Math.max(
                      0,
                      Math.ceil(
                        (new Date(orderData.expectedReadyAt).getTime() - new Date().getTime()) /
                          60000,
                      ),
                    )}{' '}
                    min rimanenti
                  </div>
                </div>
              ) : (
                <div className="mt-4 text-orange-600 font-medium">
                  Calcolo del tempo in corso...
                </div>
              )}
            </StatusCard>
          )}

          {orderData.status === 'READY' && (
            <StatusCard
              key="ready"
              icon={
                <div className="bg-green-100 p-4 rounded-full">
                  <Check className="w-12 h-12 text-green-600" />
                </div>
              }
              title="Vieni a ritirare!"
              description="Il tuo ordine ti aspetta caldo e fumante al bancone."
              color="bg-white border-green-200"
              textColor="text-neutral-900"
              shadow="shadow-green-100"
            >
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center justify-center gap-3">
                  {/* icon */}
                  <div className="flex-shrink-0 w-10 h-10 bg-primary rounded-full flex items-center justify-center ">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  {/* text */}
                  <div className="flex-1">
                    <a
                      href="https://www.google.com/maps/search/?api=1&query=Viale+Roma,+15,+30020+Torre+di+Mosto+VE"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:text-orange-700 font-medium flex flex-col items-start gap-1"
                    >
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        Ritira il tuo ordine presso:
                      </p>
                      <p className="flex items-center gap-3 text-left">
                        Viale Roma, 15, 30020 Torre di Mosto VE
                        <ExternalLink className="w-3 h-3" />
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Clicca per aprire in Google Maps</p>
                    </a>
                  </div>
                </div>
              </div>
            </StatusCard>
          )}

          {orderData.status === 'CANCELLED' && (
            <StatusCard
              key="cancelled"
              icon={
                <div className="bg-red-100 p-4 rounded-full">
                  <ArrowRight className="w-12 h-12 text-red-600 rotate-45" />
                </div>
              }
              title="Ordine Annullato"
              description="Ci dispiace, qualcosa è andato storto."
              color="bg-white border-red-200"
              textColor="text-red-900"
            >
              <Button onClick={() => router.push('/')} variant="default" className="mt-6">
                Torna al menu
              </Button>
            </StatusCard>
          )}
        </AnimatePresence>

        {/* 4. Чек (Receipt) */}
        <OrderReceipt data={orderData} />

        {/* Кнопка домой (внизу, ненавязчиво) */}
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

interface StatusCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  children?: React.ReactNode;
  color: string;
  textColor: string;
  shadow?: string;
}

// Вспомогательный компонент для карточки
const StatusCard = ({
  icon,
  title,
  description,
  children,
  color,
  textColor,
  shadow = 'shadow-xl',
}: StatusCardProps) => (
  <motion.div
    initial={{ scale: 0.95, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    exit={{ scale: 0.95, opacity: 0 }}
    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    className={`${color} ${shadow} border-2 rounded-[2rem] p-8 relative overflow-hidden`}
  >
    <div className="flex flex-col items-center relative z-10">
      <div className="mb-4">{icon}</div>
      <h2 className={`text-2xl font-bold ${textColor} mb-2`}>{title}</h2>
      <p className="text-neutral-500 max-w-xs mx-auto">{description}</p>
      {children}
    </div>
  </motion.div>
);

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
