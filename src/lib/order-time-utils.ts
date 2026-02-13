/**
 * Форматирует дату в итальянском формате времени (HH:mm).
 * 🛡️ Если дата невалидна или отсутствует — вернет пустую строку.
 */
export const formatOrderTime = (dateString?: string | Date | null): string => {
  if (!dateString) {
    return '';
  }

  try {
    const date = new Date(dateString);

    // Проверка на Invalid Date (если пришла строка, которую нельзя распарсить)
    if (isNaN(date.getTime())) {
      return '';
    }

    return date.toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Rome',
    });
  } catch (error) {
    console.error('formatOrderTime error', error);
    return '';
  }
};

/**
 * Считает, сколько минут осталось до указанного времени.
 * 🛡️ Возвращает 0, если время уже прошло или дата невалидна.
 */
export const getRemainingMinutes = (targetDateString?: string | Date | null): number => {
  if (!targetDateString) {
    return 0;
  }

  try {
    const targetTime = new Date(targetDateString).getTime();

    // Проверка на Invalid Date
    if (isNaN(targetTime)) {
      return 0;
    }

    const now = Date.now();
    const diffMinutes = Math.ceil((targetTime - now) / 60000);

    return Math.max(0, diffMinutes);
  } catch (error) {
    console.error('getRemainingMinutes error', error);
    return 0;
  }
};
