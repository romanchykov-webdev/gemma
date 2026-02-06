import { OrderStatus } from '@prisma/client';
import { NextResponse } from 'next/server';
import { answerCallbackQuery, editTelegramMessage } from '@/lib/telegram';
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
    // 📥 Читаем тело запроса
    console.log('📥 [TELEGRAM_WEBHOOK] Reading request body...');
    const body = (await req.json()) as TelegramUpdate;
    
    // 📝 Логируем полное тело запроса
    console.log('📝 [TELEGRAM_WEBHOOK] Received update:', JSON.stringify(body, null, 2));
    console.log('📝 [TELEGRAM_WEBHOOK] Update ID:', body.update_id);

    // ✅ Проверяем наличие callback_query
    if (body.callback_query) {
      console.log('✅ [TELEGRAM_WEBHOOK] Callback query found, processing...');
      await handleCallbackQuery(body.callback_query);
    } else {
      console.log('⚠️ [TELEGRAM_WEBHOOK] No callback_query in update, skipping');
    }

    console.log('✅ [TELEGRAM_WEBHOOK] Webhook completed successfully');
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('💥 [TELEGRAM_WEBHOOK] Fatal error:', error);
    console.error('💥 [TELEGRAM_WEBHOOK] Error stack:', error instanceof Error ? error.stack : 'No stack');
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

async function handleCallbackQuery(callbackQuery: TelegramCallbackQuery) {
  console.log('🎯 [handleCallbackQuery] Starting callback query processing');
  
  const { id: queryId, data: callbackData, message } = callbackQuery;
  
  console.log('🎯 [handleCallbackQuery] Query ID:', queryId);
  console.log('🎯 [handleCallbackQuery] Callback data:', callbackData);
  console.log('🎯 [handleCallbackQuery] Message exists:', !!message);

  // ❌ Проверка обязательных данных
  if (!callbackData || !message) {
    console.error('❌ [handleCallbackQuery] Missing callbackData or message');
    return;
  }

  try {
    // 🔍 Парсим callback_data
    console.log('🔍 [handleCallbackQuery] Parsing callback_data...');
    const parts = callbackData.split(':');
    console.log('🔍 [handleCallbackQuery] Parts:', parts);
    
    if (parts.length !== 3) {
      console.error('❌ [handleCallbackQuery] Invalid callback_data format. Expected 3 parts, got:', parts.length);
      await answerCallbackQuery(queryId, 'Formato non valido');
      return;
    }

    const [action, value, orderId] = parts;
    console.log('🔍 [handleCallbackQuery] Parsed:');
    console.log('  - action:', action);
    console.log('  - value:', value);
    console.log('  - orderId:', orderId);

    // 🔍 Проверяем заказ в БД
    console.log('⏳ [handleCallbackQuery] Searching order in DB:', orderId);
    
    let order;
    try {
      order = await prisma.order.findUnique({
        where: { id: orderId },
        select: { id: true, status: true, fullName: true },
      });
      console.log('✅ [handleCallbackQuery] Prisma query completed');
    } catch (prismaError) {
      console.error('💥 [handleCallbackQuery] Prisma findUnique error:', prismaError);
      console.error('💥 [handleCallbackQuery] Prisma error details:', JSON.stringify(prismaError, null, 2));
      throw prismaError;
    }

    if (!order) {
      console.error('❌ [handleCallbackQuery] Order NOT found in DB');
      await answerCallbackQuery(queryId, 'Ordine non trovato');
      return;
    }

    console.log('✅ [handleCallbackQuery] Order found:');
    console.log('  - ID:', order.id);
    console.log('  - Status:', order.status);
    console.log('  - Name:', order.fullName);

    // ⛔ Проверка статуса
    if (order.status === OrderStatus.CANCELLED) {
      console.log('⛔ [handleCallbackQuery] Order is CANCELLED, aborting');
      await answerCallbackQuery(queryId, 'Ordine annullato');
      return;
    }

    // 🔀 Маршрутизация по типу действия
    console.log('🔀 [handleCallbackQuery] Routing to handler for action:', action);
    
    if (action === 'order_time') {
      console.log('⏱️ [handleCallbackQuery] Calling handleOrderTime');
      await handleOrderTime(orderId, parseInt(value, 10), message, queryId);
    } else if (action === 'order_status' && value === 'ready') {
      console.log('✅ [handleCallbackQuery] Calling handleOrderReady');
      await handleOrderReady(orderId, message, queryId);
    } else if (action === 'order_status' && value === 'cooking') {
      console.log('👨‍🍳 [handleCallbackQuery] Calling handleOrderCooking');
      await handleOrderCooking(orderId, message, queryId);
    } else {
      console.error('❌ [handleCallbackQuery] Unknown action:', action, value);
      await answerCallbackQuery(queryId, 'Azione sconosciuta');
    }

    console.log('✅ [handleCallbackQuery] Callback query processed successfully');
  } catch (error) {
    console.error('💥 [handleCallbackQuery] Error:', error);
    console.error('💥 [handleCallbackQuery] Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('💥 [handleCallbackQuery] Error message:', error instanceof Error ? error.message : String(error));
    console.error('💥 [handleCallbackQuery] Error stack:', error instanceof Error ? error.stack : 'No stack');
    
    try {
      await answerCallbackQuery(queryId, 'Errore del server');
    } catch (answerError) {
      console.error('💥 [handleCallbackQuery] Failed to answer callback query:', answerError);
    }
  }
}

// ⏱️ Обработка установки времени готовности
async function handleOrderTime(orderId: string, minutes: number, message: TelegramMessage, queryId: string) {
  console.log('⏱️ [handleOrderTime] Started');
  console.log('⏱️ [handleOrderTime] Order ID:', orderId);
  console.log('⏱️ [handleOrderTime] Minutes:', minutes);
  
  try {
    // 🕐 Вычисляем время
    const now = new Date();
    const expectedReadyAt = new Date(now.getTime() + minutes * 60 * 1000);
    console.log('🕐 [handleOrderTime] Current time:', now.toISOString());
    console.log('🕐 [handleOrderTime] Expected ready at:', expectedReadyAt.toISOString());

    // 💾 Обновляем БД
    console.log('⏳ [handleOrderTime] Updating order status to PROCESSING...');
    console.log('⏳ [handleOrderTime] Order ID:', orderId);
    console.log('⏳ [handleOrderTime] New status:', OrderStatus.PROCESSING);
    console.log('⏳ [handleOrderTime] Expected ready at:', expectedReadyAt);
    
    let updateResult;
    try {
      updateResult = await prisma.order.update({
        where: { id: orderId },
        data: { 
          status: OrderStatus.PROCESSING, 
          expectedReadyAt: expectedReadyAt 
        },
      });
      console.log('✅ [handleOrderTime] Prisma update completed successfully');
      console.log('✅ [handleOrderTime] Updated order:', JSON.stringify(updateResult, null, 2));
    } catch (prismaError) {
      console.error('💥 [handleOrderTime] Prisma update error:', prismaError);
      console.error('💥 [handleOrderTime] Error details:', JSON.stringify(prismaError, null, 2));
      throw prismaError;
    }

    // 📝 Форматируем время для отображения
    const timeStr = expectedReadyAt.toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit',
    });
    console.log('📝 [handleOrderTime] Formatted time:', timeStr);

    // ✏️ Редактируем сообщение
    console.log('✏️ [handleOrderTime] Editing Telegram message...');
    const originalText = message.text?.split('\n\n')[0] || 'Ordine';
    const updatedText = `${originalText}\n\n⏱️ Tempo: ${minutes} min\n🕐 Pronto alle: ${timeStr}\n👨‍🍳 In preparazione...`;

    const keyboard = {
      inline_keyboard: [[{ text: '✅ Готово', callback_data: `order_status:ready:${orderId}` }]],
    };

    try {
      await editTelegramMessage(message.chat.id, message.message_id, updatedText, keyboard);
      console.log('✅ [handleOrderTime] Telegram message edited successfully');
    } catch (telegramError) {
      console.error('💥 [handleOrderTime] Telegram edit error:', telegramError);
      // Не бросаем ошибку, так как БД уже обновлена
    }

    // 📤 Отвечаем на callback
    console.log('📤 [handleOrderTime] Answering callback query...');
    try {
      await answerCallbackQuery(queryId, `⏱️ Pronto in ${minutes} min`);
      console.log('✅ [handleOrderTime] Callback query answered');
    } catch (answerError) {
      console.error('💥 [handleOrderTime] Answer callback error:', answerError);
    }

    console.log('✅ [handleOrderTime] Completed successfully');
  } catch (error) {
    console.error('💥 [handleOrderTime] Fatal error:', error);
    console.error('💥 [handleOrderTime] Error stack:', error instanceof Error ? error.stack : 'No stack');
    throw error;
  }
}

// ✅ Обработка статуса "Готов"
async function handleOrderReady(orderId: string, message: TelegramMessage, queryId: string) {
  console.log('✅ [handleOrderReady] Started');
  console.log('✅ [handleOrderReady] Order ID:', orderId);
  
  try {
    const readyAt = new Date();
    console.log('🕐 [handleOrderReady] Ready time:', readyAt.toISOString());

    // 💾 Обновляем БД
    console.log('⏳ [handleOrderReady] Updating order status to READY...');
    console.log('⏳ [handleOrderReady] Order ID:', orderId);
    console.log('⏳ [handleOrderReady] New status:', OrderStatus.READY);
    console.log('⏳ [handleOrderReady] Ready at:', readyAt);
    
    let updateResult;
    try {
      updateResult = await prisma.order.update({
        where: { id: orderId },
        data: { 
          status: OrderStatus.READY, 
          readyAt: readyAt 
        },
      });
      console.log('✅ [handleOrderReady] Prisma update completed successfully');
      console.log('✅ [handleOrderReady] Updated order:', JSON.stringify(updateResult, null, 2));
    } catch (prismaError) {
      console.error('💥 [handleOrderReady] Prisma update error:', prismaError);
      console.error('💥 [handleOrderReady] Error details:', JSON.stringify(prismaError, null, 2));
      throw prismaError;
    }

    // ✏️ Редактируем сообщение
    console.log('✏️ [handleOrderReady] Editing Telegram message...');
    const originalText = message.text?.split('\n\n')[0] || 'Ordine';
    const updatedText = `${originalText}\n\n✅ ORDINE PRONTO!`;

    try {
      await editTelegramMessage(message.chat.id, message.message_id, updatedText, {
        inline_keyboard: [],
      });
      console.log('✅ [handleOrderReady] Telegram message edited successfully');
    } catch (telegramError) {
      console.error('💥 [handleOrderReady] Telegram edit error:', telegramError);
    }

    // 📤 Отвечаем на callback
    console.log('📤 [handleOrderReady] Answering callback query...');
    try {
      await answerCallbackQuery(queryId, '✅ Ordine pronto!');
      console.log('✅ [handleOrderReady] Callback query answered');
    } catch (answerError) {
      console.error('💥 [handleOrderReady] Answer callback error:', answerError);
    }

    console.log('✅ [handleOrderReady] Completed successfully');
  } catch (error) {
    console.error('💥 [handleOrderReady] Fatal error:', error);
    console.error('💥 [handleOrderReady] Error stack:', error instanceof Error ? error.stack : 'No stack');
    throw error;
  }
}

// 👨‍🍳 Обработка статуса "В работе"
async function handleOrderCooking(orderId: string, message: TelegramMessage, queryId: string) {
  console.log('👨‍🍳 [handleOrderCooking] Started');
  console.log('👨‍🍳 [handleOrderCooking] Order ID:', orderId);
  
  try {
    // 💾 Обновляем БД
    console.log('⏳ [handleOrderCooking] Updating order status to PROCESSING...');
    console.log('⏳ [handleOrderCooking] Order ID:', orderId);
    console.log('⏳ [handleOrderCooking] New status:', OrderStatus.PROCESSING);
    
    let updateResult;
    try {
      updateResult = await prisma.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.PROCESSING },
      });
      console.log('✅ [handleOrderCooking] Prisma update completed successfully');
      console.log('✅ [handleOrderCooking] Updated order:', JSON.stringify(updateResult, null, 2));
    } catch (prismaError) {
      console.error('💥 [handleOrderCooking] Prisma update error:', prismaError);
      console.error('💥 [handleOrderCooking] Error details:', JSON.stringify(prismaError, null, 2));
      throw prismaError;
    }

    // ✏️ Редактируем сообщение
    console.log('✏️ [handleOrderCooking] Editing Telegram message...');
    const originalText = message.text?.split('\n\n')[0] || 'Ordine';
    const updatedText = `${originalText}\n\n👨‍🍳 In preparazione...`;

    const keyboard = {
      inline_keyboard: [[{ text: '✅ Готово', callback_data: `order_status:ready:${orderId}` }]],
    };

    try {
      await editTelegramMessage(message.chat.id, message.message_id, updatedText, keyboard);
      console.log('✅ [handleOrderCooking] Telegram message edited successfully');
    } catch (telegramError) {
      console.error('💥 [handleOrderCooking] Telegram edit error:', telegramError);
    }

    // 📤 Отвечаем на callback
    console.log('📤 [handleOrderCooking] Answering callback query...');
    try {
      await answerCallbackQuery(queryId, '👨‍🍳 In preparazione');
      console.log('✅ [handleOrderCooking] Callback query answered');
    } catch (answerError) {
      console.error('💥 [handleOrderCooking] Answer callback error:', answerError);
    }

    console.log('✅ [handleOrderCooking] Completed successfully');
  } catch (error) {
    console.error('💥 [handleOrderCooking] Fatal error:', error);
    console.error('💥 [handleOrderCooking] Error stack:', error instanceof Error ? error.stack : 'No stack');
    throw error;
  }
}
