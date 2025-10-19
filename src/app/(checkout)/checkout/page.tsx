'use client';
import { Title } from '@/components/shared';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';

import { createCashOrder, createOrder } from '@/app/actions';
import { CheckoutSidebar } from '@/components/shared/checkout-sidebar';
import { CheckoutAdressForm } from '@/components/shared/checkout/checkout-adress-form';
import { CheckoutCart } from '@/components/shared/checkout/checkout-cart';
import {
  checkoutFormSchema,
  CheckoutFormValues,
} from '@/components/shared/checkout/checkout-form-schema';
import { CheckoutPersanalInfo } from '@/components/shared/checkout/checkout-persanal-info';
import { useCart } from '@/hooks';
import { cn } from '@/lib/utils';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Api } from '../../../../services/api-client';

export default function CheckoutPage() {
  //
  const [submitting, setSubmitting] = useState(false);

  const { data: session } = useSession();

  const { totalAmount, items, loading, removeCartItem, changeItemCount } = useCart();

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      email: '',
      firstname: '',
      lastname: '',
      phone: '',
      address: '',
      comment: '',
    },
  });

  useEffect(() => {
    //
    async function fetchUserInfo() {
      const data = await Api.auth.getMe();
      const [firstname, lastname] = data.fullName.split(' ');

      form.setValue('firstname', firstname);
      form.setValue('email', data.email || '');
      form.setValue('lastname', lastname);
      form.setValue('phone', data.phone || '');
      form.setValue('address', data.address || '');
    }

    if (session) {
      fetchUserInfo();
    }
    //
  }, [session]);

  const onSubmit: SubmitHandler<CheckoutFormValues> = async (data: CheckoutFormValues) => {
    try {
      setSubmitting(true);
      const url = await createOrder(data);

      toast.success('Заказ успешно оформлен! Перейдите по ссылке для оплаты: ', {
        icon: '✅',
      });

      if (!url) {
        toast.error('Не удалось создать платёжную сессию. Попробуйте ещё раз.');
        setSubmitting(false);
        return;
      }

      toast.success('Перенаправляем на страницу оплаты…');
      window.location.href = url;
    } catch (error) {
      toast.error('Произошла ошибка при оформлении заказа', {
        icon: '❌',
      });
      console.log(error);
      setSubmitting(false);
    }

    // console.log(data);
    // createOrder(data);
  };

  const onSubmitCash: SubmitHandler<CheckoutFormValues> = async (data: CheckoutFormValues) => {
    try {
      setSubmitting(true);

      const res = await createCashOrder(data);

      if (!res?.success) {
        toast.error('Не удалось щформить заказ без оплаты. Попробуйте ещё раз.', { icon: '❌' });
        setSubmitting(false);
        return;
      }

      toast.success('Заказ успешно оформлен! Мы уже начинаем готовить ваш заказ!', { icon: '✅' });

      window.location.href = '/success';
    } catch (error) {
      console.log(error);
      toast.error('Произошла ошибка при оформлении заказа', {
        icon: '❌',
      });
      setSubmitting(false);
    }
  };

  return (
    <div className={cn('mt-10 pb-40')}>
      <Title text="Оформление заказа" size="xl" className="mb-8" />

      <FormProvider {...form}>
        {/*  */}
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {/*  */}
          <div className=" grid grid-cols-1 lg:grid-cols-3 gap-10  ">
            {/* left block - top block */}
            <div className="flex flex-col gap-10 flex-1 lg:col-span-2 sm:col-span-2 ">
              {/*  */}
              <CheckoutCart
                items={items}
                loading={loading}
                removeCartItem={removeCartItem}
                changeItemCount={changeItemCount}
                className={`${loading || (submitting && 'opacity-40 pointer-events-none')}`}
              />

              {/* TODO: Add block recommendation */}

              {/*  */}
              <CheckoutPersanalInfo
                className={`${loading || (submitting && 'opacity-40 pointer-events-none')}`}
              />

              {/* */}
              <CheckoutAdressForm
                className={`${loading || (submitting && 'opacity-40 pointer-events-none')}`}
              />
            </div>

            {/* right block - subblock */}
            <div className="flex flex-col gap-10 flex-1 lg:col-span-1 sm:col-span-2 ">
              {/*  */}
              <CheckoutSidebar
                onSubmitCash={form.handleSubmit(onSubmitCash)}
                totalAmount={totalAmount}
                loading={loading || submitting}
                className={`${loading || (submitting && 'opacity-40 pointer-events-none')}`}
              />
              {/*  */}
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
