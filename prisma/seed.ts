import { hashSync } from "bcrypt";
import { _ingredients, categories, products } from "./constants"; // Убедитесь, что этот файл существует и экспортирует данные
import { prisma } from "./prisma-client";

// Вспомогательная функция для генерации случайной цены
const randomDecimalPrice = (min: number, max: number): number => {
	return Math.round((Math.random() * (max - min) + min) * 100) / 100;
};

// Функция очистки таблиц (Down)
async function down() {
	// Используем имена таблиц из новой схемы
	await prisma.$executeRaw`TRUNCATE TABLE "User" RESTART IDENTITY CASCADE`;
	await prisma.$executeRaw`TRUNCATE TABLE "Category" RESTART IDENTITY CASCADE`;
	await prisma.$executeRaw`TRUNCATE TABLE "Cart" RESTART IDENTITY CASCADE`;
	await prisma.$executeRaw`TRUNCATE TABLE "CartItem" RESTART IDENTITY CASCADE`;
	await prisma.$executeRaw`TRUNCATE TABLE "Ingredient" RESTART IDENTITY CASCADE`;
	await prisma.$executeRaw`TRUNCATE TABLE "Product" RESTART IDENTITY CASCADE`;
	await prisma.$executeRaw`TRUNCATE TABLE "Story" RESTART IDENTITY CASCADE`;
	await prisma.$executeRaw`TRUNCATE TABLE "StoryItem" RESTART IDENTITY CASCADE`;
	await prisma.$executeRaw`TRUNCATE TABLE "Order" RESTART IDENTITY CASCADE`;
	await prisma.$executeRaw`TRUNCATE TABLE "VerificationCode" RESTART IDENTITY CASCADE`;

	// Новые таблицы словарей
	await prisma.$executeRaw`TRUNCATE TABLE "Size" RESTART IDENTITY CASCADE`;
	await prisma.$executeRaw`TRUNCATE TABLE "Type" RESTART IDENTITY CASCADE`;
}

async function up() {
	// 1. Создаем пользователей
	const user1 = await prisma.user.create({
		data: {
			fullName: "User Test",
			email: "user@test.com",
			password: hashSync("111111", 10),
			verified: new Date(),
			role: "USER",
		},
	});

	const user2 = await prisma.user.create({
		data: {
			fullName: "Admin Admin",
			email: "admin@test.com",
			password: hashSync("111111", 10),
			verified: new Date(),
			role: "ADMIN",
		},
	});

	// Остальные роли...
	await prisma.user.createMany({
		data: [
			{
				fullName: "Content Maker",
				email: "content@test.com",
				password: hashSync("111111", 10),
				verified: new Date(),
				role: "CONTENT_MAKER",
			},
			{
				fullName: "Owner Owner",
				email: "owner@test.com",
				password: hashSync("111111", 10),
				verified: new Date(),
				role: "OWNER",
			},
		],
	});

	// 2. Создаем Категории
	await prisma.category.createMany({
		data: categories,
	});

	// 3. Создаем Размеры (Size) - бывший ProductSize
	await prisma.size.createMany({
		data: [
			{ name: "Piccola", value: 25, sortOrder: 1 }, // Изменил value на см, как в схеме (или оставьте как было)
			{ name: "Media", value: 30, sortOrder: 2 },
			{ name: "Grande", value: 35, sortOrder: 3 },
		],
	});

	// 4. Создаем Типы теста (Type) - бывший DoughType
	await prisma.type.createMany({
		data: [
			{ name: "Tradizionale", value: 1, sortOrder: 1 },
			{ name: "Sottile", value: 2, sortOrder: 2 },
		],
	});

	// 5. Создаем Ингредиенты
	await prisma.ingredient.createMany({
		data: _ingredients,
	});

	// Получаем созданные справочники, чтобы знать их ID
	const allSizes = await prisma.size.findMany();
	const allTypes = await prisma.type.findMany();
	const allIngredients = await prisma.ingredient.findMany();

	// 6. Создаем Продукты с JSON полями
	// Определим список пицц для создания (на основе вашего старого кода)
	const pizzasToCreate = [
		{
			name: "Pepperoni fresh",
			img: "https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/pizza/Pepperoni_freshJPG.webp",
			ingredients: allIngredients.slice(0, 5),
		},
		{
			name: "4 Formaggio",
			img: "https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/pizza/4_Formaggio.webp",
			ingredients: allIngredients.slice(5, 10),
		},
		{
			name: "Chorizo ​​fresh",
			img: "https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/pizza/Chorizo%20__fresh.webp",
			ingredients: allIngredients.slice(10, 40), // Осторожно с индексами, если массив меньше
		},
		// ... добавьте остальные пиццы по аналогии
	];

	for (const pizzaData of pizzasToCreate) {
		// Формируем baseIngredients (JSON)
		const baseIngredients = pizzaData.ingredients.map((ing) => ({
			id: ing.id,
			removable: true, // По умолчанию можно убрать
		}));

		// Формируем addableIngredientIds (все ингредиенты, которых нет в базовых)
		const currentIngIds = new Set(pizzaData.ingredients.map((i) => i.id));
		const addableIngredientIds = allIngredients.filter((i) => !currentIngIds.has(i.id)).map((i) => i.id);

		// Формируем variants (JSON)
		// Генерируем комбинации всех размеров и типов теста
		const variants: any[] = [];
		let variantIdCounter = 1;

		for (const size of allSizes) {
			for (const type of allTypes) {
				variants.push({
					variantId: variantIdCounter++, // Локальный ID варианта внутри продукта
					sizeId: size.id,
					typeId: type.id,
					price: randomDecimalPrice(10, 25), // Генерируем цену
				});
			}
		}

		await prisma.product.create({
			data: {
				name: pizzaData.name,
				imageUrl: pizzaData.img,
				categoryId: 1, // Пиццы
				baseIngredients: baseIngredients,
				addableIngredientIds: addableIngredientIds,
				variants: variants,
			},
		});
	}

	// Создаем остальные продукты из константы products (напитки и т.д.)
	// Предполагаем, что у них нет вариантов теста/размера, или они фиксированные
	for (const p of products) {
		// Пропускаем создание, если имя уже есть (чтобы не дублировать пиццы, если они есть в константе)
		const exists = pizzasToCreate.find((pc) => pc.name === p.name);
		if (!exists) {
			await prisma.product.create({
				data: {
					name: p.name,
					imageUrl: p.imageUrl,
					categoryId: p.categoryId,
					baseIngredients: [], // Нет ингредиентов
					addableIngredientIds: [],
					variants: [
						{
							variantId: 1,
							sizeId: null, // Или ID размера "Null" если создали такой
							typeId: null,
							price: randomDecimalPrice(2, 10),
						},
					],
				},
			});
		}
	}

	// 7. Создаем Корзину и Элементы корзины
	const createdProduct = await prisma.product.findFirst({ where: { name: "Pepperoni fresh" } });

	if (createdProduct) {
		const cart1 = await prisma.cart.create({
			data: {
				userId: user1.id,
				totalAmount: 0, // Надо пересчитать по факту, но для сида можно 0 или фикс
				tokenId: "11111",
			},
		});

		// Добавляем CartItem
		// Нам нужно знать структуру вариантов внутри createdProduct
		const variants = createdProduct.variants as any[];
		const firstVariant = variants[0]; // Берем первый вариант (например, Маленькая + Традиционная)

		await prisma.cartItem.create({
			data: {
				cartId: cart1.id,
				productId: createdProduct.id,
				quantity: 2,
				variantId: firstVariant.variantId, // Ссылка на ID внутри JSON
				// Пример добавления и удаления ингредиентов
				addedIngredientIds: [],
				removedBaseIngredientIds: [],
				// Связь с таблицей Ingredient для отображения (если нужно по логике приложения)
				ingredients: {
					connect: [], // В новой схеме это может быть не обязательно, если логика на клиенте,
					// но если relation("CartItemToIngredient") осталась, лучше соединить
				},
			},
		});

		// Обновляем сумму корзины (упрощенно)
		await prisma.cart.update({
			where: { id: cart1.id },
			data: { totalAmount: firstVariant.price * 2 },
		});
	}

	// 8. Stories (без изменений, кроме удаления лишних данных из старого сида)
	await prisma.story.createMany({
		data: [
			{
				previewImageUrl:
					"https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/story/storyImg/logo-350x440.webp",
			},
			{
				previewImageUrl:
					"https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/story/storyImg/logo2.webp",
			},
			// ... остальные сторис
		],
	});

	// Создаем элементы сторис (нужно знать ID созданных сторис)
	const stories = await prisma.story.findMany();
	// Пример привязки к первой стори
	if (stories.length > 0) {
		await prisma.storyItem.createMany({
			data: [
				{
					storyId: stories[0].id,
					sourceUrl:
						"https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/story/storyItem/1.webp",
				},
				{
					storyId: stories[0].id,
					sourceUrl:
						"https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/story/storyItem/2.webp",
				},
			],
		});
	}

	// 9. Сброс последовательностей (Sequences) для PostgreSQL
	// Это важно, чтобы новые записи не конфликтовали с ID
	await prisma.$executeRawUnsafe(`SELECT setval('"Ingredient_id_seq"', (SELECT COALESCE(MAX(id), 1) FROM "Ingredient"))`);
	await prisma.$executeRawUnsafe(`SELECT setval('"Category_id_seq"', (SELECT COALESCE(MAX(id), 1) FROM "Category"))`);
	await prisma.$executeRawUnsafe(`SELECT setval('"Product_id_seq"', (SELECT COALESCE(MAX(id), 1) FROM "Product"))`);
	await prisma.$executeRawUnsafe(`SELECT setval('"Size_id_seq"', (SELECT COALESCE(MAX(id), 1) FROM "Size"))`);
	await prisma.$executeRawUnsafe(`SELECT setval('"Type_id_seq"', (SELECT COALESCE(MAX(id), 1) FROM "Type"))`);
	await prisma.$executeRawUnsafe(`SELECT setval('"Story_id_seq"', (SELECT COALESCE(MAX(id), 1) FROM "Story"))`);
	await prisma.$executeRawUnsafe(`SELECT setval('"StoryItem_id_seq"', (SELECT COALESCE(MAX(id), 1) FROM "StoryItem"))`);
}

async function main() {
	try {
		await down();
		await up();
		console.log("✅ Database seeded successfully");
	} catch (e) {
		console.error(e);
		process.exit(1);
	} finally {
		await prisma.$disconnect();
	}
}

main();
