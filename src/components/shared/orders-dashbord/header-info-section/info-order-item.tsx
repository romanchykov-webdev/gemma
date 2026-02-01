import { cn } from '@/lib/utils';
import React, { JSX } from 'react';

interface Props {
  className?: string;
  bgColor?: string;
  topText?: string;
  topTextColor?: string;
  bottomTextColor?: string;
  bottomText?: string;
}

export const InfoOrderItem: React.FC<Props> = ({
  className,
  bgColor,
  topTextColor,
  topText,
  bottomTextColor,
  bottomText,
}): JSX.Element => {
  return (
    <div
      className={cn(
        'rounded-lg py-5 px-5 shadow-md flex flex-col items-center justify-center gap-3 w-full',
        className,
      )}
      style={{ backgroundColor: bgColor }}
    >
      <h4 className={cn('text-4xl font-bold')} style={{ color: topTextColor }}>
        {`${topText}`}
      </h4>
      <h5 className={cn('text-lg', bottomTextColor)} style={{ color: bottomTextColor }}>
        {bottomText}
      </h5>
    </div>
  );
};
