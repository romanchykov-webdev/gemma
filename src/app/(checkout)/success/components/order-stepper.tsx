'use client';

import { OrderStatus } from '@prisma/client';
import { motion } from 'framer-motion';
import { ChefHat, ShoppingBag, UtensilsCrossed } from 'lucide-react';

// 🛡️ Обновили тип пропсов: статус может быть undefined
export const OrderStepper = ({ currentStatus }: { currentStatus?: OrderStatus }) => {
  const steps = [
    { status: 'PENDING', label: 'Ricevuto', icon: ShoppingBag },
    { status: 'PROCESSING', label: 'In forno', icon: ChefHat },
    { status: 'READY', label: 'Pronto', icon: UtensilsCrossed },
  ];

  const getCurrentStepIndex = () => {
    // 🛡️ Защита: Если статуса нет или он отменен
    if (!currentStatus || currentStatus === 'CANCELLED') return -1;

    if (currentStatus === 'PENDING') return 0;
    if (currentStatus === 'PROCESSING') return 1;
    if (currentStatus === 'READY' || currentStatus === 'SUCCEEDED') return 2;

    return 0; // Fallback
  };

  const activeIndex = getCurrentStepIndex();

  // Если статус неизвестен или отменен, не показываем заполнение
  const progressWidth = activeIndex >= 0 ? (activeIndex / (steps.length - 1)) * 100 : 0;

  return (
    <div className="w-full max-w-md mx-auto mb-10">
      <div className="relative flex justify-between items-center z-10">
        {/* Серый фон линии */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-neutral-200 -z-10 rounded-full" />

        {/* Цветная линия прогресса */}
        <motion.div
          className="absolute top-1/2 left-0 h-1 bg-primary -z-10 rounded-full"
          initial={{ width: '0%' }}
          animate={{ width: `${progressWidth}%` }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        />

        {steps.map((step, index) => {
          const isActive = activeIndex >= 0 && index <= activeIndex;
          const isCurrent = activeIndex >= 0 && index === activeIndex;
          const Icon = step.icon;

          return (
            <div
              key={step.status}
              className={`flex flex-col items-center gap-2 relative px-2 ${index === 0 ? '-translate-x-4' : index === 2 ? 'translate-x-4' : ''}`}
            >
              <motion.div
                initial={false}
                animate={{
                  backgroundColor: isActive ? 'var(--primary)' : '#e5e5e5',
                  scale: isCurrent ? 1.2 : 1,
                  boxShadow: isCurrent ? '0px 0px 20px rgba(255, 94, 0, 0.4)' : 'none',
                }}
                className="w-10 h-10 rounded-full flex items-center justify-center border-4 border-white transition-colors duration-300 z-20"
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
