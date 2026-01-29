'use client';
import { Title } from '@/components/shared';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';

import { createCashOrder, createOrder } from '@/app/actions';
import { CheckoutSidebar } from '@/components/shared/checkout-sidebar';
import { CheckoutCart } from '@/components/shared/checkout/checkout-cart';
import { CheckoutDeliveryForm } from '@/components/shared/checkout/checkout-delivery-form';
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

// TODO: добавить блок с промокодами

export default function CheckoutPage() {
  //
  const [submitting, setSubmitting] = useState(false);

  const { data: session } = useSession();

  const { totalAmount, items, loading, syncing, removeCartItem, changeItemCount, refetchCart } =
    useCart();

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      email: '',
      firstname: '',
      lastname: '',
      phone: '',
      deliveryType: 'delivery',
      address: '',
      comment: '',
    },
  });

  useEffect(() => {
    // console.log("🔄 Checkout mounted - syncing cart with server...");
    refetchCart();
  }, [refetchCart]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  // Вспомогательная функция подготовки данных для опредиления способа доставки
  const prepareOrderData = (data: CheckoutFormValues): CheckoutFormValues => {
    return {
      ...data,
      address: data.deliveryType === 'pickup' ? 'Asporto' : data.address!.trim(),
    };
  };

  const onSubmit: SubmitHandler<CheckoutFormValues> = async (data: CheckoutFormValues) => {
    try {
      setSubmitting(true);

      // ✅ Проверка перед отправкой
      const finalData = prepareOrderData(data);

      // 🧪 ТЕСТИРОВАНИЕ: Вывод в консоль
      // console.log('=== ТЕСТИРОВАНИЕ ОТПРАВКИ ФОРМЫ (ОНЛАЙН ОПЛАТА) ===');
      // console.log('📦 Исходные данные:', data);
      // console.log('✅ Подготовленные данные:', finalData);
      // console.log('📍 Адрес:', finalData.address);
      // console.log('🚚 Тип доставки:', finalData.deliveryType);
      // console.log('================================================');

      const url = await createOrder(finalData);

      toast.success('Ordine effettuato con successo! Vai al link per il pagamento: ', {
        icon: '✅',
      });

      if (!url) {
        toast.error('Impossibile creare la sessione di pagamento. Riprova.');
        setSubmitting(false);
        return;
      }

      toast.success('Reindirizziamo alla pagina di pagamento…');
      window.location.href = url;

      // ✅ ДОБАВИТЬ для тестирования
      // setSubmitting(false);
      // toast.success('Тестирование: данные выведены в консоль! ✅');
      //
    } catch (error) {
      toast.error("Si è verificato un errore durante l'ordine", {
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

      // ✅ Проверка перед отправкой
      const finalData = prepareOrderData(data);

      // 🧪 ТЕСТИРОВАНИЕ: Вывод в консоль
      // console.log('=== ТЕСТИРОВАНИЕ ОТПРАВКИ ФОРМЫ (ОПЛАТА НАЛИЧНЫМИ) ===');
      // console.log('📦 Исходные данные:', data);
      // console.log('✅ Подготовленные данные:', finalData);
      // console.log('📍 Адрес:', finalData.address);
      // console.log('🚚 Тип доставки:', finalData.deliveryType);
      // console.log('💰 Способ оплаты: Наличными');
      // console.log('======================================================');

      const res = await createCashOrder(finalData);

      if (!res?.success) {
        toast.error("Impossibile creare l'ordine senza pagamento. Riprova.", { icon: '❌' });
        setSubmitting(false);
        return;
      }

      toast.success('Ordine effettuato con successo! Stiamo già preparando il tuo ordine!', {
        icon: '✅',
      });

      window.location.href = '/success';
      // ✅ ДОБАВИТЬ для тестирования
      // setSubmitting(false);
      // toast.success('Тестирование: данные выведены в консоль! ✅');
      //
    } catch (error) {
      console.log(error);
      toast.error("Si è verificato un errore durante l'ordine", {
        icon: '❌',
      });
      setSubmitting(false);
    }
  };

  const disabledClassName = cn((loading || submitting) && 'opacity-40 pointer-events-none');
  // console.log('🔄 items:', JSON.stringify(items, null, 2));
  // console.log('rerender checkout page');
  return (
    <div className={cn('mt-10 pb-40')}>
      <Title text="Ordine" size="xl" className="mb-8" />

      <FormProvider {...form}>
        {/*  */}
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {/*  */}
          <div className=" grid grid-cols-1 lg:grid-cols-3 gap-10  ">
            {/* left block - top block */}
            <div className="flex flex-col gap-10 flex-1 lg:col-span-2 sm:col-span-2 ">
              {/* вывод корзины */}
              <CheckoutCart
                items={items}
                loading={loading}
                removeCartItem={removeCartItem}
                changeItemCount={changeItemCount}
                className={disabledClassName}
              />

              {/* TODO: Add block recommendation ------------------------------------------------------------*/}

              {/*  */}
              <CheckoutPersanalInfo className={disabledClassName} />

              {/* */}
              <CheckoutDeliveryForm className={disabledClassName} />
            </div>

            {/* right block - subblock */}
            <div className="flex flex-col gap-10 flex-1 lg:col-span-1 sm:col-span-2 ">
              {/*  */}
              <CheckoutSidebar
                onSubmitCash={form.handleSubmit(onSubmitCash)}
                totalAmount={totalAmount}
                loading={loading || submitting}
                syncing={syncing}
                className={disabledClassName}
                deliveryType={form.getValues('deliveryType')}
              />
              {/*  */}
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
