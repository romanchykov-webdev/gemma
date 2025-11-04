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
			include: { items: true },
		});

		if (!existingProduct) {
			return NextResponse.json({ message: "Prodotto non trovato" }, { status: 404 });
		}

		// Обновление продукта в транзакции
		const updatedProduct = await prisma.$transaction(async (tx) => {
			// Обновление основных полей продукта
			await tx.product.update({
				where: { id },
				data: {
					...(data.name !== undefined && { name: data.name.trim() }),
					...(data.imageUrl !== undefined && { imageUrl: data.imageUrl.trim() }),
					...(data.categoryId !== undefined && { categoryId: Number(data.categoryId) }),
					// Обновление связей с ингредиентами
					...(data.ingredientIds
						? {
								ingredients: {
									set: data.ingredientIds.map((id: number) => ({ id })),
								},
							}
						: {}),
				},
			});

			// Обновление вариантов (items)
			if (data.items !== undefined && Array.isArray(data.items)) {
				// Получаем существующие ID вариантов
				const existingItemIds = existingProduct.items.map((item) => item.id);
				const updatedItemIds = data.items
					.filter((item: { id?: number }) => item.id)
					.map((item: { id?: number }) => Number(item.id));

				// Удаляем варианты, которых нет в обновленном списке
				const itemsToDelete = existingItemIds.filter((id) => !updatedItemIds.includes(id));
				if (itemsToDelete.length > 0) {
					await tx.productItem.deleteMany({
						where: {
							id: { in: itemsToDelete },
							productId: id,
						},
					});
				}

				// Обновляем существующие и создаем новые варианты
				for (const item of data.items) {
					if (item.id) {
						// Обновление существующего варианта
						await tx.productItem.update({
							where: { id: Number(item.id) },
							data: {
								price: Number(item.price),
								sizeId: item.sizeId ? Number(item.sizeId) : null,
								doughTypeId: item.doughTypeId ? Number(item.doughTypeId) : null,
							},
						});
					} else {
						// Создание нового варианта
						await tx.productItem.create({
							data: {
								productId: id,
								price: Number(item.price),
								sizeId: item.sizeId ? Number(item.sizeId) : null,
								doughTypeId: item.doughTypeId ? Number(item.doughTypeId) : null,
							},
						});
					}
				}
			}

			// Возвращаем обновленный продукт
			return await tx.product.findUnique({
				where: { id },
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
					items: {
						select: {
							id: true,
							price: true,
							sizeId: true,
							doughTypeId: true,
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
			});
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
				items: {
					select: {
						id: true,
					},
				},
			},
		});

		if (!existingProduct) {
			return NextResponse.json({ message: "Prodotto non trovato" }, { status: 404 });
		}

		// Проверка на наличие ProductItems
		if (existingProduct.items.length > 0) {
			return NextResponse.json(
				{
					message: `Impossibile eliminare. Il prodotto ha ${existingProduct.items.length} varianti`,
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
