import { cn } from '@/lib/utils';
import Image from 'next/image';
import React, { JSX } from 'react';

export type CSSVariables = React.CSSProperties & { ['--img']?: string };
interface Props {
  imageUrl: string;
  className?: string;
  size: number;
}

export const ProductImage: React.FC<Props> = ({ imageUrl, className, size }): JSX.Element => {
  // const imgPct = size === 20 ? "60%" : size === 30 ? "70%" : "80%";
  const imgPct = size === 20 ? '60%' : size === 30 ? '70%' : '80%';
  const imgSize = size === 20 ? 200 : size === 30 ? 220 : 250;
  return (
    <div
      className={cn('relative aspect-square mx-auto ', className)}
      style={{ ['--img']: imgPct } as CSSVariables}
    >
      <Image
        src={imageUrl}
        alt="Пицца"
        width={imgSize}
        height={imgSize}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 object-contain transition-all duration-500"
        loading="eager"
        quality={80}
      />
    </div>
  );
};
