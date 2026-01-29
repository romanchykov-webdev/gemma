'use client';

import { cn } from '@/lib/utils';
import { ArrowRightIcon, Car, Store } from 'lucide-react';
import React, { JSX } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Button } from '../../ui';

interface IDeliveryTypeSelectorProps {
  className?: string;
}

type DeliveryType = 'delivery' | 'pickup';

interface DeliveryOption {
  value: DeliveryType;
  label: string;
  icon: React.ReactElement<{ className?: string }>;
}

const deliveryOptions: DeliveryOption[] = [
  {
    value: 'delivery',
    label: 'Consegna a domicilio',
    icon: <Car />,
  },
  {
    value: 'pickup',
    label: 'Asporto',
    icon: <Store />,
  },
];

export const DeliveryTypeSelector: React.FC<IDeliveryTypeSelectorProps> = ({
  className,
}): JSX.Element => {
  const { control } = useFormContext();

  return (
    <Controller
      name="deliveryType"
      control={control}
      render={({ field }) => (
        <div className={cn('grid grid-cols-1 sm:grid-cols-2 gap-4', className)}>
          {deliveryOptions.map(option => {
            const isActive = field.value === option.value;

            return (
              <Button
                key={option.value}
                type="button"
                variant={isActive ? 'default' : 'outline'}
                className="w-full h-14 rounded-2xl text-base font-bold justify-start gap-3 px-5"
                onClick={() => field.onChange(option.value)}
              >
                <div
                  className={cn(
                    'flex items-center justify-center w-8 h-8 rounded-full',
                    isActive ? 'bg-white/20' : 'bg-brand-primary/10',
                  )}
                >
                  {React.cloneElement(option.icon, {
                    className: cn('w-5 h-5', isActive ? 'text-white' : 'text-brand-primary'),
                  })}
                </div>
                <span className="flex-1 text-left">{option.label}</span>
                <ArrowRightIcon className="w-5 h-5" />
              </Button>
            );
          })}
        </div>
      )}
    />
  );
};
