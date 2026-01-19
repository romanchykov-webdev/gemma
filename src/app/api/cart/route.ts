import { Prisma } from "@prisma/client";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../prisma/prisma-client";
import { CreateCartItemValues } from "../../../../services/dto/cart.dto";
export const revalidate = 5;

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
				baseIngredientsSnapshot: true, // ✅ НОВОЕ - загружаем snapshot
				removedBaseIngredientIds: true, // ⚠️ для совместимости
				createdAt: true,
				// Минимум данных о продукте для UI
				product: {
					select: {
						id: true,
						name: true,
						imageUrl: true,
						variants: true,
						baseIngredients: true,
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
		return NextResponse.json({ items: cartItems });
	} catch (error) {
		console.error("[CART_GET] Server error", error);
		return NextResponse.json({ message: "Не удалось загрузить корзину" }, { status: 500 });
	}
}

/**
 * POST /api/cart
 * Добавляет товар в корзину БЕЗ проверки на дубликаты
 * ✅ Вся логика сравнения перенесена на клиент
 */
export async function POST(req: NextRequest) {
	try {
		console.log("📦 [CART_POST] Received request");
		let token = req.cookies.get("cartToken")?.value;

		if (!token) {
			token = crypto.randomUUID();
		}

		const data = (await req.json()) as CreateCartItemValues;

		// ✅ Валидация входных данных
		if (!data.productId || !data.variantId) {
			return NextResponse.json({ message: "productId и variantId обязательны" }, { status: 400 });
		}

		console.log("📦 [CART_POST] Data received:", {
			productId: data.productId,
			variantId: data.variantId,
			ingredients: data.ingredients?.length || 0,
			baseIngredientsSnapshot: data.baseIngredientsSnapshot?.length || 0,
		});

		// ⚡ УПРОЩЕННАЯ ТРАНЗАКЦИЯ - только создание, без проверок
		const itemId = await prisma.$transaction(async (tx) => {
			// 1. Находим или создаем корзину
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

			// 2. Подготавливаем данные
			const sortedIngredients = (data.ingredients || []).sort((a, b) => a - b);
			const baseSnapshot = data.baseIngredientsSnapshot || [];

			// Извлекаем ID удаленных ингредиентов из snapshot
			const removedBaseIds = baseSnapshot
				.filter((ing) => ing.isDisabled && ing.removable)
				.map((ing) => ing.id)
				.sort((a, b) => a - b);

			// 3. ✅ ПРОСТО СОЗДАЕМ новый товар без проверки на дубликаты
			// Клиент уже проверил это на своей стороне
			const newItem = await tx.cartItem.create({
				data: {
					cartId: cart.id,
					productId: data.productId,
					variantId: data.variantId,
					quantity: 1,
					addedIngredientIds: sortedIngredients,
					removedBaseIngredientIds: removedBaseIds,
					baseIngredientsSnapshot:
						baseSnapshot.length > 0 ? (baseSnapshot as unknown as Prisma.InputJsonValue) : undefined,
					...(sortedIngredients.length > 0 && {
						ingredients: {
							connect: sortedIngredients.map((id) => ({ id })),
						},
					}),
				},
				select: { id: true },
			});
			console.log("📦 [CART_POST] New item created:", newItem.id);
			return newItem.id;
		});

		// ✅ Возвращаем успешный результат
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
