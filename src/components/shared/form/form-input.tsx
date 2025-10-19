'use client';
import { Input } from '@/components/ui/input';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { ClearButton } from '../clear-button';
import { ErrorText } from '../error-text';
import { RequiredSymbol } from '../required-symbol';

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label?: string;
  required?: boolean;
  className?: string;
}

export const FormInput: React.FC<Props> = ({ className, name, label, required, ...props }) => {
  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = useFormContext();

  const [showPassword, setShowPassword] = useState(false);
  const errotText = errors?.[name]?.message as string;

  const text = watch(name);

  const onClickClear = () => {
    setValue(name, '', { shouldValidate: true });
  };

  const onToggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={className}>
      {label && (
        <p className="font-medium mb-2">
          {label} {required && <RequiredSymbol />}
        </p>
      )}

      <div className="relative">
        <div className="flex items-center  ">
          {props.type === 'password' && (
            <div onClick={onToggleShowPassword}>
              {showPassword ? (
                <EyeIcon className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500" />
              ) : (
                <EyeOffIcon className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500" />
              )}
            </div>
          )}

          <Input className=" text-md" {...register(name)} {...props} showPassword={showPassword} />
        </div>

        {Boolean(text) && <ClearButton onClick={onClickClear} />}
      </div>

      {errotText && <ErrorText text={errotText} />}
    </div>
  );
};
