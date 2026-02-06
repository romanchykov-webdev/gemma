import { answerCallbackQuery, editTelegramMessage } from '@/lib/telegram';
import { OrderStatus } from '@prisma/client';
import { NextResponse } from 'next/server';

import { prisma } from '../../../../../prisma/prisma-client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type TelegramMessage = {
  message_id: number;
  chat: { id: number };
  text?: string;
};

type TelegramCallbackQuery = {
  id: string;
  from: { id: number; first_name: string };
  message?: TelegramMessage;
  data?: string;
};

type TelegramUpdate = {
  update_id: number;
  callback_query?: TelegramCallbackQuery;
};

export async function POST(req: Request) {
  console.log('🚀 [TELEGRAM_WEBHOOK] Webhook started');

  try {
    console.log('📥 [TELEGRAM_WEBHOOK] Reading request body...');
    const body = (await req.json()) as TelegramUpdate;

    console.log('📝 [TELEGRAM_WEBHOOK] Received update:', JSON.stringify(body, null, 2));

    if (body.callback_query) {
      console.log('✅ [TELEGRAM_WEBHOOK] Callback query found, processing...');
      await handleCallbackQuery(body.callback_query);
    } else {
      console.log('⚠️ [TELEGRAM_WEBHOOK] No callback_query in update, skipping');
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('💥 [TELEGRAM_WEBHOOK] Fatal error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

async function handleCallbackQuery(callbackQuery: TelegramCallbackQuery) {
  const { id: queryId, data: callbackData, message } = callbackQuery;

  if (!callbackData || !message) {
    console.error('❌ Missing data');
    return;
  }

  try {
    const parts = callbackData.split(':');
    const [action, value, orderId] = parts;

    console.log(`🔍 Processing Action: ${action}, Value: ${value}, OrderID: ${orderId}`);

    // Ищем заказ
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, status: true },
    });

    if (!order) {
      console.error('❌ Order not found in DB');
      await answerCallbackQuery(queryId, 'Ordine non trovato');
      return;
    }

    // Логика обновления
    if (action === 'order_time') {
      await handleOrderTime(orderId, parseInt(value, 10), message, queryId);
    } else if (action === 'order_status' && value === 'ready') {
      await handleOrderReady(orderId, message, queryId);
    } else if (action === 'order_status' && value === 'cooking') {
      await handleOrderCooking(orderId, message, queryId);
    }
  } catch (error) {
    console.error('💥 Logic Error:', error);
    await answerCallbackQuery(queryId, 'Errore del server');
  }
}

// --- ФУНКЦИИ ЛОГИКИ   ---

// 🛠 Вспомогательная функция, чтобы убрать старые статусы из текста
// и не ломать основное сообщение
function cleanMessageText(text: string): string {
  // Убираем строки, которые мы сами добавляли ранее
  return text
    .replace(/\n\n⏱️ Tempo:.*\n🕐 Pronto alle:.*\n👨‍🍳 In preparazione.../g, '')
    .replace(/\n\n✅ ORDINE PRONTO!.*/g, '')
    .replace(/\n\n👨‍🍳 In preparazione.../g, '')
    .trim();
}

// ⏱️ Обработка установки времени (В РАБОТЕ + ВРЕМЯ)
async function handleOrderTime(
  orderId: string,
  minutes: number,
  message: TelegramMessage,
  queryId: string,
) {
  console.log(`⏳ Setting time for order ${orderId} to ${minutes} min`);

  const now = new Date();
  const expectedReadyAt = new Date(now.getTime() + minutes * 60 * 1000);

  // 1. Обновляем базу
  await prisma.order.update({
    where: { id: orderId },
    data: { status: OrderStatus.PROCESSING, expectedReadyAt },
  });

  const timeStr = expectedReadyAt.toLocaleTimeString('it-IT', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // 2. Берем ВЕСЬ старый текст и чистим от старых статусов
  const originalText = cleanMessageText(message.text || '');

  // 3. Формируем новый текст (Чек + Статус внизу)
  const updatedText = `${originalText}\n\n⏱️ Tempo: ${minutes} min\n🕐 Pronto alle: ${timeStr}\n👨‍🍳 In preparazione...`;

  // 4. Оставляем кнопку "Готово"
  const keyboard = {
    inline_keyboard: [[{ text: '✅ Готово', callback_data: `order_status:ready:${orderId}` }]],
  };

  await editTelegramMessage(message.chat.id, message.message_id, updatedText, keyboard);
  await answerCallbackQuery(queryId, `Pronto in ${minutes} min`);
}

// ✅ Обработка статуса "ГОТОВ"
async function handleOrderReady(orderId: string, message: TelegramMessage, queryId: string) {
  console.log(`⏳ Setting order ${orderId} to READY`);

  await prisma.order.update({
    where: { id: orderId },
    data: { status: OrderStatus.READY, readyAt: new Date() },
  });

  // Чистим текст и добавляем финал
  const originalText = cleanMessageText(message.text || '');
  const updatedText = `${originalText}\n\n✅ ORDINE PRONTO!`;

  // Убираем все кнопки
  await editTelegramMessage(message.chat.id, message.message_id, updatedText, {
    inline_keyboard: [],
  });
  await answerCallbackQuery(queryId, '✅ Ordine pronto!');
}

// 👨‍🍳 Обработка статуса "В РАБОТЕ" (без времени)
async function handleOrderCooking(orderId: string, message: TelegramMessage, queryId: string) {
  console.log(`⏳ Setting order ${orderId} to COOKING`);

  await prisma.order.update({
    where: { id: orderId },
    data: { status: OrderStatus.PROCESSING },
  });

  const originalText = cleanMessageText(message.text || '');
  const updatedText = `${originalText}\n\n👨‍🍳 In preparazione...`;

  const keyboard = {
    inline_keyboard: [[{ text: '✅ Готово', callback_data: `order_status:ready:${orderId}` }]],
  };

  await editTelegramMessage(message.chat.id, message.message_id, updatedText, keyboard);
  await answerCallbackQuery(queryId, 'In preparazione');
}
