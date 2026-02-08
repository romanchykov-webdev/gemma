import { OrderStatus } from '@prisma/client';

export type OrderStatusData = {
  orderId: string;
  status: OrderStatus;
  expectedReadyAt: string | null;
  readyAt: string | null;
  createdAt: string;
  fullName: string;
  totalAmount: number;
  deliveryType: 'pickup' | 'delivery';
  address: string | null;
};
