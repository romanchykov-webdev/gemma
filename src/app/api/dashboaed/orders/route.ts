import { NextResponse } from "next/server";
import { prisma } from "../../../../../prisma/prisma-client";

// ✅ Кеширование заказов (обновляется каждые 30 секунд)
export const revalidate = 30;

// 📋 GET - Получение всех заказов
export async function GET() {
	try {
		const orders = await prisma.order.findMany({
			select: {
				id: true,
				fullName: true,
				email: true,
				phone: true,
				address: true,
				totalAmount: true,
				status: true,
				paymentId: true,
				items: true, // JSON с товарами
				comment: true,
				createdAt: true,
				updatedAt: true,
				userId: true,
			},
			orderBy: {
				createdAt: "desc", // Сначала новые
			},
		});

		// Конвертируем Decimal в number
		const ordersWithNumbers = orders.map((order) => ({
			...order,
			totalAmount: Number(order.totalAmount),
		}));

		return NextResponse.json(ordersWithNumbers);
	} catch (error) {
		console.error("[ORDERS_GET] Server error:", error);
		return NextResponse.json({ message: "Impossibile recuperare gli ordini" }, { status: 500 });
	}
}
