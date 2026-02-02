// 📦 Типы для системы управления заказами

export type OrderStatus = 'PENDING' | 'SUCCEEDED' | 'CANCELLED';

export type OrderFilters = {
  status?: 'ALL' | OrderStatus;
  date?: string; // ISO формат YYYY-MM-DD
};

export type OrderStats = {
  totalRevenue: number;
  totalOrders: number;
  averageCheck: number;
  topProduct: {
    name: string;
    imageUrl: string;
    count: number;
  } | null;
  statusCounts: {
    all: number;
    pending: number;
    succeeded: number;
  };
};

// 📦 Типы для заказа из БД
export type OrderFromDB = {
  id: string;
  status: OrderStatus;
  totalAmount: number;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  comment: string | null;
  paymentId: string | null;
  items: unknown;
  createdAt: Date;
};
