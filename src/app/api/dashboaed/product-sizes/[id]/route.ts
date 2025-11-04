// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "../../../../../../prisma/prisma-client";

// // ✏️ PATCH - Обновление размера
// export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
// 	try {
// 		const id = Number(params.id);
// 		const data = await req.json();

// 		if (!id || isNaN(id)) {
// 			return NextResponse.json({ message: "ID non valido" }, { status: 400 });
// 		}

// 		// Проверка существования
// 		const existingSize = await prisma.productSize.findUnique({
// 			where: { id },
// 		});

// 		if (!existingSize) {
// 			return NextResponse.json({ message: "Formato non trovato" }, { status: 404 });
// 		}

// 		// Валидация обновляемых полей
// 		if (data.name !== undefined && data.name.trim().length === 0) {
// 			return NextResponse.json({ message: "Il nome non può essere vuoto" }, { status: 400 });
// 		}

// 		if (data.value !== undefined && isNaN(Number(data.value))) {
// 			return NextResponse.json({ message: "Il valore deve essere un numero" }, { status: 400 });
// 		}

// 		// Проверка на дубликат по имени (если имя меняется)
// 		if (data.name && data.name.trim() !== existingSize.name) {
// 			const duplicateName = await prisma.productSize.findUnique({
// 				where: { name: data.name.trim() },
// 			});

// 			if (duplicateName) {
// 				return NextResponse.json({ message: "Un formato con questo nome esiste già" }, { status: 409 });
// 			}
// 		}

// 		// Проверка на дубликат по значению (если значение меняется)
// 		if (data.value && Number(data.value) !== existingSize.value) {
// 			const duplicateValue = await prisma.productSize.findUnique({
// 				where: { value: Number(data.value) },
// 			});

// 			if (duplicateValue) {
// 				return NextResponse.json({ message: "Un formato con questo valore esiste già" }, { status: 409 });
// 			}
// 		}

// 		// Обновление
// 		const updateData: {
// 			name?: string;
// 			value?: number;
// 			sortOrder?: number;
// 		} = {};

// 		if (data.name) updateData.name = data.name.trim();
// 		if (data.value) updateData.value = Number(data.value);
// 		if (data.sortOrder !== undefined) updateData.sortOrder = Number(data.sortOrder);

// 		const updatedSize = await prisma.productSize.update({
// 			where: { id },
// 			data: updateData,
// 			select: {
// 				id: true,
// 				name: true,
// 				value: true,
// 				sortOrder: true,
// 				_count: {
// 					select: {
// 						productItems: true,
// 					},
// 				},
// 			},
// 		});

// 		return NextResponse.json(updatedSize);
// 	} catch (error) {
// 		console.error("[PRODUCT_SIZE_PATCH] Error:", error);
// 		return NextResponse.json({ message: "Errore nell'aggiornamento del formato" }, { status: 500 });
// 	}
// }

// // 🗑️ DELETE - Удаление размера
// export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
// 	try {
// 		const id = Number(params.id);

// 		if (!id || isNaN(id)) {
// 			return NextResponse.json({ message: "ID non valido" }, { status: 400 });
// 		}

// 		// Проверка существования и подсчет связанных ProductItem
// 		const existingSize = await prisma.productSize.findUnique({
// 			where: { id },
// 			include: {
// 				_count: {
// 					select: {
// 						productItems: true,
// 					},
// 				},
// 			},
// 		});

// 		if (!existingSize) {
// 			return NextResponse.json({ message: "Formato non trovato" }, { status: 404 });
// 		}

// 		// Запрет удаления, если есть связанные продукты
// 		if (existingSize._count.productItems > 0) {
// 			return NextResponse.json(
// 				{
// 					message: `Impossibile eliminare. Il formato è utilizzato da ${existingSize._count.productItems} prodotti`,
// 				},
// 				{ status: 400 },
// 			);
// 		}

// 		await prisma.productSize.delete({
// 			where: { id },
// 		});

// 		return NextResponse.json({ message: "Formato eliminato con successo" });
// 	} catch (error) {
// 		console.error("[PRODUCT_SIZE_DELETE] Error:", error);
// 		return NextResponse.json({ message: "Errore nell'eliminazione del formato" }, { status: 500 });
// 	}
// }
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../../prisma/prisma-client";

// PATCH
export async function PATCH(
	req: NextRequest,
	context: { params: Promise<{ id: string }> }, // <- поменяли тип
) {
	try {
		const { params } = context;
		const { id: idStr } = await params; // <- await
		const id = Number(idStr);
		const data = await req.json();

		if (!id || isNaN(id)) {
			return NextResponse.json({ message: "ID non valido" }, { status: 400 });
		}

		// пример логики обновления (сделайте свою, как было у вас)
		const existing = await prisma.productSize.findUnique({ where: { id } });
		if (!existing) {
			return NextResponse.json({ message: "Formato non trovato" }, { status: 404 });
		}

		const updateData: { name?: string; value?: number; sortOrder?: number } = {};
		if (data.name) updateData.name = data.name.trim();
		if (data.value !== undefined) updateData.value = Number(data.value);
		if (data.sortOrder !== undefined) updateData.sortOrder = Number(data.sortOrder);

		const updated = await prisma.productSize.update({
			where: { id },
			data: updateData,
			include: { _count: { select: { productItems: true } } },
		});

		return NextResponse.json(updated);
	} catch (error) {
		console.error("[PRODUCT_SIZE_PATCH] Error:", error);
		return NextResponse.json({ message: "Errore nell'aggiornamento" }, { status: 500 });
	}
}

// DELETE
export async function DELETE(
	req: NextRequest,
	context: { params: Promise<{ id: string }> }, // <- тоже поменяли
) {
	try {
		const { params } = context;
		const { id: idStr } = await params;
		const id = Number(idStr);

		if (!id || isNaN(id)) {
			return NextResponse.json({ message: "ID non valido" }, { status: 400 });
		}

		const existing = await prisma.productSize.findUnique({
			where: { id },
			include: { _count: { select: { productItems: true } } },
		});

		if (!existing) {
			return NextResponse.json({ message: "Formato non trovato" }, { status: 404 });
		}

		if (existing._count.productItems > 0) {
			return NextResponse.json(
				{ message: `Impossibile eliminare. Il formato è usato da ${existing._count.productItems} prodotti` },
				{ status: 400 },
			);
		}

		await prisma.productSize.delete({ where: { id } });

		return NextResponse.json({ message: "Formato eliminato con successo" });
	} catch (error) {
		console.error("[PRODUCT_SIZE_DELETE] Error:", error);
		return NextResponse.json({ message: "Errore nell'eliminazione" }, { status: 500 });
	}
}
