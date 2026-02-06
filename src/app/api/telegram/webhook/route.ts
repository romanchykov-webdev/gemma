import { answerCallbackQuery, editTelegramMessage } from '@/lib/telegram';
import { OrderStatus, Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';
import { prisma } from '../../../../../prisma/prisma-client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// --- ТИПЫ ---

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

type OrderData = Prisma.OrderGetPayload<{
  select: {
    id: true;
    status: true;
    address: true;
    type: true;
  };
}>;

// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---

function cleanMessageText(text: string): string {
  // 1. Удаляем старые статусы (время, готовность)
  // Используем [\s\S]* вместо флага 's', чтобы работало во всех версиях
  const clean = text
    .replace(/\n\n⏱️ Tempo:[\s\S]*\n🕐 Pronto alle:[\s\S]*\n👨‍🍳 In preparazione.../g, '')
    .replace(/\n\n✅ ORDINE PRONTO![\s\S]*/g, '')
    .replace(/\n\n👨‍🍳 In preparazione...[\s\S]*/g, '')
    // 2. ВАЖНО: Удаляем старую ссылку на карту (даже если она сломана), чтобы добавить новую
    .replace(/\n*📍.*Apri in Google Maps.*/g, '')
    .trim();

  return clean;
}

function appendMapLink(text: string, order: OrderData): string {
  // Если самовывоз — ссылка не нужна
  if (order.type === 'PICKUP') return text;
  if (!order.address) return text;

  const encodedAddress = encodeURIComponent(order.address);
  // Формируем чистую, рабочую ссылку
  const linkHtml = `\n\n📍 <a href="http://googleusercontent.com/maps.google.com/maps?q=${encodedAddress}">➤ Apri in Google Maps</a>`;

  return text + linkHtml;
}

// --- ОСНОВНОЙ ХЕНДЛЕР ---

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as TelegramUpdate;

    if (body.callback_query) {
      await handleCallbackQuery(body.callback_query);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('💥 [TELEGRAM_WEBHOOK] Fatal error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

async function handleCallbackQuery(callbackQuery: TelegramCallbackQuery) {
  const { id: queryId, data: callbackData, message } = callbackQuery;

  if (!callbackData || !message) return;

  try {
    const parts = callbackData.split(':');
    const [action, value, orderId] = parts;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        status: true,
        address: true,
        type: true,
      },
    });

    if (!order) {
      await answerCallbackQuery(queryId, 'Ordine non trovato');
      return;
    }

    if (action === 'order_time') {
      await handleOrderTime(order, parseInt(value, 10), message, queryId);
    } else if (action === 'order_status' && value === 'ready') {
      await handleOrderReady(order, message, queryId);
    } else if (action === 'order_status' && value === 'cooking') {
      await handleOrderCooking(order, message, queryId);
    }
  } catch (error) {
    console.error('💥 Logic Error:', error);
    await answerCallbackQuery(queryId, 'Errore del server');
  }
}

// --- ОБРАБОТЧИКИ ДЕЙСТВИЙ ---

async function handleOrderTime(
  order: OrderData,
  minutes: number,
  message: TelegramMessage,
  queryId: string,
) {
  const now = new Date();
  const expectedReadyAt = new Date(now.getTime() + minutes * 60 * 1000);

  await prisma.order.update({
    where: { id: order.id },
    data: { status: OrderStatus.PROCESSING, expectedReadyAt },
  });

  const timeStr = expectedReadyAt.toLocaleTimeString('it-IT', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Rome',
  });

  // 1. Чистим всё лишнее
  let text = cleanMessageText(message.text || '');
  // 2. Добавляем ссылку заново (если нужна)
  text = appendMapLink(text, order);

  const updatedText = `${text}\n\n⏱️ Tempo: ${minutes} min\n🕐 Pronto alle: ${timeStr}\n👨‍🍳 In preparazione...`;

  const keyboard = {
    inline_keyboard: [[{ text: '✅ Pronto', callback_data: `order_status:ready:${order.id}` }]],
  };

  await editTelegramMessage(message.chat.id, message.message_id, updatedText, keyboard);
  await answerCallbackQuery(queryId, `Pronto in ${minutes} min`);
}

async function handleOrderReady(order: OrderData, message: TelegramMessage, queryId: string) {
  await prisma.order.update({
    where: { id: order.id },
    data: { status: OrderStatus.READY, readyAt: new Date() },
  });

  let text = cleanMessageText(message.text || '');
  text = appendMapLink(text, order);

  const updatedText = `${text}\n\n✅ ORDINE PRONTO!`;

  await editTelegramMessage(message.chat.id, message.message_id, updatedText, {
    inline_keyboard: [],
  });
  await answerCallbackQuery(queryId, '✅ Ordine pronto!');
}

async function handleOrderCooking(order: OrderData, message: TelegramMessage, queryId: string) {
  await prisma.order.update({
    where: { id: order.id },
    data: { status: OrderStatus.PROCESSING },
  });

  let text = cleanMessageText(message.text || '');
  text = appendMapLink(text, order);

  const updatedText = `${text}\n\n👨‍🍳 In preparazione...`;

  const keyboard = {
    inline_keyboard: [[{ text: '✅ Pronto', callback_data: `order_status:ready:${order.id}` }]],
  };

  await editTelegramMessage(message.chat.id, message.message_id, updatedText, keyboard);
  await answerCallbackQuery(queryId, 'In preparazione');
}
