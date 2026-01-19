import { NextResponse } from "next/server";
import { prisma } from "../../../../../prisma/prisma-client";

// ⚡ Кешируем на 1 час
export const revalidate = 3600;

export async function GET() {
	try {
		const types = await prisma.type.findMany({
			orderBy: { sortOrder: "asc" },
			select: {
				id: true,
				name: true,
				value: true,
				sortOrder: true,
			},
		});

		return NextResponse.json(types);
	} catch (error) {
		console.error("[TYPES_GET] Error:", error);
		return NextResponse.json({ message: "Failed to fetch types" }, { status: 500 });
	}
}
