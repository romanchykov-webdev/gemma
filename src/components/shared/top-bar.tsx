'use client';
import { Categories } from '@/components/shared/categories';
import { Container } from '@/components/shared/container';
import { CategoryWithProducts } from '@/lib';
import { cn } from '@/lib/utils';
import React, { JSX } from 'react';

interface ITopBarProps {
  className?: string;
  categories: CategoryWithProducts[];
}

export const TopBar: React.FC<ITopBarProps> = ({ categories, className }): JSX.Element => {
  return (
    <div
      className={cn(
        'sticky top-0 py-5 bg-white shadow-lg shadow-black/5 z-10 overflow-x-auto  ',
        className,
      )}
    >
      <Container className="flex items-center justify-between ">
        <Categories items={categories} />
        <div className="flex items-center">
          {/* <SortPopup value="none" onChange={() => {}} /> */}
        </div>
      </Container>
    </div>
  );
};
