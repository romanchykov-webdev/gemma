import { verifyDashboardPermissions } from '@/lib/verify-dashboard-permissions';
import { hash } from 'bcrypt';
import { NextResponse } from 'next/server';
import { prisma } from '../../../../../prisma/prisma-client';

export const revalidate = 30;

// GET - получить всех пользователей
export async function GET() {
  // 🛡️ защита
  const permissionError = await verifyDashboardPermissions();
  if (permissionError) return permissionError;
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        address: true,
        role: true,
        provider: true,
        verified: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            orders: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('[USERS_GET] Error:', error);
    return NextResponse.json({ message: 'Errore nel recupero degli utenti' }, { status: 500 });
  }
}

// POST - создать пользователя
export async function POST(req: Request) {
  // 🛡️ защита
  const permissionError = await verifyDashboardPermissions();
  if (permissionError) return permissionError;
  try {
    const body = await req.json();
    const { fullName, email, password, phone, address, role } = body;

    // Валидация
    if (!fullName || !email || !password) {
      return NextResponse.json({ message: 'Dati obbligatori mancanti' }, { status: 400 });
    }

    // Проверка на существование email
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'Questo indirizzo email è già registrato' },
        { status: 400 },
      );
    }

    // Хэшируем пароль
    const hashedPassword = await hash(password, 10);

    // Создаем пользователя
    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
        phone: phone || null,
        address: address || null,
        role: role || 'USER',
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        address: true,
        role: true,
        provider: true,
        verified: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            orders: true,
          },
        },
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('[USERS_POST] Error:', error);
    return NextResponse.json({ message: "Errore nella creazione dell'utente" }, { status: 500 });
  }
}
