/**
 * Безопасно извлекает сообщение об ошибке из ответа Axios
 * Защищает от [object Object] при получении массива ошибок от валидатора (Zod/Class-validator)
 */
export const getErrorMessage = (error: unknown, fallback: string): string => {
  if (!(error instanceof Error) || !('response' in error)) {
    return fallback;
  }

  // Безопасное приведение типа для AxiosError-подобного объекта
  const axiosError = error as { response?: { data?: { message?: unknown } } };
  const msg = axiosError.response?.data?.message;

  if (typeof msg === 'string') {
    return msg;
  }

  if (Array.isArray(msg)) {
    return msg.join(', ');
  }

  return fallback;
};
