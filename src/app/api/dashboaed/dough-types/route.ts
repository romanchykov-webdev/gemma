import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../prisma/prisma-client";

export const revalidate = 3600;

// GET - Получить все типы теста
export async function GET() {
	try {
		const types = await prisma.doughType.findMany({
			orderBy: { sortOrder: "asc" },
			include: {
				_count: {
					select: { productItems: true },
				},
			},
		});
		return NextResponse.json(types);
	} catch (error) {
		console.error("[DOUGH_TYPES_GET] Error:", error);
		return NextResponse.json({ message: "Errore nel caricamento" }, { status: 500 });
	}
}

// POST - Создать тип теста
export async function POST(req: NextRequest) {
	try {
		const data = await req.json();

		if (!data.name || !data.value) {
			return NextResponse.json({ message: "Nome e valore sono obbligatori" }, { status: 400 });
		}

		const existing = await prisma.doughType.findFirst({
			where: {
				OR: [{ name: data.name.trim() }, { value: Number(data.value) }],
			},
		});

		if (existing) {
			return NextResponse.json(
				{ message: "Tipo di impasto con questo nome o valore esiste già" },
				{ status: 409 },
			);
		}

		const newType = await prisma.doughType.create({
			data: {
				name: data.name.trim(),
				value: Number(data.value),
				sortOrder: data.sortOrder || 0,
			},
		});

		return NextResponse.json(newType, { status: 201 });
	} catch (error) {
		console.error("[DOUGH_TYPES_POST] Error:", error);
		return NextResponse.json({ message: "Impossibile creare" }, { status: 500 });
	}
}
