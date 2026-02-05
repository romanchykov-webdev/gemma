'use client';
import { updateOrderStatus } from '@/app/actions/orders';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { OrderStatus } from '@prisma/client';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import React, { JSX, useTransition } from 'react';
import toast from 'react-hot-toast';

// 📦 Типы для ингредиентов
interface OrderIngredient {
  id: number;
  name: string;
  price?: number;
}

// 📦 Типы для элемента заказа
interface OrderProduct {
  quantity: number;
  productName: string;
  productId?: number;
  category?: string; // Категория продукта
  size?: string;
  type?: string;
  price: number;
  addedIngredients?: OrderIngredient[];
  removedIngredients?: OrderIngredient[];
}

// 📦 Типы для Prisma CartItem (формат из БД)
interface PrismaCartItem {
  id: string;
  productId: number;
  variantId: number;
  quantity: number;
  addedIngredientIds?: number[];
  removedBaseIngredientIds?: number[];
  product?: {
    id: number;
    name: string;
    imageUrl?: string;
    variants?: Array<{ variantId: number; price: number; sizeId?: number; typeId?: number }>;
    baseIngredients?: Array<{ id: number; name: string; price?: number }>;
    category?: {
      id: number;
      name: string;
    };
  };
  ingredients?: OrderIngredient[];
}

// 📦 Типы для структуры заказа (может быть массив или объект с категориями)
type OrderItems =
  | OrderProduct[]
  | Record<string, OrderProduct[]>
  | Record<string, unknown>
  | unknown[]
  | PrismaCartItem[];

interface OrderItemData {
  id: string;
  status: OrderStatus;
  totalAmount: number;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  comment?: string | null;
  paymentId?: string | null;
  items: OrderItems;
  createdAt: Date;
}

interface Props {
  order: OrderItemData;
  className?: string;
}

// 🎨 Цвета статусов
const statusConfig = {
  PENDING: { label: '⏳ In attesa', color: 'bg-yellow-100 text-yellow-800' },
  SUCCEEDED: { label: '✅ Completato', color: 'bg-green-100 text-green-800' },
  CANCELLED: { label: '❌ Annullato', color: 'bg-red-100 text-red-800' },
};

export const OrderItem: React.FC<Props> = ({ order, className }): JSX.Element => {
  const statusInfo = statusConfig[order.status];
  const [isPending, startTransition] = useTransition();

  // 🔄 Обработчик изменения статуса заказа
  const handleStatusChange = (newStatus: OrderStatus) => {
    startTransition(async () => {
      const result = await updateOrderStatus(order.id, newStatus);
      if (result.success) {
        toast.success('Stato aggiornato con successo');
      } else {
        toast.error(`Errore: ${result.error}`);
      }
    });
  };

  // 🐛 Отладка: выводим структуру items
  // console.log('📦 Order ID:', order.id.slice(0, 8));
  // console.log('📦 Order items:', JSON.stringify(order.items, null, 2));

  return (
    <div className={cn('bg-white rounded-lg shadow-md p-6 mb-4 border border-gray-200', className)}>
      {/* 📋 Заголовок заказа */}
      <div className="flex flex-col sm:flex-row justify-between items-start mb-4 pb-4 border-b gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            🛵 ORDINE: {order.paymentId ? 'CONSEGNA' : 'Asporto'}
          </h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p>📅 Data: {format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm', { locale: it })}</p>
            <p>
              🆔 ID: <span className="font-mono">{order.id.slice(0, 8)}</span>
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className={cn('px-3 py-1 rounded-full text-sm font-semibold', statusInfo.color)}>
            {statusInfo.label}
          </span>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            💰 {Number(order.totalAmount).toFixed(2)} €
          </p>
          <p className="text-sm text-gray-600 mt-1">
            💳 {order.paymentId ? 'Pagato online' : 'Alla consegna'}
          </p>
        </div>
      </div>

      {/* 🍕 Состав заказа */}
      <div className="mb-4 pb-4 border-b">
        <h4 className="font-bold text-lg mb-3 text-gray-900">COMPOSIZIONE:</h4>
        <div className="space-y-4">{renderOrderItems(order.items)}</div>
      </div>

      {/* 👤 Информация о клиенте */}
      <div className="mb-4 pb-4 border-b">
        <h4 className="font-bold text-lg mb-3 text-gray-900">CLIENTE:</h4>
        <div className="space-y-2 text-gray-700">
          <p className="flex items-center">
            <span className="font-semibold mr-2">👤</span>
            {order.fullName}
          </p>
          <p className="flex items-center">
            <span className="font-semibold mr-2">📞</span>
            <a href={`tel:${order.phone}`} className="text-blue-600 hover:underline">
              {order.phone}
            </a>
          </p>
          <p className="flex items-center">
            <span className="font-semibold mr-2">✉️</span>
            <a href={`mailto:${order.email}`} className="text-blue-600 hover:underline">
              {order.email}
            </a>
          </p>
          <p className="flex items-start">
            <span className="font-semibold mr-2">🏠</span>
            <span>{order.address}</span>
          </p>
          {order.paymentId && order.address && (
            <p className="flex items-center ml-6">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                📍 Apri in Google Maps
              </a>
            </p>
          )}
          {order.comment && (
            <p className="flex items-start">
              <span className="font-semibold mr-2">💬</span>
              <span className="italic text-gray-600">{order.comment}</span>
            </p>
          )}
        </div>
      </div>

      {/* 🎛️ Кнопки управления статусом */}
      {order.status === 'PENDING' && (
        <div className="flex gap-2 flex-wrap items-center justify-between">
          <Button
            onClick={() => handleStatusChange('SUCCEEDED')}
            disabled={isPending}
            className="bg-green-600 hover:bg-green-700"
          >
            ✅ Pronto
          </Button>
          <Button
            variant="destructive"
            onClick={() => handleStatusChange('CANCELLED')}
            disabled={isPending}
          >
            ❌ Annullato
          </Button>
        </div>
      )}
    </div>
  );
};

// 🔧 Функция для проверки типа OrderProduct
function isOrderProduct(item: unknown): item is OrderProduct {
  return (
    typeof item === 'object' &&
    item !== null &&
    'quantity' in item &&
    'productName' in item &&
    'price' in item
  );
}

// 🔧 Функция для проверки типа PrismaCartItem
function isPrismaCartItem(item: unknown): item is PrismaCartItem {
  return (
    typeof item === 'object' &&
    item !== null &&
    'id' in item &&
    'productId' in item &&
    'variantId' in item &&
    'quantity' in item
  );
}

// 🔧 Функция для конвертации PrismaCartItem в OrderProduct
function convertPrismaCartItemToOrderProduct(item: PrismaCartItem): OrderProduct | null {
  if (!item.product) {
    console.warn('⚠️ Product data missing in cart item:', item.id);
    return null;
  }

  // Находим вариант продукта по variantId
  const size = '';
  const type = '';
  let price = 0;

  if (item.product.variants && Array.isArray(item.product.variants)) {
    const variant = item.product.variants.find(v => v.variantId === item.variantId);
    if (variant) {
      price = Number(variant.price) || 0;
      // Здесь можно добавить логику для получения размера и типа, если они хранятся в variants
    }
  }

  // Получаем категорию продукта
  const category = item.product.category?.name || 'Altro';

  // Получаем добавленные ингредиенты
  const addedIngredients = item.ingredients || [];

  // Получаем удаленные ингредиенты из baseIngredients
  const removedIngredients: OrderIngredient[] = [];
  if (item.product.baseIngredients && Array.isArray(item.product.baseIngredients)) {
    const removedIds = item.removedBaseIngredientIds || [];
    removedIds.forEach((id: number) => {
      const ingredient = item.product?.baseIngredients?.find(ing => ing.id === id);
      if (ingredient) {
        removedIngredients.push({
          id: ingredient.id,
          name: ingredient.name || 'Ingrediente',
          price: ingredient.price,
        });
      }
    });
  }

  return {
    quantity: item.quantity,
    productName: item.product.name,
    productId: item.productId,
    category,
    size,
    type,
    price,
    addedIngredients,
    removedIngredients,
  };
}

// 🔧 Функция для рендеринга состава заказа
function renderOrderItems(items: OrderItems): JSX.Element | JSX.Element[] {
  if (!items || typeof items !== 'object') {
    return <p className="text-gray-500">Состав не указан</p>;
  }

  // Если items это массив
  if (Array.isArray(items)) {
    // Проверяем формат данных - Prisma CartItem или OrderProduct
    if (items.length > 0 && isPrismaCartItem(items[0])) {
      console.log('🔄 Converting Prisma CartItems to OrderProducts');
      // Конвертируем Prisma CartItem в OrderProduct
      const convertedProducts = (items as PrismaCartItem[])
        .map(convertPrismaCartItemToOrderProduct)
        .filter((item): item is OrderProduct => item !== null);

      if (convertedProducts.length === 0) {
        return <p className="text-gray-500">Non ci sono prodotti da visualizzare.</p>;
      }

      // Группируем по категориям
      const groupedByCategory = convertedProducts.reduce(
        (acc, item) => {
          const category = item.category || 'Altro';
          if (!acc[category]) {
            acc[category] = [];
          }
          acc[category].push(item);
          return acc;
        },
        {} as Record<string, OrderProduct[]>,
      );

      // Рендерим по категориям
      return (
        <>
          {Object.entries(groupedByCategory).map(([category, products]) => (
            <div key={category} className="mb-4">
              <h5 className="font-bold text-orange-600 mb-2">🔸 {category.toUpperCase()}:</h5>
              {products.map((item, index) => (
                <div key={index} className="border-l-4 border-gray-300 pl-4 py-2 mb-2">
                  <div className="font-semibold text-gray-900">
                    • {item.quantity}x {item.productName}
                    {item.size && ` (${item.size})`}
                    {item.type && ` • ${item.type}`}
                    {item.price > 0 && (
                      <span className="ml-2 text-orange-600">
                        — {Number(item.price).toFixed(2)} €
                      </span>
                    )}
                  </div>

                  {/* Добавленные ингредиенты */}
                  {item.addedIngredients && item.addedIngredients.length > 0 && (
                    <div className="text-sm text-green-700 mt-1">
                      ✅ + Extra: {item.addedIngredients.map(ing => ing.name).join(', ')}
                    </div>
                  )}

                  {/* Удаленные ингредиенты */}
                  {item.removedIngredients && item.removedIngredients.length > 0 && (
                    <div className="text-sm text-red-700 mt-1">
                      ❌ - Senza: {item.removedIngredients.map(ing => ing.name).join(', ')}
                    </div>
                  )}

                  {index < products.length - 1 && (
                    <div className="border-b border-gray-200 mt-2"></div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </>
      );
    }

    // Обычный формат OrderProduct - тоже группируем по категориям если есть
    const validProducts = items.filter(isOrderProduct) as OrderProduct[];
    if (validProducts.length === 0) {
      return <p className="text-gray-500">Non ci sono prodotti da visualizzare.</p>;
    }

    // Проверяем, есть ли у товаров категории
    const hasCategories = validProducts.some(item => item.category);

    if (hasCategories) {
      // Группируем по категориям
      const groupedByCategory = validProducts.reduce(
        (acc, item) => {
          const category = item.category || 'Altro';
          if (!acc[category]) {
            acc[category] = [];
          }
          acc[category].push(item);
          return acc;
        },
        {} as Record<string, OrderProduct[]>,
      );

      return (
        <>
          {Object.entries(groupedByCategory).map(([category, products]) => (
            <div key={category} className="mb-4">
              <h5 className="font-bold text-orange-600 mb-2">🔸 {category.toUpperCase()}:</h5>
              {products.map((item, index) => (
                <div key={index} className="border-l-4 border-gray-300 pl-4 py-2 mb-2">
                  <div className="font-semibold text-gray-900">
                    • {item.quantity}x {item.productName}
                    {item.size && ` (${item.size})`}
                    {item.type && ` • ${item.type}`}
                    <span className="ml-2 text-orange-600">
                      — {Number(item.price).toFixed(2)} €
                    </span>
                  </div>

                  {item.addedIngredients && item.addedIngredients.length > 0 && (
                    <div className="text-sm text-green-700 mt-1">
                      ✅ + Extra: {item.addedIngredients.map(ing => ing.name).join(', ')}
                    </div>
                  )}

                  {item.removedIngredients && item.removedIngredients.length > 0 && (
                    <div className="text-sm text-red-700 mt-1">
                      ❌ - Senza: {item.removedIngredients.map(ing => ing.name).join(', ')}
                    </div>
                  )}

                  {index < products.length - 1 && (
                    <div className="border-b border-gray-200 mt-2"></div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </>
      );
    }

    // Без категорий - просто список
    return (
      <>
        {validProducts.map((item, index) => (
          <div key={index} className="border-l-4 border-orange-400 pl-4 py-2">
            <div className="font-semibold text-gray-900">
              • {item.quantity}x {item.productName}
              {item.size && ` (${item.size})`}
              {item.type && ` • ${item.type}`}
              <span className="ml-2 text-orange-600">— {Number(item.price).toFixed(2)} €</span>
            </div>

            {item.addedIngredients && item.addedIngredients.length > 0 && (
              <div className="text-sm text-green-700 mt-1">
                ✅ + Extra: {item.addedIngredients.map(ing => ing.name).join(', ')}
              </div>
            )}

            {item.removedIngredients && item.removedIngredients.length > 0 && (
              <div className="text-sm text-red-700 mt-1">
                ❌ - Senza: {item.removedIngredients.map(ing => ing.name).join(', ')}
              </div>
            )}
          </div>
        ))}
      </>
    );
  }

  // Если это объект со структурой по категориям
  const categoryEntries = Object.entries(items)
    .map(([category, products]) => {
      if (!Array.isArray(products)) return null;

      const validProducts = products.filter(isOrderProduct);
      if (validProducts.length === 0) return null;

      return (
        <div key={category} className="mb-3">
          <h5 className="font-bold text-orange-600 mb-2">🔸 {category.toUpperCase()}:</h5>
          {validProducts.map((item, index: number) => (
            <div key={index} className="border-l-4 border-gray-300 pl-4 py-2 mb-2">
              <div className="font-semibold text-gray-900">
                • {item.quantity}x {item.productName}
                {item.size && ` (${item.size})`}
                {item.type && ` • ${item.type}`}
                <span className="ml-2 text-orange-600">— {Number(item.price).toFixed(2)} €</span>
              </div>

              {item.addedIngredients && item.addedIngredients.length > 0 && (
                <div className="text-sm text-green-700 mt-1">
                  ✅ + Extra:{' '}
                  {item.addedIngredients.map((ing: OrderIngredient) => ing.name).join(', ')}
                </div>
              )}

              {item.removedIngredients && item.removedIngredients.length > 0 && (
                <div className="text-sm text-red-700 mt-1">
                  ❌ - Senza:{' '}
                  {item.removedIngredients.map((ing: OrderIngredient) => ing.name).join(', ')}
                </div>
              )}

              {index < validProducts.length - 1 && (
                <div className="border-b border-gray-200 mt-2"></div>
              )}
            </div>
          ))}
        </div>
      );
    })
    .filter((entry): entry is JSX.Element => entry !== null);

  return <>{categoryEntries}</>;
}
