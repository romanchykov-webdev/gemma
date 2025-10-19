'use client';
import { updateUserInfo } from '@/app/actions';
import { zodResolver } from '@hookform/resolvers/zod';
import { User } from '@prisma/client';
import React, { JSX, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Button } from '../ui/button';
import { Container } from './container';
import { FormInput } from './form/form-input';
import { profileUpdateSchema, TProfileUpdateValues } from './modals/auth-modal/forms/schemas';

import { Loader2 } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { FormAddressAutocomplete } from './form/form-address-autocomplete';
import { FormInputPhone } from './form/form-input-phone';
import { Title } from './title';

interface Props {
  data: User;
  className?: string;
}

export const ProfileForm: React.FC<Props> = ({ className, data }): JSX.Element => {
  //

  const [isUpdating, setIsUpdating] = useState(false);

  const form = useForm<TProfileUpdateValues>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      fullName: data.fullName,
      phone: data.phone || '',
      address: data.address || '',
      email: data.email,
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: TProfileUpdateValues) => {
    try {
      setIsUpdating(true);
      await updateUserInfo({
        email: data.email,
        fullName: data.fullName,
        phone: data.phone || null,
        address: data.address || null,
        password: data.password,
      });

      toast.error('Данные обновлены 📝', {
        icon: '✅',
      });
      setIsUpdating(false);
    } catch (error) {
      console.log(error);
      setIsUpdating(false);
      return toast.error('Ошибка при обновлении данных', {
        icon: '❌',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  //
  const onClickSignOut = async () => {
    setIsUpdating(true);
    await new Promise(r => setTimeout(r, 1000));
    await signOut({ callbackUrl: '/', redirect: true });
  };
  //
  return (
    <Container className="my-10   flex flex-col items-center relative">
      {isUpdating && (
        <div className="absolute inset-0 z-[100] bg-white/70 backdrop-blur-sm flex items-center justify-center">
          <Loader2 className="text-yellow-500 animate-spin" size={50} />
        </div>
      )}
      {/* <Title text={`Личные данные ÷| #${data.id}`} size="md" className="font-bold" /> */}
      <Title text={`Личные данные`} size="md" className="font-bold" />

      <FormProvider {...form}>
        <form
          className="flex flex-col gap-5 max-w-96 w-full mt-10"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormInput name="email" label="E-Mail" required />
          <FormInput name="fullName" label="Полное имя" required />

          <FormInputPhone
            name="phone"
            className="text-base "
            placeholder="Телефон"
            label="Телефон"
          />
          <FormAddressAutocomplete
            name="address"
            className="text-base "
            placeholder="Адрес"
            label="Адрес"
          />

          <FormInput type="password" name="password" label="Новый пароль" />
          <FormInput type="password" name="confirmPassword" label="Повторите пароль" />

          <Button disabled={form.formState.isSubmitting} className="text-base mt-10" type="submit">
            Сохранить
          </Button>

          <Button
            onClick={onClickSignOut}
            variant="secondary"
            disabled={form.formState.isSubmitting}
            className="text-base"
            type="button"
          >
            Выйти из аккаунта
          </Button>
        </form>
      </FormProvider>
    </Container>
  );
};
