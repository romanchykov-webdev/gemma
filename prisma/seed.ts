import { hashSync } from "bcrypt";
import { _ingredients, categories } from "./constants";
import { prisma } from "./prisma-client";

// 🧹 Функция очистки таблиц (Down)
async function down() {
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
	await prisma.$executeRaw`TRUNCATE TABLE "Size" RESTART IDENTITY CASCADE`;
	await prisma.$executeRaw`TRUNCATE TABLE "Type" RESTART IDENTITY CASCADE`;
}

async function up() {
	// 1️⃣ Создаем пользователей
	const user1 = await prisma.user.create({
		data: {
			fullName: "User Test",
			email: "user@test.com",
			password: hashSync("111111", 10),
			verified: new Date(),
			role: "USER",
		},
	});

	await prisma.user.createMany({
		data: [
			{
				fullName: "Admin Admin",
				email: "admin@test.com",
				password: hashSync("111111", 10),
				verified: new Date(),
				role: "ADMIN",
			},
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

	// 2️⃣ Создаем Категории
	await prisma.category.createMany({
		data: categories,
	});

	// 3️⃣ Создаем Размеры (Size)
	await prisma.size.createMany({
		data: [
			{ name: "Piccola", value: 20, sortOrder: 1 },
			{ name: "Media", value: 30, sortOrder: 2 },
			{ name: "Grande", value: 40, sortOrder: 3 },
			{ name: "0.33L", value: 33, sortOrder: 4 }, // Для напитков
			{ name: "0.5L", value: 50, sortOrder: 5 },
			{ name: "1L", value: 100, sortOrder: 6 },
			{ name: "Null", value: 0, sortOrder: 7 },
		],
	});

	// 4️⃣ Создаем Типы теста (Type)
	await prisma.type.createMany({
		data: [
			{ name: "Tradizionale", value: 1, sortOrder: 1 },
			{ name: "Sottile", value: 2, sortOrder: 2 },
			{ name: "Null", value: 3, sortOrder: 3 },
			{ name: "Standart", value: 4, sortOrder: 4 },
			{ name: "Vegetariano", value: 5, sortOrder: 5 },
		],
	});

	// 5️⃣ Создаем Ингредиенты
	await prisma.ingredient.createMany({
		data: _ingredients,
	});

	console.log("✅ Базовые данные созданы (пользователи, категории, размеры, типы, ингредиенты)");

	// 🍕 СОЗДАЕМ ПИЦЦЫ - каждая отдельно с явными параметрами

	// Пицца 1: Pepperoni fresh 🌶️
	await prisma.product.create({
		data: {
			name: "Pepperoni fresh",
			imageUrl:
				"https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/pizza/Pepperoni_freshJPG.webp",
			categoryId: 1, // Pizze
			baseIngredients: [
				{ id: 2, removable: false }, // Mocarella cremosa (обязательна)
				{ id: 8, removable: true }, // Pepperoni piccante
				{ id: 11, removable: true }, // Pomodori freschi
			],
			addableIngredientIds: [1, 3, 4, 5, 6, 7, 9, 10, 12, 13, 14, 15, 16, 17],
			variants: [
				{ variantId: 1, sizeId: 1, typeId: 1, price: 5 }, // Piccola + Tradizionale
				{ variantId: 2, sizeId: 1, typeId: 2, price: 5 }, // Piccola + Sottile
				{ variantId: 3, sizeId: 2, typeId: 1, price: 10 }, // Media + Tradizionale
				{ variantId: 4, sizeId: 2, typeId: 2, price: 10 }, // Media + Sottile
				{ variantId: 5, sizeId: 3, typeId: 1, price: 15 }, // Grande + Tradizionale
				{ variantId: 6, sizeId: 3, typeId: 2, price: 15 }, // Grande + Sottile
			],
		},
	});

	// Пицца 2: 4 Formaggio 🧀
	await prisma.product.create({
		data: {
			name: "4 Formaggio",
			imageUrl: "https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/pizza/4_Formaggio.webp",
			categoryId: 1,
			baseIngredients: [
				{ id: 2, removable: false }, // Mocarella cremosa
				{ id: 3, removable: true }, // Formaggi Cheddar e Parmigiano
				{ id: 16, removable: true }, // Cubetti di formaggio feta
				{ id: 1, removable: true }, // Bordo del formaggio
			],
			addableIngredientIds: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 17],
			variants: [
				{ variantId: 1, sizeId: 1, typeId: 1, price: 5 }, // Piccola + Tradizionale
				{ variantId: 2, sizeId: 1, typeId: 2, price: 5 }, // Piccola + Sottile
				{ variantId: 3, sizeId: 2, typeId: 1, price: 10 }, // Media + Tradizionale
				{ variantId: 4, sizeId: 2, typeId: 2, price: 10 }, // Media + Sottile
				{ variantId: 5, sizeId: 3, typeId: 1, price: 15 }, // Grande + Tradizionale
				{ variantId: 6, sizeId: 3, typeId: 2, price: 15 }, // Grande + Sottile
			],
		},
	});

	// Пицца 3: Chorizo ​​fresh 🌶️🌶️
	await prisma.product.create({
		data: {
			name: "Chorizo ​​fresh",
			imageUrl:
				"https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/pizza/Chorizo%20__fresh.webp",
			categoryId: 1,
			baseIngredients: [
				{ id: 2, removable: false }, // Mocarella cremosa
				{ id: 9, removable: true }, // Chorizo ​​piccante
				{ id: 11, removable: true }, // Pomodori freschi
				{ id: 12, removable: true }, // Cipolla rossa
			],
			addableIngredientIds: [1, 3, 4, 5, 6, 7, 8, 10, 13, 14, 15, 16, 17],
			variants: [
				{ variantId: 1, sizeId: 1, typeId: 1, price: 5 }, // Piccola + Tradizionale
				{ variantId: 2, sizeId: 1, typeId: 2, price: 5 }, // Piccola + Sottile
				{ variantId: 3, sizeId: 2, typeId: 1, price: 10 }, // Media + Tradizionale
				{ variantId: 4, sizeId: 2, typeId: 2, price: 10 }, // Media + Sottile
				{ variantId: 5, sizeId: 3, typeId: 1, price: 15 }, // Grande + Tradizionale
				{ variantId: 6, sizeId: 3, typeId: 2, price: 15 }, // Grande + Sottile
			],
		},
	});

	// Пицца 4: Margherita 🍅
	await prisma.product.create({
		data: {
			name: "Margherita",
			imageUrl: "https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/pizza/Margherita.webp",
			categoryId: 1,
			baseIngredients: [
				{ id: 2, removable: false }, // Mocarella cremosa
				{ id: 11, removable: true }, // Pomodori freschi
				{ id: 14, removable: true }, // Erbe italiane
			],
			addableIngredientIds: [1, 3, 4, 5, 6, 7, 8, 9, 10, 12, 13, 15, 16, 17],
			variants: [
				{ variantId: 1, sizeId: 1, typeId: 1, price: 5 }, // Piccola + Tradizionale
				{ variantId: 2, sizeId: 1, typeId: 2, price: 5 }, // Piccola + Sottile
				{ variantId: 3, sizeId: 2, typeId: 1, price: 10 }, // Media + Tradizionale
				{ variantId: 4, sizeId: 2, typeId: 2, price: 10 }, // Media + Sottile
				{ variantId: 5, sizeId: 3, typeId: 1, price: 15 }, // Grande + Tradizionale
				{ variantId: 6, sizeId: 3, typeId: 2, price: 15 }, // Grande + Sottile
			],
		},
	});

	// Пицца 5: Prosciutto e Funghi 🍄
	await prisma.product.create({
		data: {
			name: "Prosciutto e Funghi",
			imageUrl:
				"https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/pizza/Pepperoni_freshJPG.webp",
			categoryId: 1,
			baseIngredients: [
				{ id: 2, removable: false }, // Mocarella cremosa
				{ id: 7, removable: true }, // Prosciutto
				{ id: 6, removable: true }, // Funghi prataioli
				{ id: 11, removable: true }, // Pomodori freschi
			],
			addableIngredientIds: [1, 3, 4, 5, 8, 9, 10, 12, 13, 14, 15, 16, 17],
			variants: [
				{ variantId: 1, sizeId: 1, typeId: 1, price: 5 }, // Piccola + Tradizionale
				{ variantId: 2, sizeId: 1, typeId: 2, price: 5 }, // Piccola + Sottile
				{ variantId: 3, sizeId: 2, typeId: 1, price: 10 }, // Media + Tradizionale
				{ variantId: 4, sizeId: 2, typeId: 2, price: 10 }, // Media + Sottile
				{ variantId: 5, sizeId: 3, typeId: 1, price: 15 }, // Grande + Tradizionale
				{ variantId: 6, sizeId: 3, typeId: 2, price: 15 }, // Grande + Sottile
			],
		},
	});

	// Пицца 6: Pollo e Ananas 🍍🍗 (Hawaiian style)
	await prisma.product.create({
		data: {
			name: "Pollo e Ananas",
			imageUrl: "https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/pizza/Villaggio.webp",
			categoryId: 1,
			baseIngredients: [
				{ id: 2, removable: false }, // Mocarella cremosa
				{ id: 5, removable: true }, // Pollo tenero
				{ id: 13, removable: true }, // Ananas succosi
				{ id: 12, removable: true }, // Cipolla rossa
			],
			addableIngredientIds: [1, 3, 4, 6, 7, 8, 9, 10, 11, 14, 15, 16, 17],
			variants: [
				{ variantId: 1, sizeId: 1, typeId: 1, price: 5 }, // Piccola + Tradizionale
				{ variantId: 2, sizeId: 1, typeId: 2, price: 5 }, // Piccola + Sottile
				{ variantId: 3, sizeId: 2, typeId: 1, price: 10 }, // Media + Tradizionale
				{ variantId: 4, sizeId: 2, typeId: 2, price: 10 }, // Media + Sottile
				{ variantId: 5, sizeId: 3, typeId: 1, price: 15 }, // Grande + Tradizionale
				{ variantId: 6, sizeId: 3, typeId: 2, price: 15 }, // Grande + Sottile
			],
		},
	});

	// Пицца 7: Vegetariana 🌱
	await prisma.product.create({
		data: {
			name: "Vegetariana",
			imageUrl: "https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/pizza/Hawaiano.webp",
			categoryId: 1,
			baseIngredients: [
				{ id: 2, removable: false }, // Mocarella cremosa
				{ id: 11, removable: true }, // Pomodori freschi
				{ id: 15, removable: true }, // Peperone dolce
				{ id: 6, removable: true }, // Funghi prataioli
				{ id: 12, removable: true }, // Cipolla rossa
				{ id: 14, removable: true }, // Erbe italiane
			],
			addableIngredientIds: [1, 3, 4, 10, 13, 16],
			variants: [
				{ variantId: 1, sizeId: 1, typeId: 1, price: 5 }, // Piccola + Tradizionale
				{ variantId: 2, sizeId: 1, typeId: 2, price: 5 }, // Piccola + Sottile
				{ variantId: 3, sizeId: 2, typeId: 1, price: 10 }, // Media + Tradizionale
				{ variantId: 4, sizeId: 2, typeId: 2, price: 10 }, // Media + Sottile
				{ variantId: 5, sizeId: 3, typeId: 1, price: 15 }, // Grande + Tradizionale
				{ variantId: 6, sizeId: 3, typeId: 2, price: 15 }, // Grande + Sottile
			],
		},
	});

	// Пицца 8: Diavola 🔥🌶️
	await prisma.product.create({
		data: {
			name: "Diavola",
			imageUrl: "https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/pizza/6_Formaggi.webp",
			categoryId: 1,
			baseIngredients: [
				{ id: 2, removable: false }, // Mocarella cremosa
				{ id: 9, removable: true }, // Chorizo ​​piccante
				{ id: 8, removable: true }, // Pepperoni piccante
				{ id: 4, removable: true }, // Peperoncino jalapeño piccante
				{ id: 11, removable: true }, // Pomodori freschi
			],
			addableIngredientIds: [1, 3, 5, 6, 7, 10, 12, 13, 14, 15, 16, 17],
			variants: [
				{ variantId: 1, sizeId: 1, typeId: 1, price: 5 }, // Piccola + Tradizionale
				{ variantId: 2, sizeId: 1, typeId: 2, price: 5 }, // Piccola + Sottile
				{ variantId: 3, sizeId: 2, typeId: 1, price: 10 }, // Media + Tradizionale
				{ variantId: 4, sizeId: 2, typeId: 2, price: 10 }, // Media + Sottile
				{ variantId: 5, sizeId: 3, typeId: 1, price: 15 }, // Grande + Tradizionale
				{ variantId: 6, sizeId: 3, typeId: 2, price: 15 }, // Grande + Sottile
			],
		},
	});

	// Пицца 9: Carne Mista 🥩
	await prisma.product.create({
		data: {
			name: "Carne Mista",
			imageUrl: "https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/pizza/4_Carne.webp",
			categoryId: 1,
			baseIngredients: [
				{ id: 2, removable: false }, // Mocarella cremosa
				{ id: 7, removable: true }, // Prosciutto
				{ id: 8, removable: true }, // Pepperoni piccante
				{ id: 9, removable: true }, // Chorizo ​​piccante
				{ id: 17, removable: true }, // Polpette
			],
			addableIngredientIds: [1, 3, 4, 5, 6, 10, 11, 12, 13, 14, 15, 16],
			variants: [
				{ variantId: 1, sizeId: 1, typeId: 1, price: 5 }, // Piccola + Tradizionale
				{ variantId: 2, sizeId: 1, typeId: 2, price: 5 }, // Piccola + Sottile
				{ variantId: 3, sizeId: 2, typeId: 1, price: 10 }, // Media + Tradizionale
				{ variantId: 4, sizeId: 2, typeId: 2, price: 10 }, // Media + Sottile
				{ variantId: 5, sizeId: 3, typeId: 1, price: 15 }, // Grande + Tradizionale
				{ variantId: 6, sizeId: 3, typeId: 2, price: 15 }, // Grande + Sottile
			],
		},
	});

	// Пицца 10: Pollo BBQ 🍗
	await prisma.product.create({
		data: {
			name: "Pollo BBQ",
			imageUrl: "https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/pizza/Barbecue.webp",
			categoryId: 1,
			baseIngredients: [
				{ id: 2, removable: false }, // Mocarella cremosa
				{ id: 5, removable: true }, // Pollo tenero
				{ id: 12, removable: true }, // Cipolla rossa
				{ id: 6, removable: true }, // Funghi prataioli
			],
			addableIngredientIds: [1, 3, 4, 7, 8, 9, 10, 11, 13, 14, 15, 16, 17],
			variants: [
				{ variantId: 1, sizeId: 1, typeId: 1, price: 5 }, // Piccola + Tradizionale
				{ variantId: 2, sizeId: 1, typeId: 2, price: 5 }, // Piccola + Sottile
				{ variantId: 3, sizeId: 2, typeId: 1, price: 10 }, // Media + Tradizionale
				{ variantId: 4, sizeId: 2, typeId: 2, price: 10 }, // Media + Sottile
				{ variantId: 5, sizeId: 3, typeId: 1, price: 15 }, // Grande + Tradizionale
				{ variantId: 6, sizeId: 3, typeId: 2, price: 15 }, // Grande + Sottile
			],
		},
	});

	console.log("✅ Создано 10 пицц с явными параметрами");

	// Завтрак ------------------------------------------------------------
	// Завтрак 1: Frittata con prosciutto e funghi
	await prisma.product.create({
		data: {
			name: "Frittata con prosciutto e funghi",
			imageUrl:
				"https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/products/Frittata_con_proscitto_e_funghi.webp",
			categoryId: 2, // Colazione
			baseIngredients: [
				{ id: 7, removable: false }, // Prosciutto
				{ id: 6, removable: false }, // Funghi prataioli
				{ id: 2, removable: false }, // Mocarella
			],
			addableIngredientIds: [1, 3, 4, 5, 8, 9, 10, 11, 12, 14, 15],
			variants: [
				{ variantId: 1, sizeId: 4, typeId: 3, price: 5.99 }, // Стандартный размер
			],
		},
	});

	// Завтрак 2: Frittata al salame piccante
	await prisma.product.create({
		data: {
			name: "Frittata al salame piccante",
			imageUrl:
				"https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/products/Frittata_al_salame_piccante.webp",
			categoryId: 2,
			baseIngredients: [
				{ id: 8, removable: false }, // Pepperoni piccante
				{ id: 2, removable: false }, // Mocarella
				{ id: 4, removable: true }, // Peperoncino jalapeño
			],
			addableIngredientIds: [1, 3, 5, 6, 7, 9, 10, 11, 12, 14, 15],
			variants: [{ variantId: 1, sizeId: 7, typeId: 3, price: 5.99 }],
		},
	});
	// Завтрак 3: Caffè Latte
	await prisma.product.create({
		data: {
			name: "Caffè Latte",
			imageUrl:
				"https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/products/caffe-latte.webp",
			categoryId: 2, // Colazione
			baseIngredients: [],
			addableIngredientIds: [],
			variants: [
				{ variantId: 1, sizeId: 4, typeId: 3, price: 2.99 }, // 0.33L
				{ variantId: 2, sizeId: 5, typeId: 3, price: 3.99 }, // 0.5L
			],
		},
	});

	console.log("✅ Создано 3 завтрака (Colazione)");

	// Закуска ------------------------------------------------------------
	// Закуска 1: Prosciutto e formaggio di Danwich
	await prisma.product.create({
		data: {
			name: "Prosciutto e formaggio di Danwich",
			imageUrl:
				"https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/products/Prosciutto_e_formaggio_di_Danwich.webp",
			categoryId: 3, // Antipasti
			baseIngredients: [
				{ id: 7, removable: false }, // Prosciutto
				{ id: 2, removable: false }, // Mocarella
			],
			addableIngredientIds: [1, 3, 6, 10, 11, 12, 14],
			variants: [{ variantId: 1, sizeId: 7, typeId: 4, price: 6.99 }],
		},
	});

	// Закуска 2: Bocconcini di pollo
	await prisma.product.create({
		data: {
			name: "Bocconcini di pollo",
			imageUrl:
				"https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/products/Bocconcini_di_pollo.webp",
			categoryId: 3,
			baseIngredients: [
				{ id: 5, removable: false }, // Pollo tenero
			],
			addableIngredientIds: [], // Без дополнений
			variants: [{ variantId: 1, sizeId: 7, typeId: 3, price: 7.49 }],
		},
	});

	// Закуска 3: Patate al forno con salsa 🌱
	await prisma.product.create({
		data: {
			name: "Patate al forno con salsa 🌱",
			imageUrl:
				"https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/products/Patate_al_forno_con_salsa.webp",
			categoryId: 3,
			baseIngredients: [],
			addableIngredientIds: [14], // Можно добавить итальянские травы
			variants: [{ variantId: 1, sizeId: 7, typeId: 5, price: 4.99 }],
		},
	});

	// Закуска 4: Dodster
	await prisma.product.create({
		data: {
			name: "Dodster",
			imageUrl: "https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/products/Dodster.webp",
			categoryId: 3,
			baseIngredients: [
				{ id: 7, removable: false }, // Prosciutto
				{ id: 2, removable: false }, // Mocarella
				{ id: 11, removable: true }, // Pomodori
			],
			addableIngredientIds: [6, 12, 14],
			variants: [{ variantId: 1, sizeId: 7, typeId: 4, price: 6.49 }],
		},
	});

	// Закуска 5: Sharp Dodster 🌶️🌶️
	await prisma.product.create({
		data: {
			name: "Sharp Dodster 🌶️🌶️",
			imageUrl:
				"https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/products/Sharp_Dodster.webp",
			categoryId: 3,
			baseIngredients: [
				{ id: 8, removable: false }, // Pepperoni piccante
				{ id: 2, removable: false }, // Mocarella
				{ id: 4, removable: true }, // Peperoncino jalapeño
			],
			addableIngredientIds: [9, 11, 12],
			variants: [{ variantId: 1, sizeId: 7, typeId: 4, price: 6.99 }],
		},
	});
	console.log("✅ Создано 5 закусок (Antipasti)");

	// Коктейль ------------------------------------------------------------
	// Коктейль 1: Frullato di banana
	await prisma.product.create({
		data: {
			name: "Frullato di banana",
			imageUrl:
				"https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/products/Frullato_di_banana.webp",
			categoryId: 4, // Cocktail
			baseIngredients: [],
			addableIngredientIds: [],
			variants: [
				{ variantId: 1, sizeId: 4, typeId: 5, price: 2.99 },
				{ variantId: 2, sizeId: 5, typeId: 5, price: 4.99 },
			],
		},
	});

	// Коктейль 2: Frullato di mele caramellate
	await prisma.product.create({
		data: {
			name: "Frullato di mele caramellate",
			imageUrl:
				"https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/products/Frullato_di_mele_caramellate.webp",
			categoryId: 4,
			baseIngredients: [],
			addableIngredientIds: [],
			variants: [{ variantId: 1, sizeId: 4, typeId: 5, price: 2.49 }],
		},
	});

	// Коктейль 3: Frullato di biscotti Oreo
	await prisma.product.create({
		data: {
			name: "Frullato di biscotti Oreo",
			imageUrl:
				"https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/products/Frullato_di_biscotti_Oreo.webp",
			categoryId: 4,
			baseIngredients: [],
			addableIngredientIds: [],
			variants: [
				{ variantId: 1, sizeId: 4, typeId: 5, price: 2.99 },
				{ variantId: 2, sizeId: 5, typeId: 5, price: 4.99 },
				{ variantId: 3, sizeId: 6, typeId: 5, price: 6.99 },
			],
		},
	});

	// Коктейль 4: Frullato classico 👶
	await prisma.product.create({
		data: {
			name: "Frullato classico 👶",
			imageUrl:
				"https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/products/Frullato_classico.webp",
			categoryId: 4,
			baseIngredients: [],
			addableIngredientIds: [],
			variants: [
				{ variantId: 1, sizeId: 4, typeId: 5, price: 2.49 },
				{ variantId: 2, sizeId: 5, typeId: 5, price: 4.49 },
			],
		},
	});
	console.log("✅ Создано 4 коктейля (Cocktail)");

	// Напиток ------------------------------------------------------------
	// Напиток 1: Cappuccino irlandese
	await prisma.product.create({
		data: {
			name: "Cappuccino irlandese",
			imageUrl:
				"https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/products/Cappuccino_irlandese.webp",
			categoryId: 5, // Bevande
			baseIngredients: [],
			addableIngredientIds: [],
			variants: [
				{ variantId: 1, sizeId: 4, typeId: 3, price: 2.99 },
				{ variantId: 2, sizeId: 5, typeId: 3, price: 3.99 },
				{ variantId: 3, sizeId: 6, typeId: 3, price: 5.99 },
			],
		},
	});

	// Напиток 2: Caffè al cappuccino al caramello
	await prisma.product.create({
		data: {
			name: "Caffè al cappuccino al caramello",
			imageUrl:
				"https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/products/caffe-al-cappuccino-al-caramello.webp",
			categoryId: 5,
			baseIngredients: [],
			addableIngredientIds: [],
			variants: [{ variantId: 1, sizeId: 5, typeId: 4, price: 4.49 }],
		},
	});

	// Напиток 3: Caffè Latte al Cocco
	await prisma.product.create({
		data: {
			name: "Caffè Latte al Cocco",
			imageUrl:
				"https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/products/caffe-al-cappuccino-al-caramello.webp",
			categoryId: 5,
			baseIngredients: [],
			addableIngredientIds: [],
			variants: [{ variantId: 1, sizeId: 4, typeId: 4, price: 4.49 }],
		},
	});

	// Напиток 4: Caffè americano
	await prisma.product.create({
		data: {
			name: "Caffè americano",
			imageUrl:
				"https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/products/caffe-amer.webp",
			categoryId: 5,
			baseIngredients: [],
			addableIngredientIds: [],
			variants: [{ variantId: 1, sizeId: 4, typeId: 4, price: 2.99 }],
		},
	});

	// Напиток 5: Caffè Latte2
	await prisma.product.create({
		data: {
			name: "Caffè Latte2",
			imageUrl:
				"https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/products/Caffe_Latte2.webp",
			categoryId: 5,
			baseIngredients: [],
			addableIngredientIds: [],
			variants: [{ variantId: 1, sizeId: 4, typeId: 4, price: 3.99 }],
		},
	});
	console.log("✅ Создано 5 напитков (Bevande)");

	// console.log(`✅ Создано ${products.length} дополнительных продуктов (завтраки, закуски, напитки)`);

	// 7️⃣ Создаем тестовую корзину
	const pepperoniPizza = await prisma.product.findFirst({ where: { name: "Pepperoni fresh" } });

	if (pepperoniPizza) {
		const cart1 = await prisma.cart.create({
			data: {
				userId: user1.id,
				totalAmount: 0,
				tokenId: "11111",
			},
		});

		const variants = pepperoniPizza.variants as any[];
		const firstVariant = variants[0]; // Piccola + Tradizionale

		await prisma.cartItem.create({
			data: {
				cartId: cart1.id,
				productId: pepperoniPizza.id,
				quantity: 2,
				variantId: firstVariant.variantId,
				addedIngredientIds: [6], // Добавили грибы
				removedBaseIngredientIds: [],
			},
		});

		await prisma.cart.update({
			where: { id: cart1.id },
			data: { totalAmount: firstVariant.price * 2 },
		});

		console.log("✅ Создана тестовая корзина");
	}

	// 8️⃣ Создаем Stories
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
			{
				previewImageUrl:
					"https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/story/storyImg/3.webp",
			},
			{
				previewImageUrl:
					"https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/story/storyImg/4.webp",
			},
			{
				previewImageUrl:
					"https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/story/storyImg/5.webp",
			},
			{
				previewImageUrl:
					"https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/story/storyImg/6.webp",
			},
		],
	});

	console.log("✅ Создано 6 Stories");

	// Создаем StoryItems для каждой Story
	await prisma.storyItem.createMany({
		data: [
			// Story 1 - 2 элемента
			{
				storyId: 1,
				sourceUrl:
					"https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/story/storyItem/1.webp",
			},
			{
				storyId: 1,
				sourceUrl:
					"https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/story/storyItem/2.webp",
			},

			// Story 2 - 2 элемента
			{
				storyId: 2,
				sourceUrl:
					"https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/story/storyItem/3.webp",
			},
			{
				storyId: 2,
				sourceUrl:
					"https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/story/storyItem/4.webp",
			},

			// Story 3 - 2 элемента
			{
				storyId: 3,
				sourceUrl:
					"https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/story/storyItem/6.webp",
			},
			{
				storyId: 3,
				sourceUrl:
					"https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/story/storyItem/4.webp",
			},

			// Story 4 - 2 элемента
			{
				storyId: 4,
				sourceUrl:
					"https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/story/storyItem/1.webp",
			},
			{
				storyId: 4,
				sourceUrl:
					"https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/story/storyItem/3.webp",
			},

			// Story 5 - 2 элемента
			{
				storyId: 5,
				sourceUrl:
					"https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/story/storyItem/2.webp",
			},
			{
				storyId: 5,
				sourceUrl:
					"https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/story/storyItem/5.webp",
			},

			// Story 6 - 2 элемента
			{
				storyId: 6,
				sourceUrl:
					"https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/story/storyItem/1.webp",
			},
			{
				storyId: 6,
				sourceUrl:
					"https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/story/storyItem/4.webp",
			},
		],
	});

	console.log("✅ Создано 12 StoryItems для 6 Stories");

	// 9️⃣ Сброс последовательностей (Sequences) для PostgreSQL
	// await prisma.$executeRawUnsafe(
	// 	// `SELECT setval('"Ingredient_id_seq"', (SELECT COALESCE(MAX(id), 1) FROM "Ingredient"))`,
	// );
	await prisma.$executeRawUnsafe(
		`SELECT setval('"Ingredient_id_seq"', (SELECT COALESCE(MAX(id), 1) FROM "Ingredient"))`,
	);
	// await prisma.$executeRawUnsafe(`SELECT setval('"Category_id_seq"', (SELECT COALESCE(MAX(id), 1) FROM "Category"))`);
	await prisma.$executeRawUnsafe(`SELECT setval('"Category_id_seq"', (SELECT COALESCE(MAX(id), 1) FROM "Category"))`);
	// await prisma.$executeRawUnsafe(`SELECT setval('"Product_id_seq"', (SELECT COALESCE(MAX(id), 1) FROM "Product"))`);
	await prisma.$executeRawUnsafe(`SELECT setval('"Product_id_seq"', (SELECT COALESCE(MAX(id), 1) FROM "Product"))`);
	// await prisma.$executeRawUnsafe(`SELECT setval('"Size_id_seq"', (SELECT COALESCE(MAX(id), 1) FROM "Size"))`);
	await prisma.$executeRawUnsafe(`SELECT setval('"Size_id_seq"', (SELECT COALESCE(MAX(id), 1) FROM "Size"))`);
	// await prisma.$executeRawUnsafe(`SELECT setval('"Type_id_seq"', (SELECT COALESCE(MAX(id), 1) FROM "Type"))`);
	await prisma.$executeRawUnsafe(`SELECT setval('"Type_id_seq"', (SELECT COALESCE(MAX(id), 1) FROM "Type"))`);
	// await prisma.$executeRawUnsafe(`SELECT setval('"Story_id_seq"', (SELECT COALESCE(MAX(id), 1) FROM "Story"))`);
	await prisma.$executeRawUnsafe(`SELECT setval('"Story_id_seq"', (SELECT COALESCE(MAX(id), 1) FROM "Story"))`);
	// await prisma.$executeRawUnsafe(
	// 	`SELECT setval('"StoryItem_id_seq"', (SELECT COALESCE(MAX(id), 1) FROM "StoryItem"))`,
	// );
	await prisma.$executeRawUnsafe(
		`SELECT setval('"StoryItem_id_seq"', (SELECT COALESCE(MAX(id), 1) FROM "StoryItem"))`,
	);
	// await prisma.$executeRawUnsafe(`SELECT setval('"Cart_id_seq"', (SELECT COALESCE(MAX(id), 1) FROM "Cart"))`);
	// await prisma.$executeRawUnsafe(`SELECT setval('"CartItem_id_seq"', (SELECT COALESCE(MAX(id), 1) FROM "CartItem"))`);
	// await prisma.$executeRawUnsafe(`SELECT setval('"User_id_seq"', (SELECT COALESCE(MAX(id), 1) FROM "User"))`);

	console.log("✅ Сброс последовательностей (sequences) выполнен");
}

async function main() {
	try {
		await down();
		await up();
		console.log("🎉 База данных успешно заполнена!");
	} catch (e) {
		console.error("❌ Ошибка при заполнении базы данных:", e);
		process.exit(1);
	} finally {
		await prisma.$disconnect();
	}
}

main();
