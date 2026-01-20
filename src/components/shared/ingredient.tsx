import { cn } from '@/lib/utils';
import { CircleCheck } from 'lucide-react';
import Image from 'next/image';
import React, { JSX } from 'react';

interface Props {
  imageUrl: string;
  name: string;
  price: number;
  active?: boolean;
  onClick?: () => void;
  removable?: boolean; // ✅ можно ли удалить (для базовых ингредиентов)
  className?: string;
}

export const Ingredient: React.FC<Props> = ({
  imageUrl,
  name,
  price,
  active,
  onClick,
  removable = true, // ✅ по умолчанию можно взаимодействовать
  className,
}): JSX.Element => {
  return (
    <div
      onClick={removable ? onClick : undefined}
      className={cn(
        'flex items-center flex-col p-1 rounded-md text-center relative shadow-md bg-white border border-transparent',
        {
          // ✅ Всегда зеленая рамка при active (независимо от режима)
          'border border-brand-primary': active,
          // ✅ Если нельзя удалить/добавить - делаем полупрозрачным
          'opacity-50 cursor-not-allowed': !removable,
          // ✅ Если можно взаимодействовать - показываем курсор
          'cursor-pointer': removable,
        },
        className,
      )}
    >
      {/* ✅ Всегда зеленая галочка при active */}
      {active && removable && <CircleCheck className="absolute top-2 right-2 text-brand-primary" />}

      <Image
        src={imageUrl}
        alt={name}
        width={110}
        height={110}
        loading="lazy"
        quality={70}
        className="object-contain"
        fetchPriority="low"
      />
      <span className="text-xs mb-1">{name}</span>
      <span className="font-bold">{price} €</span>
    </div>
  );
};
