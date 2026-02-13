import { OrderStatus } from '@prisma/client';

export type OrderItemDTO = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  sizeName?: string;
  typeName?: string;

  // Ингредиенты могут не прийти
  ingredients?: Array<{
    id: number;
    name: string;
    price: number;
  }>;
  removedIngredients?: Array<{
    name: string;
  }>;
};

export type OrderStatusData = {
  // 🛡️ Все поля опциональными для безопасности
  orderId?: string;
  status?: OrderStatus;
  expectedReadyAt?: string | null;
  readyAt?: string | null;
  createdAt?: string;
  fullName?: string;
  totalAmount?: number;
  deliveryType?: 'pickup' | 'delivery';
  address?: string | null;
  items?: OrderItemDTO[];

  // 🛡️ StoreInfo  тоже опционален
  storeInfo?: {
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
