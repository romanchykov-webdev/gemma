import { stripe } from "@/lib/stripe";
import { sendTelegramMessage } from "@/lib/telegram";
import { OrderStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "../../../../../prisma/prisma-client";

// Обновленные типы
type OrderItemIngredient = { id: number; name: string; price: number; imageUrl: string };
type OrderItem = {
	quantity?: number;
	pizzaSize?: number;
	type?: number;
	productItem?: {
		price?: number;
		product?: { name?: string };
		size?: { value?: number; name?: string };
		doughType?: { value?: number; name?: string };
	};
	ingredients?: OrderItemIngredient[];
};

// Безопасный парсер JSON без any
function parseOrderItems(input: unknown): OrderItem[] {
	if (typeof input === "string") {
		try {
			return JSON.parse(input) as OrderItem[];
		} catch {
			return [];
		}
	}
	if (Array.isArray(input)) {
		return input as unknown as OrderItem[];
	}
	return [];
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
	// console.log("[WEBHOOK] Received webhook request");

	const sig = req.headers.get("stripe-signature");
	if (!sig) {
		console.error("[WEBHOOK] No signature provided");
		return NextResponse.json({ error: "No signature" }, { status: 400 });
	}

	const secret = WEBHOOK_SECRET;
	// console.log("[WEBHOOK] Using webhook secret:", secret.substring(0, 5) + "...");

	const rawBody = await req.text();

	let event: Stripe.Event;
	try {
		event = stripe.webhooks.constructEvent(rawBody, sig, secret);
		// console.log("[WEBHOOK] Event received:", event.type);
	} catch (err) {
		const error = err as Error;
		console.error("[WEBHOOK] Bad signature", error.message);
		return NextResponse.json({ error: `Webhook Error: ${error.message}` }, { status: 400 });
	}

	try {
		switch (event.type) {
			case "checkout.session.completed": {
				const session = event.data.object as Stripe.Checkout.Session;

				const orderId = session.metadata?.orderId;
				const cartToken = session.metadata?.cartToken;

				if (!orderId || !cartToken) {
					return NextResponse.json({ error: "No orderId/cartToken in metadata" }, { status: 400 });
				}

				// 1) Помечаем заказ оплаченным
				await prisma.order.update({
					where: { id: orderId },
					data: {
						status: OrderStatus.SUCCEEDED,
						paymentId: String(session.payment_intent ?? ""),
					},
				});

				// 2) Достаем заказ для формирования сообщения
				const order = await prisma.order.findUnique({
					where: { id: orderId },
				});

				// 3) Очищаем корзину по токену
				const cart = await prisma.cart.findFirst({
					where: { tokenId: cartToken },
					select: { id: true },
				});

				if (cart) {
					await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
					await prisma.cart.update({
						where: { id: cart.id },
						data: { totalAmount: 0 },
					});
				}

				// 4) Telegram-уведомление с составом заказа
				if (order) {
					const items: OrderItem[] = parseOrderItems(order.items);

					const lines: string[] = [];
					for (const it of items) {
						const qty = it.quantity ?? 1;
						const name = it.productItem?.product?.name ?? "Prodotto";

						// ✅ Используем реальное значение size
						const sizeValue = it.productItem?.size?.value;
						const size = sizeValue ? ` (${sizeValue} cm)` : "";

						// ✅ Используем реальное название doughType
						const doughType = it.productItem?.doughType;
						const doughLine = doughType ? `, impasto: ${doughType.name}` : "";

						const ing = (it.ingredients ?? []).map((x: OrderItemIngredient) => x.name).filter(Boolean);
						const ingLine = ing.length ? `\n  + Ingredienti: ${ing.join(", ")}` : "";

						// сумма позиции
						const base = Number(it.productItem?.price ?? 0);
						const ingSum = (it.ingredients ?? []).reduce(
							(a: number, b: OrderItemIngredient) => a + b.price,
							0,
						);
						const itemSum = (base + ingSum) * qty;

						lines.push(`${qty} x ${name}${size}${doughLine}${ingLine} - ${itemSum} €`);
					}

					const msg: string[] = [
						"🧾 Nuovo ordine pagato",
						`№${order.id}`,
						`Importo: €${Number(order.totalAmount).toFixed(2)}`,
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
				}

				break;
			}

			case "checkout.session.async_payment_failed":
			case "payment_intent.payment_failed": {
				try {
					const dataObject = event.data.object as
						| Stripe.PaymentIntent
						| Stripe.Checkout.Session
						| Record<string, unknown>;

					const metadata: Record<string, unknown> | null =
						(dataObject as Stripe.PaymentIntent)?.metadata ??
						(dataObject as Stripe.Checkout.Session)?.metadata ??
						null;

					// console.log("[WEBHOOK] Payment failed event:", {
					// 	type: event.type,
					// 	metadata,
					// });

					const orderId = (metadata as Record<string, unknown> | null)?.orderId as string | undefined;
					if (orderId) {
						await prisma.order.update({
							where: { id: orderId },
							data: { status: OrderStatus.CANCELLED },
						});
						// console.log("[WEBHOOK] Order cancelled:", orderId);
					} else {
						console.error("[WEBHOOK] No orderId in metadata for failed payment");
					}
				} catch (err) {
					console.error("[WEBHOOK] Error in payment_failed handler:", err);
					return NextResponse.json({ error: "Handler error in payment failed" }, { status: 500 });
				}
				break;
			}

			default:
				console.log("[WEBHOOK] Unhandled event type:", event.type);
				break;
		}

		// console.log("[WEBHOOK] Successfully processed event:", event.type);
		return NextResponse.json({ received: true });
	} catch (err) {
		console.error("[WEBHOOK] Handler error", err);
		return NextResponse.json({ error: "Handler error" }, { status: 500 });
	}
}
