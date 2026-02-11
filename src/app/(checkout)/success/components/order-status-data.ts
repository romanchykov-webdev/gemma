import { OrderStatus } from '@prisma/client';

export type OrderItemDTO = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  sizeName?: string; // Например: "Grande"
  typeName?: string; // Например: "Sottile"
  // Добавленные ингредиенты (с ценой)
  ingredients?: Array<{
    id: number;
    name: string;
    price: number;
  }>;
  // Убранные ингредиенты (без цены)
  removedIngredients?: Array<{
    name: string;
  }>;
};

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
  items: OrderItemDTO[];
  storeInfo: {
    storeName: string;
    phone: string;
    address: string;
    email: string;
    workingHours: {
      monday: string;
      tuesday: string;
      wednesday: string;
      thursday: string;
      friday: string;
      saturday: string;
      sunday: string;
    };
  };
};
