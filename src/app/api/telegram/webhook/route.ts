import { NextResponse } from 'next/server';
import { OrderStatus } from '@prisma/client';
import { prisma } from '../../../../../prisma/prisma-client';
import { editTelegramMessage, answerCallbackQuery } from '@/lib/telegram';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// 📦 Типы для Telegram Webhook
type TelegramCallbackQuery = {
  id: string;
  from: {
    id: number;
    first_name: string;
  };
  message?: {
    message_id: number;
    chat: {
      id: number;
    };
    text?: string;
  };
  data?: string;
};

type TelegramUpdate = {
  update_id: number;
  callback_query?: TelegramCallbackQuery;
};

// 🔐 Проверка токена webhook (опционально, для безопасности)
const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;

// 🎯 Главный обработчик webhook
export async function POST(req: Request) {
  try {
    // 🔐 Опциональная проверка секретного токена
    if (WEBHOOK_SECRET) {
      const secretHeader = req.headers.get('x-telegram-bot-api-secret-token');
      if (secretHeader !== WEBHOOK_SECRET) {
        console.warn('[TELEGRAM_WEBHOOK] Invalid secret token');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const body = (await req.json()) as TelegramUpdate;
    console.log('[TELEGRAM_WEBHOOK] Received update:', JSON.stringify(body, null, 2));

    // 🔘 Обрабатываем только callback_query
    if (body.callback_query) {
      await handleCallbackQuery(body.callback_query);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[TELEGRAM_WEBHOOK] Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// 🎮 Обработчик нажатий на Inline-кнопки
async function handleCallbackQuery(callbackQuery: TelegramCallbackQuery) {
  const { id: queryId, data: callbackData, message } = callbackQuery;

  if (!callbackData || !message) {
    console.warn('[TELEGRAM_WEBHOOK] Missing callback_data or message');
    return;
  }

  console.log('[TELEGRAM_WEBHOOK] Processing callback:', callbackData);

  try {
    // 📝 Парсим callback_data
    const parts = callbackData.split(':');
    if (parts.length !== 3) {
      console.error('[TELEGRAM_WEBHOOK] Invalid callback_data format:', callbackData);
      await answerCallbackQuery(queryId, 'Formato non valido');
      return;
    }

    const [action, value, orderId] = parts;

    // 🔍 Проверяем существование заказа
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        status: true,
        fullName: true,
        createdAt: true,
      },
    });

    if (!order) {
      console.error('[TELEGRAM_WEBHOOK] Order not found:', orderId);
      await answerCallbackQuery(queryId, 'Ordine non trovato');
      return;
    }

    // ⛔ Проверяем, что заказ не отменен
    if (order.status === OrderStatus.CANCELLED) {
      await answerCallbackQuery(queryId, 'Ordine annullato');
      return;
    }

    // 🔀 Обрабатываем разные типы действий
    if (action === 'order_time') {
      await handleOrderTime(orderId, parseInt(value, 10), message, queryId);
    } else if (action === 'order_status' && value === 'ready') {
      await handleOrderReady(orderId, message, queryId);
    } else if (action === 'order_status' && value === 'cooking') {
      await handleOrderCooking(orderId, message, queryId);
    } else {
      console.warn('[TELEGRAM_WEBHOOK] Unknown action:', action);
      await answerCallbackQuery(queryId, 'Azione sconosciuta');
    }
  } catch (error) {
    console.error('[TELEGRAM_WEBHOOK] Error handling callback:', error);
    await answerCallbackQuery(queryId, 'Errore del server');
  }
}

// ⏱️ Обработка установки времени готовности
async function handleOrderTime(
  orderId: string,
  minutes: number,
  message: TelegramCallbackQuery['message'],
  queryId: string,
) {
  if (!message) return;

  try {
    // 🕐 Вычисляем expectedReadyAt
    const now = new Date();
    const expectedReadyAt = new Date(now.getTime() + minutes * 60 * 1000);

    // 💾 Обновляем заказ в БД
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.PROCESSING,
        expectedReadyAt,
      },
    });

    console.log(`[TELEGRAM_WEBHOOK] Order ${orderId} - time set to ${minutes} min`);

    // ⏰ Форматируем время для отображения
    const timeStr = expectedReadyAt.toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit',
    });

    // ✏️ Редактируем сообщение - добавляем информацию о времени
    const originalText = message.text || '';
    const updatedText = `${originalText}\n\n⏱️ <b>Tempo di preparazione: ${minutes} min</b>\n🕐 <b>Pronto alle: ${timeStr}</b>\n\n👨‍🍳 <i>In preparazione...</i>`;

    // 🔘 Оставляем только кнопку "✅ Готов"
    const keyboard = {
      inline_keyboard: [
        [
          {
            text: '✅ Готово',
            callback_data: `order_status:ready:${orderId}`,
          },
        ],
      ],
    };

    await editTelegramMessage(message.chat.id, message.message_id, updatedText, keyboard);

    // ✅ Отвечаем на callback query
    await answerCallbackQuery(queryId, `⏱️ Pronto in ${minutes} min`);
  } catch (error) {
    console.error('[TELEGRAM_WEBHOOK] Error setting order time:', error);
    await answerCallbackQuery(queryId, 'Errore');
  }
}

// ✅ Обработка статуса "Готов"
async function handleOrderReady(
  orderId: string,
  message: TelegramCallbackQuery['message'],
  queryId: string,
) {
  if (!message) return;

  try {
    // 💾 Обновляем заказ в БД
    const now = new Date();
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.READY,
        readyAt: now,
      },
    });

    console.log(`[TELEGRAM_WEBHOOK] Order ${orderId} - marked as READY`);

    // ⏰ Форматируем время
    const timeStr = now.toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit',
    });

    // ✏️ Редактируем сообщение - убираем все кнопки
    const originalText = message.text || '';
    const updatedText = `${originalText}\n\n✅ <b>ORDINE PRONTO!</b>\n🕐 <i>Completato alle ${timeStr}</i>\n\n🎉 <i>In attesa del cliente...</i>`;

    // Убираем клавиатуру (пустой массив)
    const emptyKeyboard = {
      inline_keyboard: [],
    };

    await editTelegramMessage(message.chat.id, message.message_id, updatedText, emptyKeyboard);

    // ✅ Отвечаем на callback query
    await answerCallbackQuery(queryId, '✅ Ordine pronto!');
  } catch (error) {
    console.error('[TELEGRAM_WEBHOOK] Error marking order ready:', error);
    await answerCallbackQuery(queryId, 'Errore');
  }
}

// 👨‍🍳 Обработка статуса "В работе" (без установки времени)
async function handleOrderCooking(
  orderId: string,
  message: TelegramCallbackQuery['message'],
  queryId: string,
) {
  if (!message) return;

  try {
    // 💾 Обновляем заказ в БД
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.PROCESSING,
      },
    });

    console.log(`[TELEGRAM_WEBHOOK] Order ${orderId} - marked as PROCESSING`);

    // ✏️ Редактируем сообщение
    const originalText = message.text || '';
    const updatedText = `${originalText}\n\n👨‍🍳 <b>IN PREPARAZIONE</b>\n\n<i>L'ordine è stato preso in carico...</i>`;

    // 🔘 Оставляем только кнопку "✅ Готов"
    const keyboard = {
      inline_keyboard: [
        [
          {
            text: '✅ Готово',
            callback_data: `order_status:ready:${orderId}`,
          },
        ],
      ],
    };

    await editTelegramMessage(message.chat.id, message.message_id, updatedText, keyboard);

    // ✅ Отвечаем на callback query
    await answerCallbackQuery(queryId, '👨‍🍳 In preparazione');
  } catch (error) {
    console.error('[TELEGRAM_WEBHOOK] Error marking order cooking:', error);
    await answerCallbackQuery(queryId, 'Errore');
  }
}
