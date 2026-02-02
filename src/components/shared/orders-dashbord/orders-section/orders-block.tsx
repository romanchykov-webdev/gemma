'use client';
import { OrderFromDB } from '@/@types/orders';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import React, { JSX, useMemo } from 'react';
import { OrderItem } from './order-item';

type StatusFilter = 'ALL' | 'PENDING' | 'SUCCEEDED';

interface Props {
  className?: string;
  orders: OrderFromDB[];
  searchQuery?: string;
  statusFilter?: StatusFilter;
  isLoading?: boolean;
}

// 📋 Отрисовка списка: фильтрация по статусу и поиску только на клиенте
export const OrdersBlock: React.FC<Props> = ({
  className,
  orders,
  searchQuery: externalSearchQuery = '',
  statusFilter = 'ALL',
  isLoading = false,
}): JSX.Element => {
  const searchQuery = externalSearchQuery;

  // 🔍 Клиентская фильтрация: сначала по статусу, затем по поиску
  const filteredOrders = useMemo(() => {
    let list = orders;

    if (statusFilter !== 'ALL') {
      list = list.filter(order => order.status === statusFilter);
    }

    if (searchQuery && searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase().trim();
      list = list.filter(
        order =>
          order.fullName.toLowerCase().includes(query) ||
          order.phone.includes(query) ||
          order.email.toLowerCase().includes(query) ||
          order.id.toLowerCase().includes(query),
      );
    }

    return list;
  }, [orders, statusFilter, searchQuery]);

  // 🔄 Лоадер во время загрузки
  if (isLoading) {
    return (
      <div className={cn('mt-10 mb-10', className)}>
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <Loader2 className="w-12 h-12 animate-spin text-brand-primary mb-4" />
          <p className="text-xl font-semibold">Caricamento ordini...</p>
          <p className="text-sm mt-2">Attendere prego</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('mt-10 mb-10', className)}>
      {filteredOrders.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <p className="text-xl">📭 Nessun ordine trovato</p>
          <p className="text-sm mt-2">
            {searchQuery
              ? 'Prova a modificare la ricerca'
              : 'Prova a modificare i filtri di ricerca'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => (
            <OrderItem
              key={order.id}
              order={{
                ...order,
                totalAmount: Number(order.totalAmount),
                items: order.items as Record<string, unknown> | unknown[],
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
