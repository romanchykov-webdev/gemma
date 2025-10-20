import { findOrCreateCart } from "@/lib/find-or-create-cart";
import { updateCartTotalAmount } from "@/lib/update-cart-total-amount";
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

		const userCart = await prisma.cart.findFirst({
			where: {
				OR: [{ tokenId: token }],
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

		return NextResponse.json(userCart);
	} catch (error) {
		console.error("[CART_GET] Server error", error);
		return NextResponse.json({ message: "Impossibile recuperare il carrello" }, { status: 500 });
	}
}

export async function POST(req: NextRequest) {
	//
	try {
		//
		let token = req.cookies.get("cartToken")?.value;

		if (!token) {
			token = crypto.randomUUID();
		}

		const userCart = await findOrCreateCart(token);

		const data = (await req.json()) as CreateCartItemValues;

		// Ищем товары с таким же productItemId
		const cartItems = await prisma.cartItem.findMany({
			where: {
				cartId: userCart.id,
				productItemId: data.productItemId,
			},
			include: {
				ingredients: true,
			},
		});

		// Ищем точное совпадение по ингредиентам
		const findCartItem = cartItems.find((item) => {
			// Если количество ингредиентов не совпадает, это разные товары
			if (item.ingredients.length !== (data.ingredients?.length || 0)) {
				return false;
			}

			// Проверяем, что все ингредиенты совпадают
			const ingredientIds = item.ingredients.map((ing) => ing.id);
			return data.ingredients?.every((id) => ingredientIds.includes(id)) || false;
		});

		// Если точно такой же товар найден - увеличиваем количество
		if (findCartItem) {
			await prisma.cartItem.update({
				where: {
					id: findCartItem.id,
				},
				data: {
					quantity: findCartItem.quantity + 1,
				},
			});
		} else {
			// Иначе создаем новый товар
			await prisma.cartItem.create({
				data: {
					cartId: userCart.id,
					productItemId: data.productItemId,
					quantity: 1,
					ingredients: { connect: data.ingredients?.map((id) => ({ id })) || [] },
				},
			});
		}

		const updateUserCart = await updateCartTotalAmount(token);

		const resp = NextResponse.json(updateUserCart);

		resp.cookies.set("cartToken", token);

		return resp;
		//
	} catch (error) {
		console.log("[CART_POST] Server error", error);
		return NextResponse.json({ message: "Impossibile aggiungere al carrello" }, { status: 500 });
	}
}
