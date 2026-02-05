'use client';
import { cn } from '@/lib/utils';
import React, { JSX, useTransition } from 'react';
import { DataBlock, SearchBlock, StatusBlock } from '.';
import { useRouter, usePathname } from 'next/navigation';
import { format } from 'date-fns';

interface Props {
  className?: string;
  date: string;
  statusCounts: {
    all: number;
    pending: number;
    succeeded: number;
  };
  activeStatus: string;
  onStatusChange: (status: string) => void;
  onSearchChange?: (query: string) => void;
  onLoadingChange?: (loading: boolean) => void;
}

// 📅 Дата в URL → запрос; статус (Tutti/In attesa/Pronti) → только клиентская фильтрация
export const StatusSearchDataSection: React.FC<Props> = ({
  className,
  date,
  statusCounts,
  activeStatus,
  onStatusChange,
  onSearchChange,
  onLoadingChange,
}): JSX.Element => {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  React.useEffect(() => {
    if (onLoadingChange) {
      onLoadingChange(isPending);
    }
  }, [isPending, onLoadingChange]);

  // 🔄 Смена статуса — только state, без запроса
  const handleStatusChange = (status: string) => {
    onStatusChange(status);
  };

  // 📅 Смена даты — URL → один запрос на сервер
  const handleDateChange = (newDate: Date) => {
    startTransition(() => {
      const params = new URLSearchParams();
      params.set('date', format(newDate, 'yyyy-MM-dd'));
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleSearch = (value: string) => {
    if (onSearchChange) {
      onSearchChange(value);
    }
  };

  return (
    <div className={cn('mt-10 mb-10 w-full', className)}>
      <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
        <div className="w-full lg:flex-1">
          <StatusBlock
            activeStatus={activeStatus}
            onStatusChange={handleStatusChange}
            tuttiCount={statusCounts.all}
            inAttesaCount={statusCounts.pending}
            completatiCount={statusCounts.succeeded}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
          <div className="flex-1 w-full sm:w-auto">
            <SearchBlock onSearch={handleSearch} />
          </div>
          <div className="w-full sm:w-auto sm:flex-shrink-0">
            <DataBlock selectedDate={date} onDateChange={handleDateChange} />
          </div>
        </div>
      </div>
    </div>
  );
};
