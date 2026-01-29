'use client';

import { cn } from '@/lib/utils';
import React, { JSX } from 'react';
import { useFormContext } from 'react-hook-form';

import { ExternalLink, MapPin } from 'lucide-react';
import { FormInput } from '../form/form-input';
import { FormTextarea } from '../form/form-textarea';
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
        {deliveryType === 'pickup' && (
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex  items-center justify-center gap-3">
              {/* icon */}
              <div className="flex-shrink-0 w-10 h-10 bg-brand-primary rounded-full flex items-center justify-center ">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              {/* text */}
              <div className="flex-1 ">
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Viale+Roma+15+30020+Torre+di+Mosto+VE"
                  // href="https://www.google.com/maps/dir/?api=1&destination=45.7489,12.6872"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-brand-primary hover:text-brand-hover font-medium  flex flex-col items-start gap-1
                  
                  "
                >
                  <p className="text-sm font-medium text-gray-900 mb-1 ">
                    Ritira il tuo ordine presso:
                  </p>
                  <p className="flex items-center gap-3">
                    Viale Roma, 15, 30020 Torre di Mosto VE
                    <ExternalLink className="w-3 h-3" />
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Clicca per aprire in Google Maps</p>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Комментарий - всегда доступен */}
        <FormTextarea rows={5} name="comment" placeholder="Commento al ordine" />
      </div>
    </WhiteBlock>
  );
};
