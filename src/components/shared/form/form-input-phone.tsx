'use client';

import { cn } from '@/lib/utils';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { IMaskInput } from 'react-imask';
import { ClearButton } from '../clear-button';
import { ErrorText } from '../error-text';
import { RequiredSymbol } from '../required-symbol';

interface IFormInputPhoneProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label: string;
  required?: boolean;
  className?: string;
  placeholder?: string;
}

export const FormInputPhone: React.FC<IFormInputPhoneProps> = ({
  name,
  label,
  required,
  className,
  placeholder = '000 000 0000', // итальянский формат по умолчанию
  ...props
}) => {
  const {
    control,
    formState: { errors },
    setValue,
    watch,
  } = useFormContext();

  const value = watch(name);
  const errorText = errors[name]?.message as string | undefined;

  const clearField = () => setValue(name, '', { shouldValidate: true, shouldDirty: true });

  return (
    <div className={cn('', className)}>
      {label && (
        <p className="font-medium mb-2">
          {label}
          {required && <RequiredSymbol />}
        </p>
      )}

      <div className="relative">
        <Controller
          name={name}
          control={control}
          render={({ field: { onChange, onBlur, ref, value } }) => (
            <IMaskInput
              mask="000 000 0000"
              unmask={true}
              onAccept={(val: string) => onChange(val)}
              onBlur={onBlur}
              inputRef={ref as unknown as React.RefObject<HTMLInputElement>}
              value={value ?? ''}
              inputMode="numeric"
              autoComplete="tel"
              placeholder={placeholder}
              className={cn(
                'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-13 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-brand-primary/20 focus-visible:ring-brand-primary/30 focus-visible:ring-[2px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
                className,
              )}
              {...props}
            />
          )}
        />

        {!!value && <ClearButton onClick={clearField} />}
      </div>

      {errorText && <ErrorText text={errorText} className="mt-2" />}
    </div>
  );
};
