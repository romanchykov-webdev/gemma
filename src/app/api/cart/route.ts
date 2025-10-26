import { buildCompositionKey } from "@/lib/build-composition-key";
import { findOrCreateCart } from "@/lib/find-or-create-cart";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../prisma/prisma-client";
import { CreateCartItemValues } from "../../../../services/dto/cart.dto";

// ✅ Кеширование для корзины (5 секунд)
export const revalidate = 5;

export async function GET(req: NextRequest) {
	try {
		const token = req.cookies.get("cartToken")?.value;

		if (!token) {
			return NextResponse.json({ totalAmount: 0, items: [] });
		}

		// ✅ Оптимизированный Prisma запрос с include для вложенных связей
		// Include может быть эффективнее для глубоких связей в Supabase
		const cart = await prisma.cart.findFirst({
			where: {
				tokenId: token,
			},
			include: {
				items: {
					orderBy: {
						createdAt: "desc",
					},
					include: {
						productItem: {
							include: {
								product: true,
							},
						},
						ingredients: true,
					},
				},
			},
		});

		if (!cart) {
			return NextResponse.json({ totalAmount: 0, items: [] });
		}

		return NextResponse.json(cart);
	} catch (error) {
		console.error("[CART_GET] Server error", error);
		return NextResponse.json({ message: "Impossibile recuperare il carrello" }, { status: 500 });
	}
}

export async function POST(req: NextRequest) {
	try {
		let token = req.cookies.get("cartToken")?.value;

		if (!token) {
			token = crypto.randomUUID();
		}

		const userCart = await findOrCreateCart(token);
		const data = (await req.json()) as CreateCartItemValues;

		const compositionKey = buildCompositionKey({
			productItemId: data.productItemId,
			ingredientIds: data.ingredients,
		});

		// ⚡ Быстрая транзакция: только upsert + update totalAmount одним SQL
		await prisma.$transaction(async (tx) => {
			// 1) upsert - создать или увеличить количество
			await tx.cartItem.upsert({
				where: {
					cartId_compositionKey: {
						cartId: userCart.id,
						compositionKey,
					},
				},
				update: {
					quantity: { increment: 1 },
				},
				create: {
					cartId: userCart.id,
					productItemId: data.productItemId,
					quantity: 1,
					compositionKey,
					ingredients: {
						connect: (data.ingredients ?? []).map((id) => ({ id })),
					},
				},
			});

			// ✅ 2) Быстрый пересчёт totalAmount одним оптимизированным SQL
			await tx.$executeRaw`
				UPDATE "Cart" c
				SET 
					"totalAmount" = COALESCE((
						SELECT SUM(
							(pi.price + COALESCE(ing.total_price, 0)) * ci.quantity
						)::int
						FROM "CartItem" ci
						JOIN "ProductItem" pi ON pi.id = ci."productItemId"
						LEFT JOIN (
							SELECT 
								m."A" as cart_item_id,
								SUM(i.price)::int as total_price
							FROM "_CartItemToIngredient" m
							JOIN "Ingredient" i ON i.id = m."B"
							GROUP BY m."A"
						) ing ON ing.cart_item_id = ci.id
						WHERE ci."cartId" = c.id
					), 0),
					"updatedAt" = NOW()
				WHERE c.id = ${userCart.id}::uuid
			`;
		});

		// Возвращаем только success - клиент сам запросит GET /api/cart
		const resp = NextResponse.json({ success: true });
		resp.cookies.set("cartToken", token);
		return resp;
	} catch (error) {
		console.error("[CART_POST] Server error", error);
		return NextResponse.json({ message: "Impossibile aggiungere al carrello" }, { status: 500 });
	}
}
