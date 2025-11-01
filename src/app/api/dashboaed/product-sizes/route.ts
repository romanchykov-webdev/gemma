import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../prisma/prisma-client";

export const revalidate = 3600;

// GET - Получить все размеры продуктов
export async function GET() {
	try {
		const sizes = await prisma.productSize.findMany({
			orderBy: { sortOrder: "asc" },
			include: {
				_count: {
					select: { productItems: true },
				},
			},
		});
		return NextResponse.json(sizes);
	} catch (error) {
		console.error("[PRODUCT_SIZES_GET] Error:", error);
		return NextResponse.json({ message: "Errore nel caricamento" }, { status: 500 });
	}
}

// POST - Создать размер продукта
export async function POST(req: NextRequest) {
	try {
		const data = await req.json();

		if (!data.name || !data.value) {
			return NextResponse.json({ message: "Nome e valore sono obbligatori" }, { status: 400 });
		}

		// Проверка дубликатов
		const existing = await prisma.productSize.findFirst({
			where: {
				OR: [{ name: data.name.trim() }, { value: Number(data.value) }],
			},
		});

		if (existing) {
			return NextResponse.json({ message: "Dimensione con questo nome o valore esiste già" }, { status: 409 });
		}

		const newSize = await prisma.productSize.create({
			data: {
				name: data.name.trim(),
				value: Number(data.value),
				sortOrder: data.sortOrder || 0,
			},
		});

		return NextResponse.json(newSize, { status: 201 });
	} catch (error) {
		console.error("[PRODUCT_SIZES_POST] Error:", error);
		return NextResponse.json({ message: "Impossibile creare" }, { status: 500 });
	}
}
