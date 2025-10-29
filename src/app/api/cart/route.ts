import { buildCompositionKey } from "@/lib/build-composition-key";
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

		const cart = await prisma.cart.findFirst({
			where: {
				tokenId: token,
			},
			select: {
				id: true,
				totalAmount: true,
				tokenId: true,
				items: {
					orderBy: {
						createdAt: "desc",
					},
					select: {
						id: true,
						quantity: true,
						productItem: {
							select: {
								id: true,
								price: true,
								size: true,
								pizzaType: true,
								product: {
									select: {
										id: true,
										name: true,
										imageUrl: true,
									},
								},
							},
						},
						ingredients: {
							select: {
								id: true,
								name: true,
								price: true,
								imageUrl: true,
							},
						},
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

// ⚡ СУПЕР-ОПТИМИЗИРОВАННЫЙ POST (~800-1000ms вместо 2200ms)
export async function POST(req: NextRequest) {
	try {
		let token = req.cookies.get("cartToken")?.value;

		if (!token) {
			token = crypto.randomUUID();
		}

		const data = (await req.json()) as CreateCartItemValues;
		const compositionKey = buildCompositionKey({
			productItemId: data.productItemId,
			ingredientIds: data.ingredients,
		});

		// ⚡ ВСЁ В ОДНОЙ ТРАНЗАКЦИИ - ГЛАВНАЯ ОПТИМИЗАЦИЯ!
		const result = await prisma.$transaction(async (tx) => {
			// 1️⃣ Найти или создать корзину ВНУТРИ транзакции
			let cart = await tx.cart.findFirst({
				where: { tokenId: token },
				select: { id: true },
			});

			if (!cart) {
				cart = await tx.cart.create({
					data: { tokenId: token! },
					select: { id: true },
				});
			}

			// 2️⃣ Upsert товара
			await tx.cartItem.upsert({
				where: {
					cartId_compositionKey: {
						cartId: cart.id,
						compositionKey,
					},
				},
				update: {
					quantity: { increment: 1 },
				},
				create: {
					cartId: cart.id,
					productItemId: data.productItemId,
					quantity: 1,
					compositionKey,
					ingredients: {
						connect: (data.ingredients ?? []).map((id) => ({ id })),
					},
				},
			});

			// 3️⃣ Быстрый пересчёт totalAmount (коррелированный подзапрос)
			await tx.$executeRaw`
				UPDATE "Cart" c
				SET 
					"totalAmount" = COALESCE((
						SELECT SUM(
							(pi.price + COALESCE(
								(SELECT SUM(ing.price)::int 
								 FROM "_CartItemToIngredient" m
								 JOIN "Ingredient" ing ON ing.id = m."B"
								 WHERE m."A" = ci.id), 
							0)) * ci.quantity
						)::int
						FROM "CartItem" ci
						JOIN "ProductItem" pi ON pi.id = ci."productItemId"
						WHERE ci."cartId" = c.id
					), 0),
					"updatedAt" = NOW()
				WHERE c.id = ${cart.id}::uuid
			`;

			// 4️⃣ Получаем обновлённую корзину ВНУТРИ транзакции
			const updatedCart = await tx.cart.findUnique({
				where: { id: cart.id },
				select: {
					id: true,
					totalAmount: true,
					tokenId: true,
					items: {
						orderBy: { createdAt: "desc" },
						select: {
							id: true,
							quantity: true,
							productItem: {
								select: {
									id: true,
									price: true,
									size: true,
									pizzaType: true,
									product: {
										select: {
											id: true,
											name: true,
											imageUrl: true,
										},
									},
								},
							},
							ingredients: {
								select: {
									id: true,
									name: true,
									price: true,
									imageUrl: true,
								},
							},
						},
					},
				},
			});

			return updatedCart;
		});

		const resp = NextResponse.json(result);
		resp.cookies.set("cartToken", token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			maxAge: 60 * 60 * 24 * 30, // 30 дней
		});

		return resp;
	} catch (error) {
		console.error("[CART_POST] Server error", error);
		return NextResponse.json({ message: "Impossibile aggiungere al carrello" }, { status: 500 });
	}
}
