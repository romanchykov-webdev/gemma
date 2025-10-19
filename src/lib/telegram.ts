import 'server-only';

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
