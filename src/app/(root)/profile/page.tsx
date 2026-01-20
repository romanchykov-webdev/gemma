import { ProfileForm } from '@/components/shared';
import { Button } from '@/components/ui';
import { adminRoles } from '@/constants/auth-options';
import { getUserSession } from '@/lib/get-user-session';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { prisma } from '../../../../prisma/prisma-client';

export default async function ProfilePage() {
  //
  const session = await getUserSession();

  if (!session) {
    return redirect('/not-auth');
  }

  // ✅ Валидация UUID: проверяем что id корректный (36 символов с дефисами или 32 без)
  const isValidUUID = session.id && (session.id.length === 36 || session.id.length === 32);

  if (!isValidUUID) {
    console.error('[PROFILE] Invalid UUID format:', session.id);
    // Перенаправляем на главную для повторного логина
    return redirect('/api/auth/signout?callbackUrl=/');
  }

  const user = await prisma.user.findFirst({ where: { id: session.id } });
  //

  if (!user) {
    return redirect('/');
  }

  const isAdmin = adminRoles.includes(user?.role);

  console.log('ProfilePage user', user?.role);

  return (
    <>
      {isAdmin && (
        <div className="flex items-center justify-center mt-5">
          <Button variant="outline" className="text-brand-primary">
            <Link href="/dashboard" className="flex gap-2 items-center">
              Admin panel
              <ArrowRight size={16} />
            </Link>
          </Button>
        </div>
      )}
      <ProfileForm data={user} />
    </>
  );
}
