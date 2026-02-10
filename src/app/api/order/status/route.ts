import { OrderItemDTO } from '@/app/(checkout)/success/components/order-status-data';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../prisma/prisma-client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// =====================================================================
// 🛠️ ТИПЫ ДЛЯ JSON СТРУКТУРЫ ИЗ БАЗЫ ДАННЫХ
// =====================================================================

interface StoredIngredient {
  id: number;
  name: string;
  price: number | string;
  imageUrl?: string;
}

interface StoredVariant {
  variantId?: number;
  id?: number;
  price: number | string;
  sizeId?: number;
  typeId?: number;
}

interface StoredProduct {
  id: number;
  name: string;
  imageUrl: string;
  price?: number | string;
  variants: StoredVariant[];
}

// Главный интерфейс элемента корзины в JSON
interface StoredCartItem {
  id: number | string;
  quantity: number;
  variantId: number;

  // Вложенные данные
  product: StoredProduct;
  ingredients?: StoredIngredient[];

  // Снэпшоты
  baseIngredientsSnapshot?: {
    id: number;
    name: string;
    isDisabled: boolean;
  }[];

  // Поля для совместимости (если вдруг в JSON попали старые данные)
  name?: string;
  price?: number;
  sizeName?: string;
  typeName?: string;
}

interface Size {
  id: number;
  name: string;
}
interface Type {
  id: number;
  name: string;
}

// =====================================================================
// 🔧 МАППЕР (BFF LOGIC)
// =====================================================================

function mapCartItemToDTO(item: StoredCartItem, sizes: Size[], types: Type[]): OrderItemDTO {
  // 1. Название (берем из продукта или фолбек)
  const name = item.product?.name || item.name || 'Товар без названия';

  // 2. Логика поиска Варианта (Цена, Размер, Тип)
  let price = 0;
  let sizeName = '';
  let typeName = '';

  // Проверяем наличие вариантов
  if (item.product?.variants && Array.isArray(item.product.variants)) {
    // Ищем вариант по variantId (учитываем оба возможных ключа)
    const foundVariant = item.product.variants.find(
      v => v.variantId === item.variantId || v.id === item.variantId,
    );

    if (foundVariant) {
      price = Number(foundVariant.price);

      // Ищем названия в справочниках
      const sizeObj = sizes.find(s => s.id === foundVariant.sizeId);
      const typeObj = types.find(t => t.id === foundVariant.typeId);

      if (sizeObj) sizeName = sizeObj.name;
      if (typeObj) typeName = typeObj.name;
    }
  }

  // Фолбек цены (если вариант не найден или цена 0)
  if (price === 0) {
    // Приводим к Number, так как может прийти строка
    price = Number(item.price || item.product?.price || 0);
  }

  // 3. Ингредиенты (Добавленные)
  const ingredients = Array.isArray(item.ingredients)
    ? item.ingredients.map(ing => ({
        id: ing.id,
        name: ing.name,
        price: Number(ing.price || 0),
      }))
    : [];

  // 4. Ингредиенты (Убранные)
  // Ищем в snapshot те, что отключены (isDisabled: true)
  let removedIngredients: { name: string }[] = [];

  if (Array.isArray(item.baseIngredientsSnapshot)) {
    removedIngredients = item.baseIngredientsSnapshot
      .filter(ing => ing.isDisabled === true)
      .map(ing => ({ name: ing.name }));
  }

  return {
    // Если id нет или он строка, генерируем числовой ID для React key
    id: typeof item.id === 'number' ? item.id : Math.floor(Math.random() * 1000000),
    name,
    price,
    quantity: item.quantity || 1,
    // Используем найденное имя или то, что было в JSON (legacy)
    sizeName: sizeName || item.sizeName,
    typeName: typeName || item.typeName,
    ingredients: ingredients.length > 0 ? ingredients : undefined,
    removedIngredients: removedIngredients.length > 0 ? removedIngredients : undefined,
  };
}

// =====================================================================
// 📊 API ROUTE HANDLER
// =====================================================================

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json({ error: 'orderId è richiesto' }, { status: 400 });
    }

    // 🔥 1. Параллельная загрузка данных (Order + Справочники)
    const [order, sizes, types] = await Promise.all([
      prisma.order.findUnique({
        where: { id: orderId },
        select: {
          id: true,
          status: true,
          expectedReadyAt: true,
          readyAt: true,
          createdAt: true,
          fullName: true,
          totalAmount: true,
          address: true,
          type: true,
          items: true, // Это поле типа Json
        },
      }),
      prisma.size.findMany(),
      prisma.type.findMany(),
    ]);

    if (!order) {
      return NextResponse.json({ error: 'Ordine non trovato' }, { status: 404 });
    }

    // Приведение типов: говорим TS, что в JSON лежит массив StoredCartItem
    const rawItems = (order.items as unknown as StoredCartItem[]) || [];

    // Маппинг данных (Enrichment)
    const mappedItems = rawItems.map(item => mapCartItemToDTO(item, sizes, types));

    const deliveryType = order.type === 'PICKUP' ? 'pickup' : 'delivery';

    return NextResponse.json({
      orderId: order.id,
      status: order.status,
      expectedReadyAt: order.expectedReadyAt,
      readyAt: order.readyAt,
      createdAt: order.createdAt,
      fullName: order.fullName,
      totalAmount: Number(order.totalAmount),
      address: order.address,
      deliveryType: deliveryType,
      items: mappedItems,
    });
  } catch (error) {
    console.error('[ORDER_STATUS_API] Error:', error);
    return NextResponse.json({ error: 'Errore del server' }, { status: 500 });
  }
}
