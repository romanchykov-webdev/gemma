import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../../prisma/prisma-client";

// PATCH - Обновление типа теста (value НЕ меняется!)
export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
	try {
		const { params } = context;
		const { id: idStr } = await params;
		const id = Number(idStr);
		const data = await req.json();

		if (!id || isNaN(id)) {
			return NextResponse.json({ message: "ID non valido" }, { status: 400 });
		}

		// Проверка существования
		const existing = await prisma.doughType.findUnique({
			where: { id },
		});

		if (!existing) {
			return NextResponse.json({ message: "Tipo di impasto non trovato" }, { status: 404 });
		}

		// Валидация обновляемых полей
		if (data.name !== undefined && data.name.trim().length === 0) {
			return NextResponse.json({ message: "Il nome non può essere vuoto" }, { status: 400 });
		}

		// Проверка на дубликат по имени (если имя меняется)
		if (data.name && data.name.trim() !== existing.name) {
			const duplicateName = await prisma.doughType.findUnique({
				where: { name: data.name.trim() },
			});

			if (duplicateName) {
				return NextResponse.json({ message: "Un tipo di impasto con questo nome esiste già" }, { status: 409 });
			}
		}

		const updateData: {
			name?: string;
			sortOrder?: number;
		} = {};

		if (data.name) updateData.name = data.name.trim();
		if (data.sortOrder !== undefined) updateData.sortOrder = Number(data.sortOrder);

		const updated = await prisma.doughType.update({
			where: { id },
			data: updateData,
			include: {
				_count: {
					select: {
						productItems: true,
					},
				},
			},
		});

		return NextResponse.json(updated);
	} catch (error) {
		console.error("[DOUGH_TYPE_PATCH] Error:", error);
		return NextResponse.json({ message: "Errore nell'aggiornamento" }, { status: 500 });
	}
}

// DELETE - Удаление типа теста
export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
	try {
		const { params } = context;
		const { id: idStr } = await params;
		const id = Number(idStr);

		if (!id || isNaN(id)) {
			return NextResponse.json({ message: "ID non valido" }, { status: 400 });
		}

		// Проверка существования и подсчет связанных ProductItem
		const existing = await prisma.doughType.findUnique({
			where: { id },
			include: {
				_count: {
					select: {
						productItems: true,
					},
				},
			},
		});

		if (!existing) {
			return NextResponse.json({ message: "Tipo di impasto non trovato" }, { status: 404 });
		}

		// Запрет удаления, если есть связанные продукты
		if (existing._count.productItems > 0) {
			return NextResponse.json(
				{
					message: `Impossibile eliminare. Il tipo di impasto è utilizzato da ${existing._count.productItems} prodotti`,
				},
				{ status: 400 },
			);
		}

		await prisma.doughType.delete({
			where: { id },
		});

		return NextResponse.json({ message: "Tipo di impasto eliminato con successo" });
	} catch (error) {
		console.error("[DOUGH_TYPE_DELETE] Error:", error);
		return NextResponse.json({ message: "Errore nell'eliminazione" }, { status: 500 });
	}
}
