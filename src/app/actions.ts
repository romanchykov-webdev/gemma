'use server';

import { CheckoutFormValues } from '@/components/shared/checkout/checkout-form-schema';
import { OrderStatus, Prisma } from '@prisma/client';
import { cookies } from 'next/headers';

import { stripe } from '@/lib/stripe';
import type { Stripe } from 'stripe';
import { prisma } from '../../prisma/prisma-client';

import { calcCatItemTotalPrice } from '@/lib/calc-cart-item-total-price';
import { getUserSession } from '@/lib/get-user-session';
// import { sendTelegramMessage } from '@/lib/telegram';
import { hashSync } from 'bcrypt';
import { CartItemDTO } from '../../services/dto/cart.dto';

import { sendTelegramMessage } from '@/lib/telegram';
import { asProductVariants } from '../../@types/json-parsers';
import { BaseIngredient } from '../../@types/prisma';

const APP_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

const VAT_PERCENT = 0; // НДС, %
const DELIVERY_EUR = 0; // Доставка,

type CartItemWithRelations = Prisma.CartItemGetPayload<{
  include: {
    product: {
      select: {
        id: true;
        name: true;
        imageUrl: true;
        variants: true;
        baseIngredients: true;
        category: {
          select: { name: true };
        };
      };
    };
    ingredients: {
      select: {
        id: true;
        name: true;
        price: true;
        imageUrl: true;
      };
    };
  };
}>;

// функция создания заказа
export async function createOrder(data: CheckoutFormValues) {
  try {
    const cookisStore = await cookies();

    const cartToken = cookisStore.get('cartToken')?.value;

    if (!cartToken) {
      throw new Error('Cart token not found');
    }

    // Подтягиваем корзину
    const cart = await prisma.cart.findFirst({
      where: { tokenId: cartToken },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
                variants: true,
                baseIngredients: true,
              },
            },
            ingredients: {
              select: {
                id: true,
                name: true,
                price: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });

    if (!cart) throw new Error('Cart not found');

    // тестирование не исправности
    if (!cart.items.length) {
      throw new Error('Cart is empty');
    }

    // 🔒 БЕЗОПАСНОСТЬ: Пересчитываем totalAmount на сервере
    const serverTotalAmount = cart.items.reduce((sum, item) => {
      const itemPrice = calcCatItemTotalPrice(item as CartItemDTO);
      return sum + itemPrice;
    }, 0);

    console.log('[CREATE_ORDER] Cart calculation:', {
      cartId: cart.id,
      itemsCount: cart.items.length,
      serverCalculated: serverTotalAmount,
      tokenId: cartToken,
    });

    if (serverTotalAmount <= 0) {
      throw new Error('Invalid cart total amount');
    }

    const itemsCents = Math.round(serverTotalAmount * 100);
    const taxCents = Math.round((itemsCents * VAT_PERCENT) / 100);
    const deliveryCents = DELIVERY_EUR * 100;
    const grandCents = itemsCents + taxCents + deliveryCents;

    // Создаём Order в статусе PENDING
    const order = await prisma.order.create({
      data: {
        tokenId: cartToken,
        totalAmount: Math.round(grandCents / 100),
        status: OrderStatus.PENDING,
        // items: JSON.stringify(cart.items),
        items: cart.items,
        fullName: `${data.firstname ?? ''} ${data.lastname ?? ''}`.trim(),
        email: data.email ?? '',
        phone: data.phone,
        address: data.address,
        comment: data.comment ?? '',
      },
    });

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        quantity: 1,
        price_data: {
          currency: 'eur', // валюта
          // unit_amount: cart.totalAmount * 100, // сумма в центах!
          unit_amount: grandCents,
          product_data: {
            name: `Заказ #${order.id}`,
            description: 'Оплата заказа в Next Pizza',
          },
        },
      },
    ];
    // Вариант Б (если хочешь разложить позициями):
    // const line_items = [
    //   { quantity: 1, price_data: { currency: "eur", unit_amount: itemsCents,    product_data: { name: "Товары" } } },
    //   { quantity: 1, price_data: { currency: "eur", unit_amount: taxCents,      product_data: { name: `Налог ${VAT_PERCENT}%` } } },
    //   { quantity: 1, price_data: { currency: "eur", unit_amount: deliveryCents, product_data: { name: "Доставка" } } },
    // ];

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items,
      success_url: `${APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/failed`,
      metadata: {
        orderId: String(order.id),
        cartToken,
      },
    });

    return session.url ?? null;
  } catch (error) {
    console.log('[CREATE_ORDER] Server error', error);
    return null;
  }
}

//  функция очистки корзины временная
export async function clearCart(cartToken?: string) {
  try {
    // Если cartToken не передан, пробуем получить из куки
    if (!cartToken) {
      const cookieStore = await cookies();
      cartToken = cookieStore.get('cartToken')?.value;
    }

    if (!cartToken) {
      console.log('[CLEAR_CART] Cart token not found');
      return { success: false, error: 'Cart token not found' };
    }

    // Поиск корзины
    const cart = await prisma.cart.findFirst({
      where: { tokenId: cartToken },
      select: { id: true },
    });

    if (!cart) {
      console.log('[CLEAR_CART] Cart not found for token:', cartToken);
      return { success: false, error: 'Cart not found' };
    }

    // Удаление элементов корзины
    const deleteResult = await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });
    console.log('[CLEAR_CART] Deleted items count:', deleteResult.count);

    // Обновление суммы корзины
    await prisma.cart.update({
      where: { id: cart.id },
      data: { totalAmount: 0 },
    });
    console.log('[CLEAR_CART] Cart total amount reset for cart:', cart.id);

    return { success: true };
  } catch (error) {
    console.error('[CLEAR_CART] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// функция обновления информации о пользователе
export async function updateUserInfo(body: Prisma.UserUpdateInput) {
  try {
    const currentUser = await getUserSession();

    // проверяем авторизован ли пользователь
    if (!currentUser) {
      throw new Error('Пользователь не найден');
    }

    // ищем пользователя в базе данных
    const findUser = await prisma.user.findFirst({
      where: {
        id: currentUser.id,
      },
    });

    // обновляем информацию о пользователе
    await prisma.user.update({
      where: {
        id: currentUser.id,
      },
      data: {
        fullName: body.fullName,
        email: body.email,
        phone: (body.phone as string | null) ?? null,
        address: (body.address as string | null) ?? null,
        password: body.password ? hashSync(body.password as string, 10) : findUser?.password,
      },
    });
  } catch (err) {
    console.log('Error [UPDATE_USER]', err);
    throw err;
  }
}

// функция регистрации пользователя
export async function registerUser(body: Prisma.UserCreateInput) {
  try {
    const user = await prisma.user.findFirst({
      where: {
        email: body.email,
      },
    });

    if (user) {
      throw new Error("L'utente esiste già");
    }

    // Создаём пользователя
    const createdUser = await prisma.user.create({
      data: {
        fullName: body.fullName,
        email: body.email,
        password: hashSync(body.password, 10),
        role: 'USER',
      },
    });

    return { success: true, userId: createdUser.id };
  } catch (error) {
    console.log('Error [CREATE_USER]', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// 1. Вспомогательная функция для форматирования Telegram сообщения
// const formatTelegramMessage = async (
//   order: {
//     id: string;
//     totalAmount: number;
//     fullName: string;
//     phone: string;
//     address: string;
//     comment: string | null;
//   },
//   items: CartItemWithRelations[],
//   deliveryType: 'delivery' | 'pickup',
// ) => {
//   const isPickup = deliveryType === 'pickup';

//   // Создаем дату и время
//   const now = new Date();
//   const dateStr = now.toLocaleDateString('it-IT'); // Формат 31/01/2026
//   const timeStr = now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }); // Формат 16:24

//   // ✅ Загружаем справочники
//   const [allSizes, allTypes] = await Promise.all([
//     prisma.size.findMany({ select: { id: true, name: true } }),
//     prisma.type.findMany({ select: { id: true, name: true } }),
//   ]);

//   // Группируем товары по категориям
//   const groupedItems = items.reduce<Record<string, CartItemWithRelations[]>>((acc, item) => {
//     const catName = item.product.category?.name || 'Altro';
//     if (!acc[catName]) acc[catName] = [];
//     acc[catName].push(item);
//     return acc;
//   }, {});

//   const lines: string[] = [];

//   Object.entries(groupedItems).forEach(([category, catItems]) => {
//     lines.push(`\n🔸 *${category.toUpperCase()}*:`);

//     catItems.forEach((it, index) => {
//       const name = it.product?.name ?? 'Prodotto';
//       const itemSum = calcCatItemTotalPrice(it as CartItemDTO);

//       // ✅ Получаем вариант
//       const variants = asProductVariants(it.product?.variants);
//       const variant = variants.find(v => v.variantId === it.variantId);

//       // ✅ Получаем size и type из справочников
//       const sizeObj = allSizes.find(s => s.id === variant?.sizeId);
//       const typeObj = allTypes.find(t => t.id === variant?.typeId);

//       const size = sizeObj?.name ? ` (${sizeObj.name})` : '';
//       const dough = typeObj ? `, : ${typeObj.name}` : '';

//       lines.push(` • *${it.quantity}x* ${name}${size}${dough} — ${itemSum.toFixed(2)} €`);

//       // ✅ Добавленные ингредиенты
//       if (it.ingredients?.length) {
//         const added = it.ingredients.map(i => i.name).join(', ');
//         lines.push(`   ✅ + _Extra:_ ${added}`);
//       }

//       // ✅ Удалённые ингредиенты
//       const baseSnapshot = it.baseIngredientsSnapshot as unknown as BaseIngredient[] | null;
//       const removed = (baseSnapshot ?? [])
//         .filter(ing => ing.isDisabled && ing.removable)
//         .map(ing => ing.name);

//       if (removed.length) {
//         lines.push(`   ❌ - _Senza:_ ${removed.join(', ')}`);
//       }

//       // ✅  РАЗДЕЛИТЕЛЬ (если это не последний элемент в категории)
//       if (index < catItems.length - 1) {
//         lines.push('\n');
//       }
//     });
//   });

//   return [
//     isPickup ? '📦 *NUOVO ORDINE: ASPORTO*' : '🛵 *NUOVO ORDINE: CONSEGNA*',
//     '',
//     `📅 Data: _${dateStr} ${timeStr}_`,
//     '',
//     `🆔 ID: \`${order.id.split('-')[0]}\``,
//     '',
//     `💰 Totale: *${order.totalAmount.toFixed(2)} €*`,
//     '',
//     `💳 Pagamento: ${isPickup ? 'Al ritiro' : 'Alla consegna'}`,
//     '',
//     '*COMPOSIZIONE:*',
//     ...lines,
//     '',
//     '— — — — — — — — — — — —',
//     '',
//     '*CLIENTE:*',
//     '',
//     `👤 ${order.fullName}`,
//     '',
//     `📞 ${order.phone}`,
//     '',
//     // Блок адреса с проверкой
//     ...(isPickup
//       ? ['📍 _Ritiro presso il locale_']
//       : [
//           `🏠 *Indirizzo:*`,
//           `${order.address}`,
//           '', // Воздух перед ссылкой
//           `📍 [➤ Apri in Google Maps](https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.address)})`,
//         ]),
//     '',
//     order.comment ? `💬 Commento: _${order.comment}_` : '',
//   ]
//     .filter(val => val !== null && val !== undefined)
//     .join('\n');
// };

// 1. Вспомогательная функция для форматирования Telegram сообщения
const formatTelegramMessage = async (
  order: {
    id: string;
    totalAmount: number;
    fullName: string;
    phone: string;
    address: string;
    comment: string | null;
  },
  items: CartItemWithRelations[],
  deliveryType: 'delivery' | 'pickup',
) => {
  const isPickup = deliveryType === 'pickup';
  const now = new Date();
  const dateStr = now.toLocaleDateString('it-IT');
  const timeStr = now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });

  const [allSizes, allTypes] = await Promise.all([
    prisma.size.findMany({ select: { id: true, name: true } }),
    prisma.type.findMany({ select: { id: true, name: true } }),
  ]);

  const groupedItems = items.reduce<Record<string, CartItemWithRelations[]>>((acc, item) => {
    const catName = item.product.category?.name || 'Altro';
    if (!acc[catName]) acc[catName] = [];
    acc[catName].push(item);
    return acc;
  }, {});

  const lines: string[] = [];

  Object.entries(groupedItems).forEach(([category, catItems]) => {
    lines.push(`\n🔸 <b>${category.toUpperCase()}</b>:`);

    catItems.forEach((it, index) => {
      const name = it.product?.name ?? 'Prodotto';
      const itemSum = calcCatItemTotalPrice(it as CartItemDTO);
      const variants = asProductVariants(it.product?.variants);
      const variant = variants.find(v => v.variantId === it.variantId);
      const sizeObj = allSizes.find(s => s.id === variant?.sizeId);
      const typeObj = allTypes.find(t => t.id === variant?.typeId);

      const size = sizeObj?.name ? ` (${sizeObj.name})` : '';
      const dough = typeObj ? ` • <i>${typeObj.name}</i>` : '';

      lines.push(
        ` • <b>${it.quantity}x</b> ${name}${size}${dough} — <b>${itemSum.toFixed(2)} €</b>`,
      );

      if (it.ingredients?.length) {
        const added = it.ingredients.map(i => i.name).join(', ');
        lines.push(`   ✅ + <i>Extra:</i> <code>${added}</code>`);
      }

      const baseSnapshot = it.baseIngredientsSnapshot as unknown as BaseIngredient[] | null;
      const removed = (baseSnapshot ?? [])
        .filter(ing => ing.isDisabled && ing.removable)
        .map(ing => ing.name);

      if (removed.length) {
        lines.push(`   ❌ - <i>Senza:</i> <code>${removed.join(', ')}</code>`);
      }

      if (index < catItems.length - 1) {
        lines.push('<code>——————————————————————————</code>');
      }
    });
  });

  return [
    isPickup ? '📦 <b>NUOVO ORDINE: ASPORTO</b>' : '🛵 <b>NUOVO ORDINE: CONSEGNA</b>',
    '',
    `📅 Data: <i>${dateStr} ${timeStr}</i>`,
    '',
    `🆔 ID: <code>${order.id.split('-')[0]}</code>`,
    '',
    `💰 Totale: <b>${order.totalAmount.toFixed(2)} €</b>`,
    '',
    `💳 Pagamento: ${isPickup ? 'Al ritiro' : 'Alla consegna'}`,
    '',
    '<b>COMPOSIZIONE:</b>',
    ...lines,
    '',
    '—————————————',
    '',
    '<b>CLIENTE:</b>',
    '',
    `👤 ${order.fullName}`,
    '',
    `📞 <b><a href="tel:${order.phone}">${order.phone}</a></b>`,
    '',
    ...(isPickup
      ? ['📍 <i>Ritiro presso il locale</i>']
      : [
          `🏠 <b>Indirizzo:</b>`,
          `${order.address}`,
          '',
          `📍 <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.address)}">➤ Apri in Google Maps</a>`,
        ]),
    '',
    order.comment ? `💬 Commento: <i>${order.comment}</i>` : '',
  ]
    .filter(val => val !== null && val !== undefined)
    .join('\n');
};

// 2. Основная функция - заказ без онлайн-оплаты (оплата курьеру)
export async function createCashOrder(data: CheckoutFormValues) {
  try {
    const cookieStore = await cookies();
    const cartToken = cookieStore.get('cartToken')?.value;
    if (!cartToken) throw new Error('Cart token not found');

    const cart = await prisma.cart.findFirst({
      where: { tokenId: cartToken },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
                variants: true,
                baseIngredients: true,
                category: {
                  select: { name: true },
                },
              },
            },
            ingredients: {
              select: {
                id: true,
                name: true,
                price: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });

    if (!cart || !cart.items.length) throw new Error('Cart is empty');

    // ✅ РАСЧЕТ СУММЫ
    const serverTotalAmount = cart.items.reduce((sum, item) => {
      return sum + calcCatItemTotalPrice(item as CartItemDTO);
    }, 0);

    console.log('[CREATE_CASH_ORDER] Cart calculation:', {
      cartId: cart.id,
      itemsCount: cart.items.length,
      serverCalculated: serverTotalAmount,
      tokenId: cartToken,
    });

    if (serverTotalAmount <= 0) {
      throw new Error('Invalid cart total amount');
    }

    const isPickup = data.deliveryType === 'pickup';
    const deliveryCents = isPickup ? 0 : DELIVERY_EUR * 100;

    const itemsCents = Math.round(serverTotalAmount * 100);
    const taxCents = Math.round((itemsCents * VAT_PERCENT) / 100);
    const grandTotal = (itemsCents + taxCents + deliveryCents) / 100;

    // ✅ СОЗДАНИЕ ЗАКАЗА
    const order = await prisma.order.create({
      data: {
        tokenId: cartToken,
        totalAmount: grandTotal,
        status: OrderStatus.PENDING,
        items: cart.items as unknown as Prisma.JsonArray,
        fullName: `${data.firstname} ${data.lastname || ''}`.trim(),
        email: data.email || '',
        phone: data.phone,
        address: isPickup ? 'Ritiro al locale' : data.address,
        comment: data.comment || '',
        paymentId: 'courier',
      },
    });

    // ✅ TELEGRAM
    const telegramMsg = await formatTelegramMessage(
      {
        id: order.id,
        totalAmount: Number(order.totalAmount),
        fullName: order.fullName,
        phone: order.phone,
        address: order.address,
        comment: order.comment,
      },
      cart.items,
      data.deliveryType,
    );

    console.log('\n========== TELEGRAM MESSAGE ==========');
    console.log(telegramMsg);
    console.log('======================================\n');

    await sendTelegramMessage(telegramMsg);
    // await clearCart(cartToken);

    return { success: true, orderId: order.id };
  } catch (error) {
    console.error('[CREATE_CASH_ORDER]', error);
    return { success: false };
  }
}
