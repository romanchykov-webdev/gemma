"use server";

import { CheckoutFormValues } from "@/components/shared/checkout/checkout-form-schema";
import { OrderStatus, Prisma } from "@prisma/client";
import { cookies } from "next/headers";

import { stripe } from "@/lib/stripe";
import { sendTelegramMessage } from "@/lib/telegram";
import type { Stripe } from "stripe";
import { prisma } from "../../prisma/prisma-client";

import { calcCatItemTotalPrice } from "@/lib/calc-cart-item-total-price";
import { getUserSession } from "@/lib/get-user-session";
import { hashSync } from "bcrypt";
import { CartItemDTO } from "../../services/dto/cart.dto";

const APP_URL =
	process.env.NEXT_PUBLIC_API_BASE_URL ??
	(process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

const VAT_PERCENT = 5; // НДС, %
const DELIVERY_EUR = 12; // Доставка,

// функция создания заказа
export async function createOrder(data: CheckoutFormValues) {
	try {
		const cookisStore = await cookies();

		const cartToken = cookisStore.get("cartToken")?.value;

		if (!cartToken) {
			throw new Error("Cart token not found");
		}

		// Подтягиваем корзину
		const cart = await prisma.cart.findFirst({
			where: { tokenId: cartToken },
			include: {
				items: {
					include: {
						productItem: {
							include: {
								product: true,
								size: true,
								doughType: true,
							},
						},
						ingredients: true,
					},
				},
			},
		});

		if (!cart) throw new Error("Cart not found");

		if (!cart.items.length || cart.totalAmount.lte(0)) {
			throw new Error("Cart is empty");
		}

		const itemsCents = Number(cart.totalAmount) * 100;
		const taxCents = Number((itemsCents * VAT_PERCENT) / 100);
		const deliveryCents = Number(DELIVERY_EUR * 100);
		const grandCents = Number(itemsCents + taxCents + deliveryCents);

		// Создаём Order в статусе PENDING
		const order = await prisma.order.create({
			data: {
				tokenId: cartToken,
				totalAmount: Math.round(grandCents / 100),
				status: OrderStatus.PENDING,
				// items: JSON.stringify(cart.items),
				items: cart.items,
				fullName: `${data.firstname ?? ""} ${data.lastname ?? ""}`.trim(),
				email: data.email ?? "",
				phone: data.phone,
				address: data.address,
				comment: data.comment ?? "",
			},
		});

		const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [
			{
				quantity: 1,
				price_data: {
					currency: "eur", // валюта
					// unit_amount: cart.totalAmount * 100, // сумма в центах!
					unit_amount: grandCents,
					product_data: {
						name: `Заказ #${order.id}`,
						description: "Оплата заказа в Next Pizza",
					},
				},
			},
		];
		// Вариант Б (если хочешь разложить позициями):
		// const line_items = [
		//   { quantity: 1, price_data: { currency: "eur", unit_amount: itemsCents,    product_data: { name: "Товары" } } },
		//   { quantity: 1, price_data: { currency: "eur", unit_amount: taxCents,      product_data: { name: `Налог ${VAT_PERCENT}%` } } },
		//   { quantity: 1, price_data: { currency: "eur", unit_amount: deliveryCents, product_data: { name: "Доставка" } } },
		// ];

		const session = await stripe.checkout.sessions.create({
			mode: "payment",
			line_items,
			success_url: `${APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${APP_URL}/failed`,
			metadata: {
				orderId: String(order.id),
				cartToken,
			},
		});

		return session.url ?? null;
	} catch (error) {
		console.log("[CREATE_ORDER] Server error", error);
		return null;
	}
}

//  заказ без онлайн-оплаты (оплата курьеру) Telegram-уведомление
export async function createCashOrder(data: CheckoutFormValues) {
	try {
		const cookieStore = await cookies();
		const cartToken = cookieStore.get("cartToken")?.value;

		if (!cartToken) throw new Error("Cart token not found");

		const cart = await prisma.cart.findFirst({
			where: { tokenId: cartToken },
			include: {
				items: {
					include: {
						productItem: {
							include: {
								product: true,
								size: true,
								doughType: true,
							},
						},
						ingredients: true,
					},
				},
			},
		});

		if (!cart) throw new Error("Cart not found");

		if (!cart.items.length || cart.totalAmount.lte(0)) {
			throw new Error("Cart is empty");
		}

		const itemsCents = Number(cart.totalAmount) * 100;
		const taxCents = Number((itemsCents * VAT_PERCENT) / 100);
		const deliveryCents = Number(DELIVERY_EUR * 100);
		const grandCents = itemsCents + taxCents + deliveryCents;

		const order = await prisma.order.create({
			data: {
				tokenId: cartToken,
				totalAmount: Number(grandCents / 100),
				status: OrderStatus.PENDING, // ждёт подтверждения оператором
				//
				items: cart.items,
				fullName: `${data.firstname ?? ""} ${data.lastname ?? ""}`.trim(),
				email: data.email ?? "",
				phone: data.phone,
				address: data.address,
				comment: data.comment ?? "",
				paymentId: "courier",
			},
		});

		// Детализация позиций
		const lines: string[] = [];
		for (const it of cart.items) {
			const qty = it.quantity ?? 1;
			const name = it.productItem?.product?.name ?? "Prodotto";
			const size = it.productItem?.size?.value ? ` (${it.productItem.size.value} cm)` : "";

			// тип теста: берём из item.type, если нет — из productItem.doughTypeId
			const doughType = it.productItem?.doughType;
			// const doughName = doughType ? mapPizzaTypes[doughType as keyof typeof mapPizzaTypes] : undefined;
			const doughLine = doughType ? `, impasto: ${doughType.name}` : "";

			const ing = (it.ingredients ?? []).map((x) => x.name).filter(Boolean);
			const ingLine = ing.length ? `\n  + Ingredienti: ${ing.join(", ")}` : "";

			// сумма позиции (база + ингредиенты) * количество
			const itemSum = calcCatItemTotalPrice(it as CartItemDTO);

			lines.push(`${qty} x ${name}${size}${doughLine}${ingLine} - ${itemSum} €`);
		}

		const msg: string[] = [
			"🛵 Nuovo ordine (pagamento al corriere)",
			`№${order.id}`,
			`Importo: €${(grandCents / 100).toFixed(2)}`,
			"",
			"Composizione:",
			...lines.map((l) => `• ${l}`),
			"",
			`Cliente: ${order.fullName}`,
			`Telefono: ${order.phone}`,
			`Email: ${order.email}`,
			`Indirizzo: ${order.address}`,
			`Commento: ${order.comment || "-"}`,
		];

		await sendTelegramMessage(msg.join("\n"));

		// Очищаем корзину сразу после оформления
		await clearCart(cartToken);

		return { success: true, orderId: order.id };
	} catch (error) {
		console.error("[CREATE_CASH_ORDER] Server error", error);
		return { success: false };
	}
}

//  функция очистки корзины временная
export async function clearCart(cartToken?: string) {
	try {
		// Если cartToken не передан, пробуем получить из куки
		if (!cartToken) {
			const cookieStore = await cookies();
			cartToken = cookieStore.get("cartToken")?.value;
		}

		if (!cartToken) {
			console.log("[CLEAR_CART] Cart token not found");
			return { success: false, error: "Cart token not found" };
		}

		// Поиск корзины
		const cart = await prisma.cart.findFirst({
			where: { tokenId: cartToken },
			select: { id: true },
		});

		if (!cart) {
			console.log("[CLEAR_CART] Cart not found for token:", cartToken);
			return { success: false, error: "Cart not found" };
		}

		// Удаление элементов корзины
		const deleteResult = await prisma.cartItem.deleteMany({
			where: { cartId: cart.id },
		});
		console.log("[CLEAR_CART] Deleted items count:", deleteResult.count);

		// Обновление суммы корзины
		await prisma.cart.update({
			where: { id: cart.id },
			data: { totalAmount: 0 },
		});
		console.log("[CLEAR_CART] Cart total amount reset for cart:", cart.id);

		return { success: true };
	} catch (error) {
		console.error("[CLEAR_CART] Error:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

// функция обновления информации о пользователе
export async function updateUserInfo(body: Prisma.UserUpdateInput) {
	try {
		const currentUser = await getUserSession();

		// проверяем авторизован ли пользователь
		if (!currentUser) {
			throw new Error("Пользователь не найден");
		}

		// ищем пользователя в базе данных
		const findUser = await prisma.user.findFirst({
			where: {
				id: currentUser.id,
			},
		});

		// обновляем информацию о пользователе
		await prisma.user.update({
			where: {
				id: currentUser.id,
			},
			data: {
				fullName: body.fullName,
				email: body.email,
				phone: (body.phone as string | null) ?? null,
				address: (body.address as string | null) ?? null,
				password: body.password ? hashSync(body.password as string, 10) : findUser?.password,
			},
		});
	} catch (err) {
		console.log("Error [UPDATE_USER]", err);
		throw err;
	}
}

// функция регистрации пользователя
export async function registerUser(body: Prisma.UserCreateInput) {
	try {
		const user = await prisma.user.findFirst({
			where: {
				email: body.email,
			},
		});

		if (user) {
			throw new Error("L'utente esiste già");
		}

		// Создаём пользователя
		const createdUser = await prisma.user.create({
			data: {
				fullName: body.fullName,
				email: body.email,
				password: hashSync(body.password, 10),
				role: "USER",
			},
		});

		return { success: true, userId: createdUser.id };
	} catch (error) {
		console.log("Error [CREATE_USER]", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}
