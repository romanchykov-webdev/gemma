// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "../../../../../prisma/prisma-client";

// // Вспомогательная функция для подсчета цены одной позиции
// const calculateCartItemTotal = (item: any): number => {
// 	const variants = item.product.variants as any[];
// 	const variant = variants.find((v) => v.variantId === item.variantId);

// 	if (!variant) return 0;

// 	const ingredientsPrice = item.ingredients.reduce((acc: number, ing: any) => acc + Number(ing.price), 0);
// 	return (variant.price + ingredientsPrice) * item.quantity;
// };
// //
// export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
// 	try {
// 		const params = await context.params;
// 		const id = params.id;
// 		const data = (await req.json()) as { quantity: number };
// 		const token = req.cookies.get("cartToken")?.value;

// 		if (!token) {
// 			return NextResponse.json({ message: "Impossibile aggiornare il carrello" }, { status: 401 });
// 		}

// 		// ⚡ Одна транзакция: UPDATE item + пересчёт totalAmount одним SQL
// 		// ✅ Обновленная транзакция для новой схемы
// 		await prisma.$transaction(async (tx) => {
// 			// Проверяем существование и получаем cartId
// 			const cartItem = await tx.cartItem.findFirst({
// 				where: { id },
// 				select: { id: true, cartId: true },
// 			});

// 			if (!cartItem) {
// 				throw new Error("Cart item not found");
// 			}

// 			// Обновляем количество
// 			await tx.cartItem.update({
// 				where: { id },
// 				data: { quantity: data.quantity },
// 			});

// 			// ✅ Пересчитываем totalAmount через Prisma (так как цены в JSON)
// 			const updatedItems = await tx.cartItem.findMany({
// 				where: { cartId: cartItem.cartId },
// 				include: {
// 					product: true,
// 					ingredients: true,
// 				},
// 			});

// 			const totalAmount = updatedItems.reduce((acc, item) => {
// 				return acc + calculateCartItemTotal(item);
// 			}, 0);

// 			// Обновляем корзину
// 			await tx.cart.update({
// 				where: { id: cartItem.cartId },
// 				data: {
// 					totalAmount: totalAmount,
// 					updatedAt: new Date(),
// 				},
// 			});
// 		});

// 		// Клиент сам перезапросит корзину
// 		return NextResponse.json({ success: true });
// 	} catch (error) {
// 		console.error("[CART_PATCH] Server error", error);
// 		return NextResponse.json({ message: "Impossibile aggiornare il carrello" }, { status: 500 });
// 	}
// }

// export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
// 	try {
// 		const params = await context.params;
// 		const id = params.id;
// 		const token = req.cookies.get("cartToken")?.value;

// 		if (!token) {
// 			return NextResponse.json({ message: "Impossibile aggiornare il carrello" }, { status: 401 });
// 		}

// 		// ⚡ Одна транзакция: удаляем item и пересчитываем totalAmount
// 		await prisma.$transaction(async (tx) => {
// 			// Проверяем существование и получаем cartId
// 			const cartItem = await tx.cartItem.findFirst({
// 				where: { id },
// 				select: { id: true, cartId: true },
// 			});

// 			if (!cartItem) {
// 				throw new Error("Cart item not found");
// 			}

// 			// Удаляем товар
// 			await tx.cartItem.delete({ where: { id } });

// 			// ✅ Пересчитываем totalAmount через Prisma
// 			const updatedItems = await tx.cartItem.findMany({
// 				where: { cartId: cartItem.cartId },
// 				include: {
// 					product: true,
// 					ingredients: true,
// 				},
// 			});

// 			const totalAmount = updatedItems.reduce((acc, item) => {
// 				return acc + calculateCartItemTotal(item);
// 			}, 0);

// 			// Обновляем корзину
// 			await tx.cart.update({
// 				where: { id: cartItem.cartId },
// 				data: {
// 					totalAmount: totalAmount,
// 					updatedAt: new Date(),
// 				},
// 			});
// 		});

// 		return NextResponse.json({ success: true });
// 	} catch (error) {
// 		console.error("[CART_DELETE] Server error", error);
// 		return NextResponse.json({ message: "Impossibile eliminare dal carrello" }, { status: 500 });
// 	}
// }

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
