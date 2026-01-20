'use client';

import { registerUser } from '@/app/actions';
import { FormInput } from '@/components/shared/form/form-input';
import { Button } from '@/components/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FormProvider, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { formRegisterSchema, TFormRegisterValues } from './schemas';

interface Props {
  onClose?: VoidFunction;
  // onClickLogin?: VoidFunction;
  onBusyChange?: (busy: boolean) => void;
}

export const RegisterForm: React.FC<Props> = ({ onClose, onBusyChange }) => {
  //
  const router = useRouter();

  const form = useForm<TFormRegisterValues>({
    resolver: zodResolver(formRegisterSchema),
    defaultValues: {
      email: '',
      fullName: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: TFormRegisterValues) => {
    try {
      onBusyChange?.(true);

      const res = await registerUser({
        email: data.email,
        fullName: data.fullName,
        password: data.password,
      });

      if (!res?.success) throw new Error(res?.error || 'Registration failed');

      // автологин по credentials (без редиректа)
      const resp = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (!resp?.ok) throw new Error('Auto login failed');

      toast.success(
        "Registrazione avvenuta con successo. Hai effettuato l'accesso al tuo account. ✅",
      );
      router.refresh();
      onClose?.();
    } catch (error) {
      console.log(error);
      onBusyChange?.(false);
      return toast.error('Email o password errate', {
        icon: '❌',
      });
    } finally {
      onBusyChange?.(false);
    }
  };

  //   console.log(form.formState);

  return (
    <>
      <FormProvider {...form}>
        <form className="flex flex-col gap-5" onSubmit={form.handleSubmit(onSubmit)}>
          <FormInput name="email" label="E-Mail" required />
          <FormInput name="fullName" label="Полное имя" required />
          <FormInput name="password" label="Пароль" type="password" required />
          <FormInput name="confirmPassword" label="Подтвердите пароль" type="password" required />

          <Button disabled={form.formState.isSubmitting} className="h-12 text-base" type="submit">
            Зарегистрироваться
          </Button>
        </form>
      </FormProvider>
    </>
  );
};
