import { Container, Title } from '@/components/shared';
import { OrderInnfoSection } from '@/components/shared/orders-dashbord/header-info-section/order-innfo-section';
import { adminRoles } from '@/constants/auth-options';
import { getUserSession } from '@/lib/get-user-session';
import { redirect } from 'next/navigation';
import { prisma } from '../../../../prisma/prisma-client';

export default async function OrdersPage() {
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

  return (
    <Container className="mt-10">
      <Title text="Gestione Ordini" size="lg" className="font-extrabold text-center" />
      {/* header info section */}
      <OrderInnfoSection />
    </Container>
  );
}
