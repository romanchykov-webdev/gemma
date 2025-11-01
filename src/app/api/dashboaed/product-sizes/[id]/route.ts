import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../../prisma/prisma-client";

// PATCH - Обновить размер
export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
	try {
		const params = await context.params;
		const id = Number(params.id);
		const data = await req.json();

		if (!id || isNaN(id)) {
			return NextResponse.json({ message: "ID non valido" }, { status: 400 });
		}

		const updated = await prisma.productSize.update({
			where: { id },
			data: {
				...(data.name !== undefined && { name: data.name.trim() }),
				...(data.value !== undefined && { value: Number(data.value) }),
				...(data.sortOrder !== undefined && { sortOrder: Number(data.sortOrder) }),
			},
		});

		return NextResponse.json(updated);
	} catch (error) {
		console.error("[PRODUCT_SIZES_PATCH] Error:", error);
		return NextResponse.json({ message: "Impossibile aggiornare" }, { status: 500 });
	}
}

// DELETE - Удалить размер
export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
	try {
		const params = await context.params;
		const id = Number(params.id);

		if (!id || isNaN(id)) {
			return NextResponse.json({ message: "ID non valido" }, { status: 400 });
		}

		// Проверка использования в продуктах
		const count = await prisma.productItem.count({
			where: { sizeId: id },
		});

		if (count > 0) {
			return NextResponse.json(
				{ message: `Impossibile eliminare. Usato in ${count} varianti di prodotti` },
				{ status: 409 },
			);
		}

		await prisma.productSize.delete({ where: { id } });
		return NextResponse.json({ message: "Dimensione eliminata con successo" });
	} catch (error) {
		console.error("[PRODUCT_SIZES_DELETE] Error:", error);
		return NextResponse.json({ message: "Impossibile eliminare" }, { status: 500 });
	}
}
