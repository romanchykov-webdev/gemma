import { cache } from 'react';
import { prisma } from '../../prisma/prisma-client';

export interface StoreSettingsDTO {
  id: number;
  storeName: string;
  phone: string;
  email: string;
  address: string;

  socialLinks: Record<string, string | null>;

  deliveryPrice: number;
  minOrderAmount: number;
  vatPercent: number;
  freeDeliveryThreshold: number | null;

  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
}

/**
 * Получает настройки магазина.
 * Использует React.cache для дедупликации запросов в рамках одного рендера.
 * * 🚨 Если база недоступна или настройки не найдены — выбросит ошибку.
 */
export const getStoreSettings = cache(async (): Promise<StoreSettingsDTO> => {
  const settings = await prisma.storeSettings.findFirst({
    where: { id: 1 },
  });

  if (!settings) {
    // Если база пустая, мы должны узнать об этом сразу.
    // Это критическая ошибка, так как без настроек сайт не может работать корректно.
    throw new Error('❌ [STORE_SETTINGS] Settings not found. Did you run `npx prisma db seed`?');
  }

  return {
    id: settings.id,
    storeName: settings.storeName,
    phone: settings.phone,
    email: settings.email,
    address: settings.address,

    // Приводим JSON к нужному типу (или пустой объект, если null)
    socialLinks: (settings.socialLinks as Record<string, string | null>) || {},

    // Приводим Decimal к Number
    deliveryPrice: Number(settings.deliveryPrice),
    minOrderAmount: Number(settings.minOrderAmount),
    vatPercent: Number(settings.vatPercent),
    freeDeliveryThreshold: settings.freeDeliveryThreshold
      ? Number(settings.freeDeliveryThreshold)
      : null,

    monday: settings.monday,
    tuesday: settings.tuesday,
    wednesday: settings.wednesday,
    thursday: settings.thursday,
    friday: settings.friday,
    saturday: settings.saturday,
    sunday: settings.sunday,
  };
});
