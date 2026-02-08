'use client';

import { cn } from '@/lib/utils';
import React, { JSX } from 'react';
import { useFormContext } from 'react-hook-form';

import { FormInput } from '../form/form-input';
import { FormTextarea } from '../form/form-textarea';
import { PickupLocationCard } from '../pickup-location-card';
import { WhiteBlock } from '../white-block';
import { DeliveryTypeSelector } from './delivery-type-selector';
interface ICheckoutDeliveryFormProps {
  className?: string;
}

export const CheckoutDeliveryForm: React.FC<ICheckoutDeliveryFormProps> = ({
  className,
}): JSX.Element => {
  const { watch } = useFormContext();
  const deliveryType = watch('deliveryType');

  return (
    <WhiteBlock
      title="3. Ricezione e commento"
      contentClassName={cn('', className)}
      className={className}
    >
      <div className="flex flex-col gap-5">
        {/* Переключатель типа доставки */}
        <DeliveryTypeSelector />

        {/* Поле адреса - показываем только при доставке на дом */}
        {deliveryType === 'delivery' && (
          <div className="animate-in fade-in duration-300">
            {/* <FormAddressAutocomplete
              name="address"
              className="text-base"
              placeholder="Indirizzo"
              label="Indirizzo"
              required
            /> */}
            {/*  */}
            <FormInput
              name="address"
              className="text-base "
              placeholder="Indirizzo"
              label="Indirizzo"
              required
            />
          </div>
        )}

        {/* Поле с адреса - показываем только самовывозе */}
        {deliveryType === 'pickup' && <PickupLocationCard className="mt-4" />}

        {/* Комментарий - всегда доступен */}
        <FormTextarea rows={5} name="comment" placeholder="Commento al ordine" />
      </div>
    </WhiteBlock>
  );
};
