import { cn } from '@/lib/utils';
import React, { JSX } from 'react';

import { FormAddressAutocomplete } from '../form/form-address-autocomplete';
import { FormTextarea } from '../form/form-textarea';
import { WhiteBlock } from '../white-block';

interface ICheckoutAdressFormProps {
  className?: string;
}

export const CheckoutAdressForm: React.FC<ICheckoutAdressFormProps> = ({
  className,
}): JSX.Element => {
  return (
    <WhiteBlock
      title="3. Адрес и комментарий"
      contentClassName={cn('', className)}
      className={className}
    >
      <div className="flex flex-col gap-5">
        <FormAddressAutocomplete
          name="address"
          className="text-base "
          placeholder="Адрес"
          label="Адрес"
          required
        />

        <FormTextarea rows={5} name="comment" placeholder="Комментарий к заказу" />
      </div>
    </WhiteBlock>
  );
};
