'use client';

import { OrderCard } from '@/app/(dashboard)/dashboard/components/shared/orders/order-card';
import { useOrders } from '@/app/(dashboard)/dashboard/hooks/use-orders';
import { Package } from 'lucide-react';

export const OrdersView = () => {
  const { orders, loading } = useOrders();

  if (loading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  return (
    <div className="space-y-4 mt-8">
      <h1>OrdersView</h1>
      {orders.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p>Nessun ordine trovato</p>
        </div>
      ) : (
        orders.map(order => (
          <OrderCard
            key={order.id}
            order={order}
            isExpanded={false}
            onToggleExpand={() => {}}
            onStatusChange={async () => {}}
            onDelete={async () => {}}
            isLoading={false}
            // readOnly
          />
        ))
      )}
    </div>
  );
};
