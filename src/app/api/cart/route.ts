import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../prisma/prisma-client";
import { CreateCartItemValues } from "../../../../services/dto/cart.dto";

export const revalidate = 5;

// Вспомогательная функция для подсчета цены одной позиции
// (понадобится, так как SQL запрос больше не сработает из-за JSON)
const calculateCartItemTotal = (item: any): number => {
	const variants = item.product.variants as any[];
	const variant = variants.find((v) => v.variantId === item.variantId);

	if (!variant) return 0;

	const ingredientsPrice = item.ingredients.reduce((acc: number, ing: any) => acc + Number(ing.price), 0);
	return (variant.price + ingredientsPrice) * item.quantity;
};

/**
 * GET /api/cart
 * Загружает товары из корзины (RAW данные)
 * Клиент сам пересчитает цены используя stores
 */
export async function GET(req: NextRequest) {
	try {
		const token = req.cookies.get("cartToken")?.value;

		if (!token) {
			return NextResponse.json({ items: [] });
		}

		// ⚡ Минимальная выборка - только нужные поля
		const cartItems = await prisma.cartItem.findMany({
			where: {
				cart: {
					tokenId: token,
				},
			},
			select: {
				id: true,
				productId: true,
				variantId: true,
				quantity: true,
				addedIngredientIds: true,
				createdAt: true,
				// Минимум данных о продукте для UI
				product: {
					select: {
						id: true,
						name: true,
						imageUrl: true,
						variants: true,
					},
				},
				// Минимум данных об ингредиентах для UI
				ingredients: {
					select: {
						id: true,
						name: true,
						imageUrl: true,
						price: true,
					},
				},
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		// ✅ Возвращаем RAW данные
		// ❌ НЕ считаем цены (клиент сделает это сам)
		// ❌ НЕ загружаем sizes/types (они уже в store)
		return NextResponse.json({ items: cartItems });
	} catch (error) {
		console.error("[CART_GET] Server error", error);
		return NextResponse.json({ message: "Не удалось загрузить корзину" }, { status: 500 });
	}
}

/**
 * POST /api/cart
 * Добавляет товар в корзину (простой INSERT)
 * Без вычислений - только сохранение в БД
 */
export async function POST(req: NextRequest) {
	try {
		console.log("📦 [CART_POST] Received request");
		console.log("📦 Headers:", req.headers.get("content-type"));
		let token = req.cookies.get("cartToken")?.value;

		if (!token) {
			token = crypto.randomUUID();
		}

		const data = (await req.json()) as CreateCartItemValues;

		// ✅ Валидация входных данных
		if (!data.productId || !data.variantId) {
			return NextResponse.json({ message: "productId и variantId обязательны" }, { status: 400 });
		}

		// ⚡ УПРОЩЕННАЯ ТРАНЗАКЦИЯ - только INSERT/UPDATE
		const itemId = await prisma.$transaction(async (tx) => {
			// 1. Находим или создаем корзину (минимальная выборка)
			let cart = await tx.cart.findFirst({
				where: { tokenId: token },
				select: { id: true }, // ← Только ID!
			});

			if (!cart) {
				cart = await tx.cart.create({
					data: { tokenId: token! },
					select: { id: true },
				});
			}

			// 2. Сортируем ингредиенты для корректного сравнения
			const sortedIngredients = (data.ingredients || []).sort((a, b) => a - b);

			// 3. Проверяем дубликат (минимальная выборка)
			const existingItem = await tx.cartItem.findFirst({
				where: {
					cartId: cart.id,
					productId: data.productId,
					variantId: data.variantId,
					addedIngredientIds: { equals: sortedIngredients },
				},
				select: { id: true }, // ← Только ID!
			});

			if (existingItem) {
				// Увеличиваем количество
				await tx.cartItem.update({
					where: { id: existingItem.id },
					data: { quantity: { increment: 1 } },
				});
				return existingItem.id;
			} else {
				// Создаем новый товар
				const newItem = await tx.cartItem.create({
					data: {
						cartId: cart.id,
						productId: data.productId,
						variantId: data.variantId,
						quantity: 1,
						addedIngredientIds: sortedIngredients,
						// ✅ ВАЖНО: Связываем ингредиенты только если они есть
						...(sortedIngredients.length > 0 && {
							ingredients: {
								connect: sortedIngredients.map((id) => ({ id })),
							},
						}),
					},
					select: { id: true }, // ← Только ID!
				});
				return newItem.id;
			}

			// ❌ НЕ пересчитываем totalAmount!
			// ❌ НЕ загружаем все товары!
			// ✅ Клиент сам пересчитает локально
		});

		// ✅ Возвращаем минимум данных
		const resp = NextResponse.json({
			success: true,
			itemId,
		});

		resp.cookies.set("cartToken", token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			maxAge: 60 * 60 * 24 * 30, // 30 дней
		});

		return resp;
	} catch (error) {
		console.error("[CART_POST] Server error", error);
		return NextResponse.json({ message: "Не удалось добавить товар в корзину" }, { status: 500 });
	}
}
