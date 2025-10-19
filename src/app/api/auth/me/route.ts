import { authOptions } from '@/constants/auth-options';
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { prisma } from '../../../../../prisma/prisma-client';

export const dynamic = 'force-dynamic';

export async function GET() {
  //
  try {
    //

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Вы не авторизованны, заполните все необходимые поля' },
        { status: 401 },
      );
    }

    const data = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        fullName: true,
        email: true,
        phone: true,
        address: true,
        password: false,
      },
    });

    return NextResponse.json(data);
    //
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: '[USER_GET] Server error' }, { status: 500 });
  }
  //
}
