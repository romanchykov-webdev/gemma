'use client';

import { OrderFromDB } from '@/@types/orders';
import React, { useState } from 'react';
import { OrdersBlock } from '../orders-section/orders-block';
import { StatusSearchDataSection } from './status-search-data-section';

type StatusFilter = 'ALL' | 'PENDING' | 'SUCCEEDED';

interface Props {
  date: string;
  statusCounts: {
    all: number;
    pending: number;
    succeeded: number;
  };
  orders: OrderFromDB[];
}

// 🔧 Wrapper: статус и поиск — клиентский state, без запросов при переключении Tutti/In attesa/Pronti
export const OrdersClientWrapper: React.FC<Props> = ({ date, statusCounts, orders }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [isLoading, setIsLoading] = useState(false);

  return (
    <>
      <StatusSearchDataSection
        date={date}
        statusCounts={statusCounts}
        activeStatus={statusFilter}
        onStatusChange={status => setStatusFilter(status as StatusFilter)}
        onSearchChange={setSearchQuery}
        onLoadingChange={setIsLoading}
      />

      <OrdersBlock
        orders={orders}
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        isLoading={isLoading}
      />
    </>
  );
};
