import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../prisma/prisma-client';

export async function GET() {
  const users = await prisma.user.findMany();
  return NextResponse.json(users);
}

export async function POST(reg: NextRequest) {
  const body = await reg.json();

  const user = await prisma.user.create({
    data: {
      ...body,
      role: body.role || 'USER',
    },
  });
  return NextResponse.json(user);
}
