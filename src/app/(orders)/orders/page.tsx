import { Container, Title } from '@/components/shared';
import { OrderInnfoSection } from '@/components/shared/orders-dashbord/header-info-section/order-innfo-section';
import { OrdersClientWrapper } from '@/components/shared/orders-dashbord/status-search-data/orders-client-wrapper';
import { RefreshButton } from '@/components/shared/orders-dashbord/status-search-data/refresh-button';

import { OrderFilters } from '@/@types/orders';
import { adminRoles } from '@/constants/auth-options';
import { getOrders } from '@/lib/get-orders';
import { getOrdersStats } from '@/lib/get-orders-stats';
import { getUserSession } from '@/lib/get-user-session';
import { redirect } from 'next/navigation';
import { prisma } from '../../../../prisma/prisma-client';

// ⚡ Добавляем revalidate для кеширования (30 секунд)
export const revalidate = 30;

// 📅 В URL только дата; статус (Tutti/In attesa/Pronti) — клиентская фильтрация
type SearchParams = Promise<{ date?: string }>;

export default async function OrdersPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await getUserSession();

  if (!session) {
    return redirect('/not-auth');
  }

  // ✅ Валидация UUID
  const isValidUUID = session.id && (session.id.length === 36 || session.id.length === 32);

  if (!isValidUUID) {
    console.error('[ORDERS] Invalid UUID format:', session.id);
    return redirect('/api/auth/signout?callbackUrl=/');
  }

  const user = await prisma.user.findFirst({
    where: { id: session.id },
    select: { id: true, role: true, fullName: true },
  });

  if (!user) {
    return redirect('/');
  }

  // ✅ Проверка прав (ADMIN, CONTENT_MAKER, OWNER)
  if (!adminRoles.includes(user.role)) {
    return redirect('/not-auth');
  }

  // 🔍 Парсим параметры: только дата (статус фильтруется на клиенте)
  const params = await searchParams;

  const today = new Date();
  const defaultDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const date = params.date || defaultDate;
  // Запрос только по дате — все заказы за день, фильтр по статусу на клиенте
  const filters: OrderFilters = { date };

  // ⚡ Один запрос за заказы за выбранную дату (все статусы)
  const [orders, stats] = await Promise.all([getOrders(filters), getOrdersStats(filters)]);

  return (
    <Container className="mt-10">
      <div className="flex justify-between items-center mb-6">
        <Title text="Gestione Ordini" size="lg" className="font-extrabold" />
        <RefreshButton />
      </div>

      {/* 📊 header info section - передаем реальную статистику */}
      <OrderInnfoSection stats={stats} />

      {/* 🎛️ Фильтр по статусу и поиск — только на клиенте, без лишних запросов */}
      <OrdersClientWrapper date={date} statusCounts={stats.statusCounts} orders={orders} />
    </Container>
  );
}
