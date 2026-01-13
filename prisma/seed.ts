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
	// ✅ HELPER ФУНКЦИЯ - Получение данных ингредиента по ID
	const getIngredient = (id: number) => {
		const ingredientsMap: Record<number, { name: string; imageUrl: string }> = {
			1: {
				name: "Bordo del formaggio",
				imageUrl:
					"https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/ingredients/Bordo_del_formaggio.webp",
			},
			2: {
				name: "Mocarella cremosa",
				imageUrl:
					"https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/ingredients/Mozzarella_cremosa.webp",
			},
			3: {
				name: "Formaggi Cheddar e Parmigiano",
				imageUrl:
					"https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/ingredients/Formaggi_Cheddar_e_Parmigiano.webp",
			},
			4: {
				name: "Peperoncino jalapeño piccante",
				imageUrl:
					"https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/ingredients/Peper_piccante.webp",
			},
			5: {
				name: "Pollo tenero",
				imageUrl:
					"https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/ingredients/Pollo_tenero.webp",
			},
			6: {
				name: "Funghi prataioli",
				imageUrl:
					"https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/ingredients/Funghi_prataioli.webp",
			},
			7: {
				name: "Prosciutto",
				imageUrl:
					"https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/ingredients/Prosciutto.webp",
			},
			8: {
				name: "Pepperoni piccante",
				imageUrl:
					"https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/ingredients/Pepperoni_piccante.webp",
			},
			9: {
				name: "Chorizo ​​piccante",
				imageUrl:
					"https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/ingredients/Chorizo_piccante.webp",
			},
			10: {
				name: "Cetrioli sottaceto",
				imageUrl:
					"https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/ingredients/Cetrioli_sottaceto.webp",
			},
			11: {
				name: "Pomodori freschi",
				imageUrl:
					"https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/ingredients/Pomodori_freschi.webp",
			},
			12: {
				name: "Cipolla rossa",
				imageUrl:
					"https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/ingredients/Cipolla_rossa.webp",
			},
			13: {
				name: "Ananas succosi",
				imageUrl:
					"https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/ingredients/Ananas_succosi-1.webp",
			},
			14: {
				name: "Erbe italiane",
				imageUrl:
					"https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/ingredients/Erbe_italiane.webp",
			},
			15: {
				name: "Peperone dolce",
				imageUrl:
					"https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/ingredients/Peperone_dolce.webp",
			},
			16: {
				name: "Cubetti di formaggio feta",
				imageUrl:
					"https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/ingredients/Cubetti_di_formaggio_feta.webp",
			},
			17: {
				name: "Polpette",
				imageUrl:
					"https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/ingredients/Polpette.webp",
			},
		};

		return ingredientsMap[id] || { name: `Ingredient ${id}`, imageUrl: "" };
	};

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
			{ name: "0.33L", value: 33, sortOrder: 4 },
			{ name: "0.5L", value: 50, sortOrder: 5 },
			{ name: "1L", value: 100, sortOrder: 6 },
			{ name: "Classico", value: 0, sortOrder: 7 },
		],
	});

	// 4️⃣ Создаем Типы теста (Type)
	await prisma.type.createMany({
		data: [
			{ name: "Tradizionale", value: 1, sortOrder: 1 },
			{ name: "Sottile", value: 2, sortOrder: 2 },
			{ name: "Null", value: 3, sortOrder: 3 },
			{ name: "Classico", value: 4, sortOrder: 4 },
			{ name: "Vegetariano", value: 5, sortOrder: 5 },
			{ name: "Bevande", value: 6, sortOrder: 6 },
			{ name: "Colazione", value: 7, sortOrder: 7 },
			{ name: "Antipasti", value: 8, sortOrder: 8 },
			{ name: "Cocktail", value: 9, sortOrder: 9 },
		],
	});

	// 5️⃣ Создаем Ингредиенты
	await prisma.ingredient.createMany({
		data: _ingredients,
	});

	console.log("✅ Базовые данные созданы");

	// 🍕 СОЗДАЕМ ПИЦЦЫ с полными данными baseIngredients

	// Пицца 1: Pepperoni fresh 🌶️
	await prisma.product.create({
		data: {
			name: "Pepperoni fresh",
			imageUrl:
				"https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/pizza/Pepperoni_freshJPG.webp",
			categoryId: 1,
			baseIngredients: [
				{ id: 2, ...getIngredient(2), removable: false, isDisabled: false },
				{ id: 8, ...getIngredient(8), removable: true, isDisabled: false },
				{ id: 11, ...getIngredient(11), removable: true, isDisabled: false },
			],
			addableIngredientIds: [1, 3, 4, 5, 6, 7, 9, 10, 12, 13, 14, 15, 16, 17],
			variants: [
				{ variantId: 1, sizeId: 1, typeId: 1, price: 5 },
				{ variantId: 2, sizeId: 1, typeId: 2, price: 5 },
				{ variantId: 3, sizeId: 2, typeId: 1, price: 10 },
				{ variantId: 4, sizeId: 2, typeId: 2, price: 10 },
				{ variantId: 5, sizeId: 3, typeId: 1, price: 15 },
				{ variantId: 6, sizeId: 3, typeId: 2, price: 15 },
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
				{ id: 2, ...getIngredient(2), removable: false, isDisabled: false },
				{ id: 3, ...getIngredient(3), removable: true, isDisabled: false },
				{ id: 16, ...getIngredient(16), removable: true, isDisabled: false },
				{ id: 1, ...getIngredient(1), removable: true, isDisabled: false },
			],
			addableIngredientIds: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 17],
			variants: [
				{ variantId: 1, sizeId: 1, typeId: 1, price: 5 },
				{ variantId: 2, sizeId: 1, typeId: 2, price: 5 },
				{ variantId: 3, sizeId: 2, typeId: 1, price: 10 },
				{ variantId: 4, sizeId: 2, typeId: 2, price: 10 },
				{ variantId: 5, sizeId: 3, typeId: 1, price: 15 },
				{ variantId: 6, sizeId: 3, typeId: 2, price: 15 },
			],
		},
	});

	// Пицца 3: Chorizo fresh 🌶️🌶️
	await prisma.product.create({
		data: {
			name: "Chorizo ​​fresh",
			imageUrl:
				"https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/pizza/Chorizo%20__fresh.webp",
			categoryId: 1,
			baseIngredients: [
				{ id: 2, ...getIngredient(2), removable: false, isDisabled: false },
				{ id: 9, ...getIngredient(9), removable: true, isDisabled: false },
				{ id: 11, ...getIngredient(11), removable: true, isDisabled: false },
				{ id: 12, ...getIngredient(12), removable: true, isDisabled: false },
			],
			addableIngredientIds: [1, 3, 4, 5, 6, 7, 8, 10, 13, 14, 15, 16, 17],
			variants: [
				{ variantId: 1, sizeId: 1, typeId: 1, price: 5 },
				{ variantId: 2, sizeId: 1, typeId: 2, price: 5 },
				{ variantId: 3, sizeId: 2, typeId: 1, price: 10 },
				{ variantId: 4, sizeId: 2, typeId: 2, price: 10 },
				{ variantId: 5, sizeId: 3, typeId: 1, price: 15 },
				{ variantId: 6, sizeId: 3, typeId: 2, price: 15 },
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
				{ id: 2, ...getIngredient(2), removable: false, isDisabled: false },
				{ id: 11, ...getIngredient(11), removable: true, isDisabled: false },
				{ id: 14, ...getIngredient(14), removable: true, isDisabled: false },
			],
			addableIngredientIds: [1, 3, 4, 5, 6, 7, 8, 9, 10, 12, 13, 15, 16, 17],
			variants: [
				{ variantId: 1, sizeId: 1, typeId: 1, price: 5 },
				{ variantId: 2, sizeId: 1, typeId: 2, price: 5 },
				{ variantId: 3, sizeId: 2, typeId: 1, price: 10 },
				{ variantId: 4, sizeId: 2, typeId: 2, price: 10 },
				{ variantId: 5, sizeId: 3, typeId: 1, price: 15 },
				{ variantId: 6, sizeId: 3, typeId: 2, price: 15 },
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
				{ id: 2, ...getIngredient(2), removable: false, isDisabled: false },
				{ id: 7, ...getIngredient(7), removable: true, isDisabled: false },
				{ id: 6, ...getIngredient(6), removable: true, isDisabled: false },
				{ id: 11, ...getIngredient(11), removable: true, isDisabled: false },
			],
			addableIngredientIds: [1, 3, 4, 5, 8, 9, 10, 12, 13, 14, 15, 16, 17],
			variants: [
				{ variantId: 1, sizeId: 1, typeId: 1, price: 5 },
				{ variantId: 2, sizeId: 1, typeId: 2, price: 5 },
				{ variantId: 3, sizeId: 2, typeId: 1, price: 10 },
				{ variantId: 4, sizeId: 2, typeId: 2, price: 10 },
				{ variantId: 5, sizeId: 3, typeId: 1, price: 15 },
				{ variantId: 6, sizeId: 3, typeId: 2, price: 15 },
			],
		},
	});

	// Пицца 6: Pollo e Ananas 🍍🍗
	await prisma.product.create({
		data: {
			name: "Pollo e Ananas",
			imageUrl: "https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/pizza/Villaggio.webp",
			categoryId: 1,
			baseIngredients: [
				{ id: 2, ...getIngredient(2), removable: false, isDisabled: false },
				{ id: 5, ...getIngredient(5), removable: true, isDisabled: false },
				{ id: 13, ...getIngredient(13), removable: true, isDisabled: false },
				{ id: 12, ...getIngredient(12), removable: true, isDisabled: false },
			],
			addableIngredientIds: [1, 3, 4, 6, 7, 8, 9, 10, 11, 14, 15, 16, 17],
			variants: [
				{ variantId: 1, sizeId: 1, typeId: 1, price: 5 },
				{ variantId: 2, sizeId: 1, typeId: 2, price: 5 },
				{ variantId: 3, sizeId: 2, typeId: 1, price: 10 },
				{ variantId: 4, sizeId: 2, typeId: 2, price: 10 },
				{ variantId: 5, sizeId: 3, typeId: 1, price: 15 },
				{ variantId: 6, sizeId: 3, typeId: 2, price: 15 },
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
				{ id: 2, ...getIngredient(2), removable: false, isDisabled: false },
				{ id: 11, ...getIngredient(11), removable: true, isDisabled: false },
				{ id: 15, ...getIngredient(15), removable: true, isDisabled: false },
				{ id: 6, ...getIngredient(6), removable: true, isDisabled: false },
				{ id: 12, ...getIngredient(12), removable: true, isDisabled: false },
				{ id: 14, ...getIngredient(14), removable: true, isDisabled: false },
			],
			addableIngredientIds: [1, 3, 4, 10, 13, 16],
			variants: [
				{ variantId: 1, sizeId: 1, typeId: 1, price: 5 },
				{ variantId: 2, sizeId: 1, typeId: 2, price: 5 },
				{ variantId: 3, sizeId: 2, typeId: 1, price: 10 },
				{ variantId: 4, sizeId: 2, typeId: 2, price: 10 },
				{ variantId: 5, sizeId: 3, typeId: 1, price: 15 },
				{ variantId: 6, sizeId: 3, typeId: 2, price: 15 },
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
				{ id: 2, ...getIngredient(2), removable: false, isDisabled: false },
				{ id: 9, ...getIngredient(9), removable: true, isDisabled: false },
				{ id: 8, ...getIngredient(8), removable: true, isDisabled: false },
				{ id: 4, ...getIngredient(4), removable: true, isDisabled: false },
				{ id: 11, ...getIngredient(11), removable: true, isDisabled: false },
			],
			addableIngredientIds: [1, 3, 5, 6, 7, 10, 12, 13, 14, 15, 16, 17],
			variants: [
				{ variantId: 1, sizeId: 1, typeId: 1, price: 5 },
				{ variantId: 2, sizeId: 1, typeId: 2, price: 5 },
				{ variantId: 3, sizeId: 2, typeId: 1, price: 10 },
				{ variantId: 4, sizeId: 2, typeId: 2, price: 10 },
				{ variantId: 5, sizeId: 3, typeId: 1, price: 15 },
				{ variantId: 6, sizeId: 3, typeId: 2, price: 15 },
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
				{ id: 2, ...getIngredient(2), removable: false, isDisabled: false },
				{ id: 7, ...getIngredient(7), removable: true, isDisabled: false },
				{ id: 8, ...getIngredient(8), removable: true, isDisabled: false },
				{ id: 9, ...getIngredient(9), removable: true, isDisabled: false },
				{ id: 17, ...getIngredient(17), removable: true, isDisabled: false },
			],
			addableIngredientIds: [1, 3, 4, 5, 6, 10, 11, 12, 13, 14, 15, 16],
			variants: [
				{ variantId: 1, sizeId: 1, typeId: 1, price: 5 },
				{ variantId: 2, sizeId: 1, typeId: 2, price: 5 },
				{ variantId: 3, sizeId: 2, typeId: 1, price: 10 },
				{ variantId: 4, sizeId: 2, typeId: 2, price: 10 },
				{ variantId: 5, sizeId: 3, typeId: 1, price: 15 },
				{ variantId: 6, sizeId: 3, typeId: 2, price: 15 },
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
				{ id: 2, ...getIngredient(2), removable: false, isDisabled: false },
				{ id: 5, ...getIngredient(5), removable: true, isDisabled: false },
				{ id: 12, ...getIngredient(12), removable: true, isDisabled: false },
				{ id: 6, ...getIngredient(6), removable: true, isDisabled: false },
			],
			addableIngredientIds: [1, 3, 4, 7, 8, 9, 10, 11, 13, 14, 15, 16, 17],
			variants: [
				{ variantId: 1, sizeId: 1, typeId: 1, price: 5 },
				{ variantId: 2, sizeId: 1, typeId: 2, price: 5 },
				{ variantId: 3, sizeId: 2, typeId: 1, price: 10 },
				{ variantId: 4, sizeId: 2, typeId: 2, price: 10 },
				{ variantId: 5, sizeId: 3, typeId: 1, price: 15 },
				{ variantId: 6, sizeId: 3, typeId: 2, price: 15 },
			],
		},
	});

	console.log("✅ Создано 10 пицц");

	// Завтрак ------------------------------------------------------------
	// Завтрак 1: Frittata con prosciutto e funghi
	await prisma.product.create({
		data: {
			name: "Frittata con prosciutto e funghi",
			imageUrl:
				"https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/products/Frittata_con_proscitto_e_funghi.webp",
			categoryId: 2,
			baseIngredients: [
				{ id: 7, ...getIngredient(7), removable: false, isDisabled: false },
				{ id: 6, ...getIngredient(6), removable: false, isDisabled: false },
				{ id: 2, ...getIngredient(2), removable: false, isDisabled: false },
			],
			addableIngredientIds: [1, 3, 4, 5, 8, 9, 10, 11, 12, 14, 15],
			variants: [{ variantId: 1, sizeId: 4, typeId: 7, price: 5.99 }],
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
				{ id: 8, ...getIngredient(8), removable: false, isDisabled: false },
				{ id: 2, ...getIngredient(2), removable: false, isDisabled: false },
				{ id: 4, ...getIngredient(4), removable: true, isDisabled: false },
			],
			addableIngredientIds: [1, 3, 5, 6, 7, 9, 10, 11, 12, 14, 15],
			variants: [{ variantId: 1, sizeId: 7, typeId: 7, price: 5.99 }],
		},
	});

	// Завтрак 3: Caffè Latte
	await prisma.product.create({
		data: {
			name: "Caffè Latte",
			imageUrl:
				"https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/products/caffe-latte.webp",
			categoryId: 2,
			baseIngredients: [],
			addableIngredientIds: [],
			variants: [
				{ variantId: 1, sizeId: 4, typeId: 7, price: 2.99 },
				{ variantId: 2, sizeId: 5, typeId: 7, price: 3.99 },
			],
		},
	});

	console.log("✅ Создано 3 завтрака");

	// Закуска ------------------------------------------------------------
	// Закуска 1: Prosciutto e formaggio di Danwich
	await prisma.product.create({
		data: {
			name: "Prosciutto e formaggio di Danwich",
			imageUrl:
				"https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/products/Prosciutto_e_formaggio_di_Danwich.webp",
			categoryId: 3,
			baseIngredients: [
				{ id: 7, ...getIngredient(7), removable: false, isDisabled: false },
				{ id: 2, ...getIngredient(2), removable: false, isDisabled: false },
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
			baseIngredients: [{ id: 5, ...getIngredient(5), removable: false, isDisabled: false }],
			addableIngredientIds: [],
			variants: [{ variantId: 1, sizeId: 7, typeId: 8, price: 7.49 }],
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
			addableIngredientIds: [14],
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
				{ id: 7, ...getIngredient(7), removable: false, isDisabled: false },
				{ id: 2, ...getIngredient(2), removable: false, isDisabled: false },
				{ id: 11, ...getIngredient(11), removable: true, isDisabled: false },
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
				{ id: 8, ...getIngredient(8), removable: false, isDisabled: false },
				{ id: 2, ...getIngredient(2), removable: false, isDisabled: false },
				{ id: 4, ...getIngredient(4), removable: true, isDisabled: false },
			],
			addableIngredientIds: [9, 11, 12],
			variants: [{ variantId: 1, sizeId: 7, typeId: 4, price: 6.99 }],
		},
	});

	console.log("✅ Создано 5 закусок");

	// Коктейли и напитки (без baseIngredients)
	await prisma.product.createMany({
		data: [
			// Коктейли
			{
				name: "Frullato di banana",
				imageUrl:
					"https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/products/Frullato_di_banana.webp",
				categoryId: 4,
				baseIngredients: [],
				addableIngredientIds: [],
				variants: [
					{ variantId: 1, sizeId: 4, typeId: 5, price: 2.99 },
					{ variantId: 2, sizeId: 5, typeId: 5, price: 4.99 },
				],
			},
			{
				name: "Frullato di mele caramellate",
				imageUrl:
					"https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/products/Frullato_di_mele_caramellate.webp",
				categoryId: 4,
				baseIngredients: [],
				addableIngredientIds: [],
				variants: [{ variantId: 1, sizeId: 4, typeId: 5, price: 2.49 }],
			},
			{
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
			{
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
			// Напитки
			{
				name: "Cappuccino irlandese",
				imageUrl:
					"https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/products/Cappuccino_irlandese.webp",
				categoryId: 5,
				baseIngredients: [],
				addableIngredientIds: [],
				variants: [
					{ variantId: 1, sizeId: 4, typeId: 6, price: 2.99 },
					{ variantId: 2, sizeId: 5, typeId: 6, price: 3.99 },
					{ variantId: 3, sizeId: 6, typeId: 6, price: 5.99 },
				],
			},
			{
				name: "Caffè al cappuccino al caramello",
				imageUrl:
					"https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/products/caffe-al-cappuccino-al-caramello.webp",
				categoryId: 5,
				baseIngredients: [],
				addableIngredientIds: [],
				variants: [{ variantId: 1, sizeId: 5, typeId: 4, price: 4.49 }],
			},
			{
				name: "Caffè Latte al Cocco",
				imageUrl:
					"https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/products/caffe-al-cappuccino-al-caramello.webp",
				categoryId: 5,
				baseIngredients: [],
				addableIngredientIds: [],
				variants: [{ variantId: 1, sizeId: 4, typeId: 4, price: 4.49 }],
			},
			{
				name: "Caffè americano",
				imageUrl:
					"https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/products/caffe-amer.webp",
				categoryId: 5,
				baseIngredients: [],
				addableIngredientIds: [],
				variants: [{ variantId: 1, sizeId: 4, typeId: 4, price: 2.99 }],
			},
			{
				name: "Caffè Latte2",
				imageUrl:
					"https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/products/Caffe_Latte2.webp",
				categoryId: 5,
				baseIngredients: [],
				addableIngredientIds: [],
				variants: [{ variantId: 1, sizeId: 4, typeId: 4, price: 3.99 }],
			},
		],
	});

	console.log("✅ Создано 4 коктейля и 5 напитков");

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
		const firstVariant = variants[0];

		await prisma.cartItem.create({
			data: {
				cartId: cart1.id,
				productId: pepperoniPizza.id,
				quantity: 2,
				variantId: firstVariant.variantId,
				addedIngredientIds: [6],
				baseIngredientsSnapshot: [],
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

	// Создаем StoryItems
	await prisma.storyItem.createMany({
		data: [
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

	console.log("✅ Создано 6 Stories с 12 StoryItems");

	// 9️⃣ Сброс последовательностей (Sequences)
	await prisma.$executeRawUnsafe(
		`SELECT setval('"Ingredient_id_seq"', (SELECT COALESCE(MAX(id), 1) FROM "Ingredient"))`,
	);
	await prisma.$executeRawUnsafe(`SELECT setval('"Category_id_seq"', (SELECT COALESCE(MAX(id), 1) FROM "Category"))`);
	await prisma.$executeRawUnsafe(`SELECT setval('"Product_id_seq"', (SELECT COALESCE(MAX(id), 1) FROM "Product"))`);
	await prisma.$executeRawUnsafe(`SELECT setval('"Size_id_seq"', (SELECT COALESCE(MAX(id), 1) FROM "Size"))`);
	await prisma.$executeRawUnsafe(`SELECT setval('"Type_id_seq"', (SELECT COALESCE(MAX(id), 1) FROM "Type"))`);
	await prisma.$executeRawUnsafe(`SELECT setval('"Story_id_seq"', (SELECT COALESCE(MAX(id), 1) FROM "Story"))`);
	await prisma.$executeRawUnsafe(
		`SELECT setval('"StoryItem_id_seq"', (SELECT COALESCE(MAX(id), 1) FROM "StoryItem"))`,
	);

	console.log("✅ Сброс последовательностей выполнен");
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
