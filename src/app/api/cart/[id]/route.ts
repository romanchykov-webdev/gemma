import { updateCartTotalAmount } from "@/lib/update-cart-total-amount";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../prisma/prisma-client";

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
	try {
		// console.time("PATCH_CART_TOTAL");

		// const id = params.id (теперь это UUID string)
		const params = await context.params;
		const id = params.id;

		const data = (await req.json()) as { quantity: number };

		const token = req.cookies.get("cartToken")?.value;

		if (!token) {
			return NextResponse.json({ message: "Impossibile aggiornare il carrello" }, { status: 401 });
		}

		// console.time("FIND_CART_ITEM");

		const cartItem = await prisma.cartItem.findFirst({
			where: {
				id,
			},
		});

		// console.timeEnd("FIND_CART_ITEM");

		if (!cartItem) {
			return NextResponse.json({ message: "Impossibile aggiornare il carrello" }, { status: 404 });
		}

		// console.time("UPDATE_CART_ITEM");

		await prisma.cartItem.update({
			where: {
				id,
			},
			data: {
				quantity: data.quantity,
			},
		});

		// console.timeEnd("UPDATE_CART_ITEM");

		// console.time("UPDATE_CART_TOTAL");
		const updateUserCart = await updateCartTotalAmount(token);

		// console.timeEnd("UPDATE_CART_TOTAL");

		// console.timeEnd("PATCH_CART_TOTAL");

		return NextResponse.json(updateUserCart);

		//
	} catch (error) {
		console.log("[CART_PATCH] Server error", error);

		return NextResponse.json({ message: "Impossibile aggiornare il carrello" }, { status: 500 });
	}
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
	try {
		// const id = params.id (теперь это UUID string)
		const params = await context.params;
		const id = params.id;

		const token = req.cookies.get("cartToken")?.value;

		if (!token) {
			return NextResponse.json({ message: "Impossibile aggiornare il carrello" }, { status: 401 });
		}

		const cartItem = await prisma.cartItem.findFirst({
			where: {
				id,
			},
		});

		if (!cartItem) {
			return NextResponse.json({ message: "Impossibile eliminare dal carrello" }, { status: 404 });
		}

		await prisma.cartItem.delete({
			where: {
				id,
			},
		});

		const updateUserCart = await updateCartTotalAmount(token);

		return NextResponse.json(updateUserCart);
	} catch (error) {
		console.log("[CART_DELETE] Server error", error);

		return NextResponse.json({ message: "Impossibile eliminare dal carrello" }, { status: 500 });
	}
}
