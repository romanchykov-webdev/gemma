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
 * Добавляет товар в корзину с поддержкой baseIngredientsSnapshot
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

		// ⚡ УПРОЩЕННАЯ ТРАНЗАКЦИЯ
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
			// 2. Подготавливаем данные
			const sortedIngredients = (data.ingredients || []).sort((a, b) => a - b);
			const baseSnapshot = data.baseIngredientsSnapshot || [];

			// ✅ ДОБАВИТЬ: Извлекаем ID удаленных ингредиентов из snapshot
			const removedBaseIds = baseSnapshot
				.filter((ing) => ing.isDisabled && ing.removable)
				.map((ing) => ing.id)
				.sort((a, b) => a - b);

			// 3. ✅ ИСПРАВИТЬ: Проверяем дубликат с учетом removedBaseIngredientIds
			const existingItem = await tx.cartItem.findFirst({
				where: {
					cartId: cart.id,
					productId: data.productId,
					variantId: data.variantId,
					addedIngredientIds: { equals: sortedIngredients },
					removedBaseIngredientIds: { equals: removedBaseIds }, // ✅ ДОБАВИТЬ!
				},
				select: {
					id: true,
					baseIngredientsSnapshot: true,
				},
			});

			// 4. Если нашли - увеличиваем количество
			if (existingItem) {
				// Сравниваем JSON строки для точности
				const existingSnapshot = JSON.stringify(existingItem.baseIngredientsSnapshot || []);
				const newSnapshot = JSON.stringify(baseSnapshot);

				if (existingSnapshot === newSnapshot) {
					await tx.cartItem.update({
						where: { id: existingItem.id },
						data: { quantity: { increment: 1 } },
					});
					console.log("📦 [CART_POST] Item already exists, incremented quantity");
					return existingItem.id;
				}
				// Если snapshot разный - создаем новый товар
			}

			// 5. ✅ ИСПРАВИТЬ: Создаем новый товар с removedBaseIngredientIds
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
