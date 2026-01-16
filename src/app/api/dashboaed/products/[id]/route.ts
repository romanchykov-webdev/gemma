import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../../prisma/prisma-client";

// ✏️ PATCH - Обновление продукта
export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
	try {
		const params = await context.params;
		const id = Number(params.id);
		const data = await req.json();

		// Валидация ID
		if (!id || isNaN(id)) {
			return NextResponse.json({ message: "ID prodotto non valido" }, { status: 400 });
		}

		// Проверка существования продукта
		const existingProduct = await prisma.product.findUnique({
			where: { id },
			select: {
				id: true,
				variants: true,
				baseIngredients: true,
				addableIngredientIds: true,
			},
		});

		if (!existingProduct) {
			return NextResponse.json({ message: "Prodotto non trovato" }, { status: 404 });
		}

		// Обновление продукта в транзакции
		const updatedProduct = await prisma.product.update({
			where: { id },
			data: {
				...(data.name !== undefined && { name: data.name.trim() }),
				...(data.imageUrl !== undefined && { imageUrl: data.imageUrl.trim() }),
				...(data.categoryId !== undefined && { categoryId: Number(data.categoryId) }),
				...(data.variants !== undefined && { variants: data.variants }),
				...(data.baseIngredients !== undefined && { baseIngredients: data.baseIngredients }),
				...(data.addableIngredientIds !== undefined && { addableIngredientIds: data.addableIngredientIds }),
			},
			select: {
				id: true,
				name: true,
				imageUrl: true,
				categoryId: true,
				category: {
					select: {
						id: true,
						name: true,
					},
				},
				variants: true,
				baseIngredients: true,
				addableIngredientIds: true,
				createdAt: true,
				updatedAt: true,
			},
		});

		return NextResponse.json(updatedProduct);
	} catch (error) {
		console.error("[PRODUCTS_PATCH] Server error:", error);
		return NextResponse.json({ message: "Impossibile aggiornare il prodotto" }, { status: 500 });
	}
}

// 🗑️ DELETE - Удаление продукта
export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
	try {
		const params = await context.params;
		const id = Number(params.id);

		// Валидация ID
		if (!id || isNaN(id)) {
			return NextResponse.json({ message: "ID prodotto non valido" }, { status: 400 });
		}

		// Проверка существования продукта
		const existingProduct = await prisma.product.findUnique({
			where: { id },
			select: {
				id: true,
				cartItems: {
					select: {
						id: true,
					},
				},
			},
		});

		if (!existingProduct) {
			return NextResponse.json({ message: "Prodotto non trovato" }, { status: 404 });
		}

		// Проверка на использование в корзинах
		if (existingProduct.cartItems.length > 0) {
			return NextResponse.json(
				{
					message: `Impossibile eliminare. Il prodotto è usato in ${existingProduct.cartItems.length} carrelli`,
				},
				{ status: 409 },
			);
		}

		// Удаление продукта (каскадное удаление связей настроено в Prisma)
		await prisma.product.delete({
			where: { id },
		});

		return NextResponse.json({ message: "Prodotto eliminato con successo" }, { status: 200 });
	} catch (error) {
		console.error("[PRODUCTS_DELETE] Server error:", error);
		return NextResponse.json({ message: "Impossibile eliminare il prodotto" }, { status: 500 });
	}
}
