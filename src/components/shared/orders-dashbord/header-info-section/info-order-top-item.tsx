import { cn } from '@/lib/utils';
import Image from 'next/image';
import React, { JSX } from 'react';

interface Props {
  className?: string;
  bgColor?: string;
  topText?: string;
  topTextColor?: string;
  bottomTextColor?: string;
  bottomText?: string;
  imageUrl?: string;
}

export const InfoOrderTopItem: React.FC<Props> = ({
  className,
  bgColor,
  topTextColor,
  topText,
  bottomTextColor,
  bottomText,
  imageUrl,
}): JSX.Element => {
  return (
    <div
      className={cn(
        'rounded-lg py-5 px-5 shadow-md flex flex-col items-center justify-center gap-3 w-full',
        className,
      )}
      style={{ backgroundColor: bgColor }}
    >
      <div className="grid grid-cols-4 gap-5">
        {/* image */}
        <div className="col-span-1 flex items-center justify-center">
          <Image src={imageUrl || ''} alt="top-product" width={50} height={50} />
        </div>
        {/* text */}
        <div className="col-span-3">
          <h4 className={cn('text-2xl font-bold')} style={{ color: topTextColor }}>
            {topText}
          </h4>
          <h5 className={cn('text-lg ', bottomTextColor)} style={{ color: bottomTextColor }}>
            {bottomText}
          </h5>
        </div>
      </div>
    </div>
  );
};
