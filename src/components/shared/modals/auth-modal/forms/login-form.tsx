'use client';
import { Title } from '@/components/shared/title';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import React from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

import { FormInput } from '@/components/shared/form/form-input';
import { signIn } from 'next-auth/react';
import { formLoginSchema, TFormLoginValues } from './schemas';

interface Props {
  onClose?: VoidFunction;
  onBusyChange?: (busy: boolean) => void;
}

export const LoginForm: React.FC<Props> = ({ onClose, onBusyChange }) => {
  const form = useForm<TFormLoginValues>({
    resolver: zodResolver(formLoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: TFormLoginValues) => {
    try {
      onBusyChange?.(true);
      const resp = await signIn('credentials', {
        ...data,
        redirect: false,
      });

      if (!resp?.ok) {
        // throw Error();
        return toast.error('Email o password errate', {
          icon: '❌',
        });
      }

      toast.success("Hai effettuato correttamente l'accesso al tuo account.", {
        icon: '✅',
      });

      onClose?.();
      onBusyChange?.(false);
    } catch (error) {
      console.log('Error [LOGIN]', error);
      toast.error("Impossibile effettuare l'accesso", {
        icon: '❌',
      });
    } finally {
      onBusyChange?.(false);
    }
  };

  return (
    <FormProvider {...form}>
      <form className="flex flex-col gap-5" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex justify-between items-center">
          <div className="mr-2">
            <Title text="Вход в аккаунт" size="md" className="font-bold" />
            <p className="text-gray-400">Введите свою почту, чтобы войти в свой аккаунт</p>
          </div>
          <Image src="/assets/images/phone-icon.png" alt="Иконка телефона" width={60} height={60} />
        </div>

        <FormInput name="email" label="E-Mail" required />
        <FormInput type="password" name="password" label="Пароль" required />

        <Button disabled={form.formState.isSubmitting} className="h-12 text-base" type="submit">
          {form.formState.isSubmitting ? 'Вход...' : 'Войти'}
        </Button>
      </form>
    </FormProvider>
  );
};
