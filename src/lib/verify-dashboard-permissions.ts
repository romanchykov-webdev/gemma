import { UserRole } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getUserSession } from './get-user-session';

/**
 * Проверяет, есть ли у пользователя права доступа к админ-панели.
 * Возвращает NextResponse с ошибкой (401 или 403), если доступа нет.
 * Возвращает null, если доступ разрешен.
 */
export async function verifyDashboardPermissions() {
  const session = await getUserSession();

  // 1. Проверка: Залогинен ли пользователь?
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized: Вы не авторизованы' }, { status: 401 });
  }

  // 2. Проверка: Есть ли у него роль Админа или Владельца?
  // (Добавьть сюда позже  другие роли, если нужно, например CONTENT_MAKER)
  if (session.role !== UserRole.ADMIN && session.role !== UserRole.OWNER) {
    return NextResponse.json(
      { message: 'Forbidden: У вас нет прав доступа к этой панели' },
      { status: 403 },
    );
  }

  // 3. Всё чисто, пропускаем
  return null;
}
