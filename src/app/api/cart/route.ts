import { buildCompositionKey } from "@/lib/build-composition-key";
import { findOrCreateCart } from "@/lib/find-or-create-cart";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../prisma/prisma-client";
import { CreateCartItemValues } from "../../../../services/dto/cart.dto";

export async function GET(req: NextRequest) {
	try {
		const token = req.cookies.get("cartToken")?.value;

		if (!token) {
			return NextResponse.json({ totalAmount: 0, items: [] });
		}

		// ⚡ Убрали DISTINCT для ускорения
		const result = await prisma.$queryRawUnsafe<any[]>(
			`
			SELECT 
				c.id,
				c."userId",
				c."tokenId",
				c."totalAmount",
				c."createdAt",
				c."updatedAt",
				COALESCE(
					json_agg(
						jsonb_build_object(
							'id', ci.id,
							'quantity', ci.quantity,
							'pizzaSize', ci."pizzaSize",
							'type', ci.type,
							'createdAt', ci."createdAt",
							'productItem', jsonb_build_object(
								'id', pi.id,
								'price', pi.price,
								'size', pi.size,
								'pizzaType', pi."pizzaType",
								'product', jsonb_build_object(
									'id', p.id,
									'name', p.name,
									'imageUrl', p."imageUrl"
								)
							),
							'ingredients', COALESCE(
								(
									SELECT json_agg(
										jsonb_build_object(
											'id', ing.id,
											'name', ing.name,
											'price', ing.price,
											'imageUrl', ing."imageUrl"
										)
									)
									FROM "_CartItemToIngredient" m
									JOIN "Ingredient" ing ON ing.id = m."B"
									WHERE m."A" = ci.id
								),
								'[]'::json
							)
						)
						ORDER BY ci."createdAt" DESC
					) FILTER (WHERE ci.id IS NOT NULL),
					'[]'::json
				) as items
			FROM "Cart" c
			LEFT JOIN "CartItem" ci ON ci."cartId" = c.id
			LEFT JOIN "ProductItem" pi ON pi.id = ci."productItemId"
			LEFT JOIN "Product" p ON p.id = pi."productId"
			WHERE c."tokenId" = $1
			GROUP BY c.id
			`,
			token,
		);

		const cart = result[0] || { totalAmount: 0, items: [] };

		// Дедупликация на клиенте (на всякий случай)
		if (cart.items && Array.isArray(cart.items)) {
			const seen = new Set();
			cart.items = cart.items.filter((item: any) => {
				if (seen.has(item.id)) return false;
				seen.add(item.id);
				return true;
			});
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
