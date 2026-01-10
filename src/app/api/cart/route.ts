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
			include: {
				items: {
					orderBy: {
						createdAt: "desc",
					},
					include: {
						product: true, // Получаем продукт целиком (включая JSON variants)
						ingredients: true,
					},
				},
			},
		});

		if (!cart) {
			return NextResponse.json({ totalAmount: 0, items: [] });
		}

		// Загружаем справочники, чтобы подставить названия размеров и типов теста
		// (так как в JSON variants лежат только ID: sizeId, typeId)
		const sizes = await prisma.size.findMany();
		const types = await prisma.type.findMany();

		// Трансформируем данные в формат, который ожидает фронтенд
		// Мы "симулируем" наличие productItem
		const items = cart.items.map((item) => {
			const variants = item.product.variants as any[];
			const currentVariant = variants.find((v) => v.variantId === item.variantId);

			// Находим названия из справочников
			const size = sizes.find((s) => s.id === currentVariant?.sizeId);
			const type = types.find((t) => t.id === currentVariant?.typeId);

			return {
				id: item.id,
				quantity: item.quantity,
				// Собираем объект, похожий на старый ProductItem, чтобы не ломать фронтенд
				productItem: {
					id: item.variantId,
					price: currentVariant?.price || 0,
					productId: item.productId,
					size: size
						? {
								value: size.value,
								name: size.name,
							}
						: null,
					doughType: type
						? {
								value: type.value, // или type.name, в зависимости от схемы
								name: type.name,
							}
						: null,
					product: {
						id: item.product.id,
						name: item.product.name,
						imageUrl: item.product.imageUrl,
					},
				},
				ingredients: item.ingredients.map((ing) => ({
					id: ing.id,
					name: ing.name,
					price: Number(ing.price),
					imageUrl: ing.imageUrl,
				})),
			};
		});

		return NextResponse.json({
			id: cart.id,
			totalAmount: Number(cart.totalAmount),
			tokenId: cart.tokenId,
			items: items,
		});
	} catch (error) {
		console.error("[CART_GET] Server error", error);
		return NextResponse.json({ message: "Impossibile recuperare il carrello" }, { status: 500 });
	}
}

// export async function POST(req: NextRequest) {
// 	try {
// 		let token = req.cookies.get("cartToken")?.value;

// 		if (!token) {
// 			token = crypto.randomUUID();
// 		}

// 		const data = (await req.json()) as CreateCartItemValues;

// 		/* ВАЖНО: Ваш фронтенд сейчас, скорее всего, присылает productItemId.
//            В новой схеме нам нужны productId и variantId.

//            Если вы еще не обновили фронтенд, вам нужно решить, откуда брать productId.
//            Предположим, что data.productItemId теперь содержит ID продукта,
//            а variantId нужно передавать отдельно или вычислять.

//            Ниже пример, если фронтенд отправляет { productId, variantId, ingredients }.
//         */

// 		// Временно для совместимости:
// 		// Если вы не меняли DTO, предположим, что вы передаете нужные ID.
// 		// Вам нужно обновить DTO: productItemId -> productId + variantId
// 		const productId = data.productId; // ВАЖНО: нужно добавить это поле в запрос с фронта
// 		const variantId = data.variantId || 1; // ВАЖНО: нужно добавить это поле

// 		const result = await prisma.$transaction(async (tx) => {
// 			// 1. Находим или создаем корзину
// 			let cart = await tx.cart.findFirst({
// 				where: { tokenId: token },
// 			});

// 			if (!cart) {
// 				cart = await tx.cart.create({
// 					data: { tokenId: token! },
// 				});
// 			}

// 			// ✅ Убеждаемся, что cart точно определен
// 			if (!cart) {
// 				throw new Error("Failed to create or find cart");
// 			}

// 			// 2. Ищем, есть ли уже такой товар в корзине с такими же ингредиентами
// 			// Prisma не умеет делать upsert по массивам (addedIngredientIds),
// 			// поэтому делаем поиск + create/update вручную или через findFirst

// 			// Сортируем ID ингредиентов для точного сравнения
// 			const sortedIngredients = (data.ingredients || []).sort((a, b) => a - b);

// 			// Более надежный поиск существующего товара (с учетом ингредиентов)
// 			const findItemInCart = await tx.cartItem.findFirst({
// 				where: {
// 					cartId: cart.id,
// 					productId: productId,
// 					variantId: variantId,
// 					// Проверяем совпадение добавленных ингредиентов
// 					addedIngredientIds: { equals: sortedIngredients },
// 				},
// 			});

// 			if (findItemInCart) {
// 				await tx.cartItem.update({
// 					where: { id: findItemInCart.id },
// 					data: { quantity: { increment: 1 } },
// 				});
// 			} else {
// 				await tx.cartItem.create({
// 					data: {
// 						cartId: cart.id,
// 						productId: productId,
// 						variantId: variantId,
// 						quantity: 1,
// 						addedIngredientIds: sortedIngredients, // Записываем ID добавок
// 						ingredients: {
// 							connect: sortedIngredients.map((id) => ({ id })),
// 						},
// 					},
// 				});
// 			}

// 			// 3. Пересчитываем TotalAmount
// 			// Мы не можем использовать старый SQL запрос, так как цены в JSON
// 			// Придется вытащить все товары корзины и посчитать сумму
// 			const updatedItems = await tx.cartItem.findMany({
// 				where: { cartId: cart.id },
// 				include: {
// 					product: true,
// 					ingredients: true,
// 				},
// 			});

// 			const totalAmount = updatedItems.reduce((acc, item) => {
// 				return acc + calculateCartItemTotal(item);
// 			}, 0);

// 			// Обновляем корзину
// 			const updatedCart = await tx.cart.update({
// 				where: { id: cart.id },
// 				data: {
// 					totalAmount: totalAmount,
// 					updatedAt: new Date(),
// 				},
// 				include: {
// 					items: {
// 						orderBy: { createdAt: "desc" },
// 						include: {
// 							product: true,
// 							ingredients: true,
// 						},
// 					},
// 				},
// 			});

// 			return updatedCart;
// 		});

// 		// Формируем ответ, аналогичный GET (маппинг)
// 		// ... (здесь повторить логику маппинга из GET для result, если нужно вернуть полный объект)
// 		// Для краткости вернем result, но фронтенду может понадобиться формат из GET

// 		const resp = NextResponse.json(result);
// 		resp.cookies.set("cartToken", token, {
// 			httpOnly: true,
// 			secure: process.env.NODE_ENV === "production",
// 			sameSite: "lax",
// 			maxAge: 60 * 60 * 24 * 30,
// 		});

// 		return resp;
// 	} catch (error) {
// 		console.error("[CART_POST] Server error", error);
// 		return NextResponse.json({ message: "Impossibile aggiungere al carrello" }, { status: 500 });
// 	}
// }

// new cart route
export async function POST(req: NextRequest) {
	try {
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
						ingredients: {
							connect: sortedIngredients.map((id) => ({ id })),
						},
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
			maxAge: 60 * 60 * 24 * 30,
		});

		return resp;
	} catch (error) {
		console.error("[CART_POST] Server error", error);
		return NextResponse.json({ message: "Не удалось добавить товар в корзину" }, { status: 500 });
	}
}
