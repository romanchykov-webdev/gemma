'use client';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { SlidersHorizontal } from 'lucide-react';
import React, { JSX, useState } from 'react';
import { Button } from '../ui';
import { LazyFilters } from './lazy-filters';

interface IFilterDrawerProps {
  // className?: string;
  children?: React.ReactNode;
}

export const FilterDrawer: React.FC<React.PropsWithChildren<IFilterDrawerProps>> = ({
  // className,
  children,
}): JSX.Element => {
  //
  const [isOpen, setIsOpen] = useState(false);
  // console.log("FilterDrawer isOpen", isOpen);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
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
          <VisuallyHidden>
            <SheetDescription>Filter products by ingredients, sizes, and price</SheetDescription>
          </VisuallyHidden>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto scrollbar pr-12 pb-6">
          <LazyFilters enabled={isOpen} />
        </div>
      </SheetContent>
    </Sheet>
  );
};
