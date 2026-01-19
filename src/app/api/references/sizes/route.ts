import { NextResponse } from "next/server";
import { prisma } from "../../../../../prisma/prisma-client";

// ⚡ Кешируем навсегда (эти данные почти никогда не меняются)
export const revalidate = 3600;

export async function GET() {
	try {
		const sizes = await prisma.size.findMany({
			orderBy: { sortOrder: "asc" },
			select: {
				id: true,
				name: true,
				value: true,
				sortOrder: true,
			},
		});

		return NextResponse.json(sizes);
	} catch (error) {
		console.error("[SIZES_GET] Error:", error);
		return NextResponse.json({ message: "Failed to fetch sizes" }, { status: 500 });
	}
}
