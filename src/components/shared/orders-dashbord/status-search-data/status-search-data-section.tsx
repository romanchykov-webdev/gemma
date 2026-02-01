'use client';
import { cn } from '@/lib/utils';
import React, { JSX } from 'react';
import { DataBlock, SearchBlock, StatusBlock } from '.';

interface Props {
  className?: string;
}

export const StatusSearchDataSection: React.FC<Props> = ({ className }): JSX.Element => {
  return (
    <div className={cn('mt-10 mb-10 w-full', className)}>
      <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
        {/* блок статусов */}
        <div className="w-full lg:flex-1">
          <StatusBlock tuttiCount={84} inAttesaCount={12} completatiCount={72} />
        </div>

        {/* Блок поиска и даты */}
        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
          {/* SearchBlock растягивается и занимает всё доступное пространство */}
          <div className="flex-1 w-full sm:w-auto">
            <SearchBlock onSearch={value => console.log(value)} />
          </div>
          {/* DataBlock фиксированной ширины */}
          <div className="w-full sm:w-auto sm:flex-shrink-0">
            <DataBlock onClick={() => console.log('Calendar clicked')} />
          </div>
        </div>
      </div>
    </div>
  );
};
