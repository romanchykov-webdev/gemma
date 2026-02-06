import 'server-only';

// 📦 Базовая функция отправки текстового сообщения
export async function sendTelegramMessage(text: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn('[TELEGRAM] Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID');
    return false;
  }

  try {
    const resp = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
      cache: 'no-store',
      next: { revalidate: 0 },
    });

    const data = await resp.json();
    if (!resp.ok || !data?.ok) {
      console.error('[TELEGRAM] API error:', data);
      return false;
    }
    return true;
  } catch (e) {
    console.error('[TELEGRAM] Send failed:', e);
    return false;
  }
}

// 🎯 Типы для Inline-клавиатуры
type InlineKeyboardButton = {
  text: string;
  callback_data: string;
};

type InlineKeyboardMarkup = {
  inline_keyboard: InlineKeyboardButton[][];
};

// 🚀 Функция отправки уведомления о заказе с кнопками управления
export async function sendOrderNotification(
  text: string,
  orderId: string,
): Promise<{ success: boolean; messageId?: number }> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn('[TELEGRAM] Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID');
    return { success: false };
  }

  try {
    // 🇮🇹 Создаем Inline-клавиатуру на итальянском
    const keyboard: InlineKeyboardMarkup = {
      inline_keyboard: [
        // 1. Быстрые таймеры
        [
          { text: '15 min', callback_data: `order_time:15:${orderId}` },
          { text: '30 min', callback_data: `order_time:30:${orderId}` },
          { text: '45 min', callback_data: `order_time:45:${orderId}` },
          { text: '60 min', callback_data: `order_time:60:${orderId}` },
        ],
        // 2. Статусы без таймера
        [
          {
            text: '👨‍🍳 In preparazione', // Было "В работе"
            callback_data: `order_status:cooking:${orderId}`,
          },
          {
            text: '✅ Pronto', // Было "Готов"
            callback_data: `order_status:ready:${orderId}`,
          },
        ],
      ],
    };

    // 📤 Отправляем сообщение с кнопками
    const resp = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        reply_markup: keyboard,
      }),
      cache: 'no-store',
      next: { revalidate: 0 },
    });

    const data = await resp.json();
    if (!resp.ok || !data?.ok) {
      console.error('[TELEGRAM] API error:', data);
      return { success: false };
    }

    return {
      success: true,
      messageId: data.result?.message_id,
    };
  } catch (e) {
    console.error('[TELEGRAM] Send order notification failed:', e);
    return { success: false };
  }
}

// 🔄 Функция редактирования сообщения в Telegram
export async function editTelegramMessage(
  chatId: string | number,
  messageId: number,
  text: string,
  keyboard?: InlineKeyboardMarkup,
): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    console.warn('[TELEGRAM] Missing TELEGRAM_BOT_TOKEN');
    return false;
  }

  try {
    const body: Record<string, unknown> = {
      chat_id: chatId,
      message_id: messageId,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    };

    if (keyboard) {
      body.reply_markup = keyboard;
    }

    const resp = await fetch(`https://api.telegram.org/bot${token}/editMessageText`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
      next: { revalidate: 0 },
    });

    const data = await resp.json();
    if (!resp.ok || !data?.ok) {
      // Игнорируем ошибку, если сообщение не изменилось (Telegram часто ругается на это)
      if (data.description?.includes('message is not modified')) {
        return true;
      }
      console.error('[TELEGRAM] Edit message error:', data);
      return false;
    }
    return true;
  } catch (e) {
    console.error('[TELEGRAM] Edit message failed:', e);
    return false;
  }
}

// ✅ Функция ответа на callback query
export async function answerCallbackQuery(
  callbackQueryId: string,
  text?: string,
): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    console.warn('[TELEGRAM] Missing TELEGRAM_BOT_TOKEN');
    return false;
  }

  try {
    const resp = await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text: text || 'Fatto!', // Итальянский по умолчанию
        show_alert: false,
      }),
      cache: 'no-store',
      next: { revalidate: 0 },
    });

    const data = await resp.json();
    if (!resp.ok || !data?.ok) {
      console.error('[TELEGRAM] Answer callback query error:', data);
      return false;
    }
    return true;
  } catch (e) {
    console.error('[TELEGRAM] Answer callback query failed:', e);
    return false;
  }
}
