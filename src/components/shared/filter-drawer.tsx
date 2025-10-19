'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { SlidersHorizontal } from 'lucide-react';
import React, { JSX } from 'react';
import { Button } from '../ui';
import { Filters } from './filters';

interface IFilterDrawerProps {
  // className?: string;
  children?: React.ReactNode;
}

export const FilterDrawer: React.FC<React.PropsWithChildren<IFilterDrawerProps>> = ({
  // className,
  children,
}): JSX.Element => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        {children || (
          <Button variant="outline" size="icon" className="lg:hidden">
            <SlidersHorizontal className="h-5 w-5" />
          </Button>
        )}
      </SheetTrigger>
      <SheetContent
        side="left"
        className="flex flex-col justify-between pb-0 bg-white sm:max-w-md w-full pl-6 overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle></SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto scrollbar pr-12 pb-6">
          <Filters />
        </div>
      </SheetContent>
    </Sheet>
  );
};
