import { NextResponse } from "next/server";
import { prisma } from "../../../../prisma/prisma-client";

// ✅ Кеширование на 1 час (3600 секунд)
export const revalidate = 3600;

// ✅ In-memory кеш для быстрого доступа
let cachedIngredients: any[] | null = null;
let cacheTime = 0;
const CACHE_TTL = 3600 * 1000; // 1 час в миллисекундах

export async function GET() {
	const now = Date.now();

	// ✅ Если кеш свежий - возвращаем сразу (экономия ~2 секунды)
	if (cachedIngredients && now - cacheTime < CACHE_TTL) {
		console.log("✅ Returning cached ingredients from memory");
		return NextResponse.json(cachedIngredients);
	}

	// ✅ Иначе - загружаем из БД
	console.log("🔄 Fetching ingredients from database...");
	const ingredients = await prisma.ingredient.findMany({
		select: {
			id: true,
			name: true,
			price: true,
			imageUrl: true,
		},
		orderBy: {
			id: "asc",
		},
	});

	// ✅ Сохраняем в кеш
	cachedIngredients = ingredients;
	cacheTime = now;

	return NextResponse.json(ingredients);
}
