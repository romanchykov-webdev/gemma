import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../prisma/prisma-client";

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
	try {
		const params = await context.params;
		const id = params.id;
		const data = (await req.json()) as { quantity: number };
		const token = req.cookies.get("cartToken")?.value;

		if (!token) {
			return NextResponse.json({ message: "Impossibile aggiornare il carrello" }, { status: 401 });
		}

		// ⚡ Одна транзакция: UPDATE item + пересчёт totalAmount одним SQL
		await prisma.$transaction(async (tx) => {
			// Проверяем существование
			const cartItem = await tx.cartItem.findFirst({
				where: { id },
				select: { id: true },
			});
			if (!cartItem) {
				throw new Error("Cart item not found");
			}

			// Обновляем количество
			await tx.cartItem.update({
				where: { id },
				data: { quantity: data.quantity },
			});

			// ✅ Быстрый пересчёт totalAmount одним оптимизированным SQL
			await tx.$executeRaw`
				UPDATE "Cart" c
				SET
					"totalAmount" = COALESCE((
						SELECT SUM(
							(pi.price + COALESCE(ing.total_price, 0)) * ci.quantity
						)::numeric  
						FROM "CartItem" ci
						JOIN "ProductItem" pi ON pi.id = ci."productItemId"
						LEFT JOIN (
							SELECT
								m."A" as cart_item_id,
								SUM(i.price)::numeric as total_price 
							FROM "_CartItemToIngredient" m
							JOIN "Ingredient" i ON i.id = m."B"
							GROUP BY m."A"
						) ing ON ing.cart_item_id = ci.id
						WHERE ci."cartId" = c.id
					), 0),
					"updatedAt" = NOW()
				WHERE c."tokenId" = ${token}
			`;
		});

		// Клиент сам перезапросит корзину
		return NextResponse.json({ success: true });
	} catch (error) {
		console.log("[CART_PATCH] Server error", error);
		return NextResponse.json({ message: "Impossibile aggiornare il carrello" }, { status: 500 });
	}
}

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
// 			// Проверяем существование
// 			const cartItem = await tx.cartItem.findFirst({
// 				where: { id },
// 				select: { id: true },
// 			});
// 			if (!cartItem) {
// 				throw new Error("Cart item not found");
// 			}

// 			// Удаляем
// 			await tx.cartItem.delete({ where: { id } });

// 			// Оптимизированный пересчёт totalAmount
// 			await tx.$executeRaw`
// 		  WITH ingredient_sums AS (
// 			SELECT m."A" AS cart_item_id,
// 				   SUM(i.price)::int AS total_price
// 			FROM "_CartItemToIngredient" m
// 			JOIN "Ingredient" i ON i.id = m."B"
// 			GROUP BY m."A"
// 		  ),
// 		  cart_totals AS (
// 			SELECT ci."cartId",
// 				   SUM((pi.price + COALESCE(ing.total_price,0)) * ci.quantity)::int AS total_amount
// 			FROM "CartItem" ci
// 			JOIN "ProductItem" pi ON pi.id = ci."productItemId"
// 			LEFT JOIN ingredient_sums ing ON ing.cart_item_id = ci.id
// 			GROUP BY ci."cartId"
// 		  )
// 		  UPDATE "Cart" c
// 		  SET "totalAmount" = COALESCE(ct.total_amount,0),
// 			  "updatedAt" = NOW()
// 		  FROM cart_totals ct
// 		  WHERE c.id = ct."cartId" AND c."tokenId" = ${token};
// 		`;
// 		});

// 		return NextResponse.json({ success: true });
// 	} catch (error) {
// 		console.log("[CART_DELETE] Server error", error);
// 		return NextResponse.json({ message: "Impossibile eliminare dal carrello" }, { status: 500 });
// 	}
// }

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
	try {
		const params = await context.params;
		const id = params.id;
		const token = req.cookies.get("cartToken")?.value;

		if (!token) {
			return NextResponse.json({ message: "Impossibile aggiornare il carrello" }, { status: 401 });
		}

		// ⚡ Одна транзакция: удаляем item и пересчитываем totalAmount
		await prisma.$transaction(async (tx) => {
			// Проверяем существование и получаем cartId
			const cartItem = await tx.cartItem.findFirst({
				where: { id },
				select: { id: true, cartId: true }, // 🔥 ДОБАВИЛИ cartId
			});

			if (!cartItem) {
				throw new Error("Cart item not found");
			}

			// Удаляем товар
			await tx.cartItem.delete({ where: { id } });

			// 🔥 ИСПРАВЛЕНО: Пересчитываем totalAmount для конкретной корзины
			// Важно: работает даже когда корзина становится пустой (устанавливает 0)
			await tx.$executeRaw`
				UPDATE "Cart" c
				SET 
					"totalAmount" = COALESCE((
						SELECT SUM(
							(pi.price + COALESCE(
								(SELECT SUM(ing.price)::numeric   
								FROM "_CartItemToIngredient" m
								JOIN "Ingredient" ing ON ing.id = m."B"
								WHERE m."A" = ci.id), 
							0)) * ci.quantity
						)::numeric  
						FROM "CartItem" ci
						JOIN "ProductItem" pi ON pi.id = ci."productItemId"
						WHERE ci."cartId" = c.id
					), 0),
					"updatedAt" = NOW()
				WHERE c.id = ${cartItem.cartId}::uuid
			`;
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.log("[CART_DELETE] Server error", error);
		return NextResponse.json({ message: "Impossibile eliminare dal carrello" }, { status: 500 });
	}
}
