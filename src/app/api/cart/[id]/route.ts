import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../prisma/prisma-client";

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
	try {
		const params = await context.params;
		const id = params.id;
		const data = (await req.json()) as { quantity: number };
		const token = req.cookies.get("cartToken")?.value;

		if (!token) {
			return NextResponse.json({ message: "Токен корзины не найден" }, { status: 401 });
		}

		// ✅ Валидация quantity
		if (data.quantity < 1) {
			return NextResponse.json({ message: "Количество должно быть больше 0" }, { status: 400 });
		}

		// ⚡ ПРОСТОЙ UPDATE - без пересчета totalAmount
		await prisma.cartItem.update({
			where: { id },
			data: { quantity: data.quantity },
		});

		// ✅ Возвращаем минимум
		// ❌ НЕ пересчитываем totalAmount (клиент сделает)
		// ❌ НЕ загружаем все товары корзины
		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("[CART_PATCH] Server error", error);
		return NextResponse.json({ message: "Не удалось обновить количество" }, { status: 500 });
	}
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
	try {
		const params = await context.params;
		const id = params.id;
		const token = req.cookies.get("cartToken")?.value;

		if (!token) {
			return NextResponse.json({ message: "Токен корзины не найден" }, { status: 401 });
		}

		// ⚡ ПРОСТОЙ DELETE - без пересчета totalAmount
		await prisma.cartItem.delete({
			where: { id },
		});

		// ✅ Возвращаем минимум
		// ❌ НЕ пересчитываем totalAmount (клиент сделает)
		// ❌ НЕ загружаем все товары корзины
		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("[CART_DELETE] Server error", error);
		return NextResponse.json({ message: "Не удалось удалить товар из корзины" }, { status: 500 });
	}
}
