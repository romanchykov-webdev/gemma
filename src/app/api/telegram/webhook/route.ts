import { OrderStatus } from '@prisma/client';
import { NextResponse } from 'next/server';
// 👇 Исправленный импорт (обычно работает лучше)
import { answerCallbackQuery, editTelegramMessage } from '@/lib/telegram';
import { prisma } from '../../../../../prisma/prisma-client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type TelegramCallbackQuery = {
  id: string;
  from: { id: number; first_name: string };
  message?: { message_id: number; chat: { id: number }; text?: string };
  data?: string;
};

type TelegramUpdate = {
  update_id: number;
  callback_query?: TelegramCallbackQuery;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as TelegramUpdate;

    // Логируем, чтобы видеть в Vercel Logs, что запрос дошел
    console.log('[TELEGRAM_WEBHOOK] Received update:', JSON.stringify(body, null, 2));

    if (body.callback_query) {
      await handleCallbackQuery(body.callback_query);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[TELEGRAM_WEBHOOK] Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

async function handleCallbackQuery(callbackQuery: TelegramCallbackQuery) {
  const { id: queryId, data: callbackData, message } = callbackQuery;

  if (!callbackData || !message) return;

  try {
    const parts = callbackData.split(':');
    const [action, value, orderId] = parts;

    // Проверка заказа
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, status: true },
    });

    if (!order) {
      await answerCallbackQuery(queryId, 'Ordine non trovato');
      return;
    }

    // Логика кнопок
    if (action === 'order_time') {
      await handleOrderTime(orderId, parseInt(value, 10), message, queryId);
    } else if (action === 'order_status' && value === 'ready') {
      await handleOrderReady(orderId, message, queryId);
    } else if (action === 'order_status' && value === 'cooking') {
      await handleOrderCooking(orderId, message, queryId);
    }
  } catch (error) {
    console.error('[TELEGRAM_WEBHOOK] Logic Error:', error);
    await answerCallbackQuery(queryId, 'Errore nel server');
  }
}

// --- ФУНКЦИИ ЛОГИКИ (Те же, что и были) ---

async function handleOrderTime(orderId: string, minutes: number, message: any, queryId: string) {
  const now = new Date();
  const expectedReadyAt = new Date(now.getTime() + minutes * 60 * 1000);

  await prisma.order.update({
    where: { id: orderId },
    data: { status: OrderStatus.PROCESSING, expectedReadyAt },
  });

  const timeStr = expectedReadyAt.toLocaleTimeString('it-IT', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Упрощаем текст для теста
  const originalText = message.text?.split('\n\n')[0] || 'Ordine';
  const updatedText = `${originalText}\n\n⏱️ Tempo: ${minutes} min\n🕐 Pronto alle: ${timeStr}\n👨‍🍳 In preparazione...`;

  const keyboard = {
    inline_keyboard: [[{ text: '✅ Готово', callback_data: `order_status:ready:${orderId}` }]],
  };

  await editTelegramMessage(message.chat.id, message.message_id, updatedText, keyboard);
  await answerCallbackQuery(queryId, `Pronto in ${minutes} min`);
}

async function handleOrderReady(orderId: string, message: any, queryId: string) {
  await prisma.order.update({
    where: { id: orderId },
    data: { status: OrderStatus.READY, readyAt: new Date() },
  });

  const originalText = message.text?.split('\n\n')[0] || 'Ordine';
  const updatedText = `${originalText}\n\n✅ ORDINE PRONTO!`;

  await editTelegramMessage(message.chat.id, message.message_id, updatedText, {
    inline_keyboard: [],
  });
  await answerCallbackQuery(queryId, '✅ Ordine pronto!');
}

async function handleOrderCooking(orderId: string, message: any, queryId: string) {
  await prisma.order.update({
    where: { id: orderId },
    data: { status: OrderStatus.PROCESSING },
  });

  const originalText = message.text?.split('\n\n')[0] || 'Ordine';
  const updatedText = `${originalText}\n\n👨‍🍳 In preparazione...`;

  const keyboard = {
    inline_keyboard: [[{ text: '✅ Готово', callback_data: `order_status:ready:${orderId}` }]],
  };

  await editTelegramMessage(message.chat.id, message.message_id, updatedText, keyboard);
  await answerCallbackQuery(queryId, 'In preparazione');
}
