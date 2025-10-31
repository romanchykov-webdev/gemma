import { Prisma } from "@prisma/client";
import { hashSync } from "bcrypt";
import { _ingredients, categories, products } from "./constants";
import { prisma } from "./prisma-client";

const randomDecimalPrice = (min: number, max: number): number => {
	return Math.round((Math.random() * (max - min) + min) * 100) / 100;
};

const generateProductItem = ({
	productId,
	pizzaType,
	size,
}: {
	productId: number;
	pizzaType?: 1 | 2;
	size?: 20 | 30 | 40;
}) => {
	return {
		productId,
		price: randomDecimalPrice(1.99, 24.99),
		pizzaType,
		size,
	} as Prisma.ProductItemUncheckedCreateInput;
};

async function up() {
	// Создаем пользователей по отдельности, чтобы получить UUID
	const user1 = await prisma.user.create({
		data: {
			fullName: "User Test",
			email: "user@test.ru",
			password: hashSync("111111", 10),
			verified: new Date(),
			role: "USER",
		},
	});

	const user2 = await prisma.user.create({
		data: {
			fullName: "Admin Admin",
			email: "admin@test.ru",
			password: hashSync("111111", 10),
			verified: new Date(),
			role: "ADMIN",
		},
	});

	await prisma.category.createMany({
		data: categories,
	});

	await prisma.ingredient.createMany({
		data: _ingredients,
	});

	await prisma.product.createMany({
		data: products,
	});

	// Пиццы
	// Пепперони фреш
	const pizza1 = await prisma.product.create({
		data: {
			name: "Pepperoni fresh",
			imageUrl:
				"https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/pizza/Pepperoni_freshJPG.webp",
			categoryId: 1,
			ingredients: {
				connect: _ingredients.slice(0, 5),
			},
		},
	});

	// Сырная
	const pizza2 = await prisma.product.create({
		data: {
			name: "4 Formaggio",
			imageUrl: "https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/pizza/4_Formaggio.webp",
			categoryId: 1,
			ingredients: {
				connect: _ingredients.slice(5, 10),
			},
		},
	});

	// Чоризо фреш
	const pizza3 = await prisma.product.create({
		data: {
			name: "Chorizo ​​fresh",
			imageUrl:
				"https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/pizza/Chorizo%20__fresh.webp",
			categoryId: 1,
			ingredients: {
				connect: _ingredients.slice(10, 40),
			},
		},
	});

	// Маргарита
	const pizza4 = await prisma.product.create({
		data: {
			name: "Margherita",
			imageUrl: "https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/pizza/Margherita.webp",
			categoryId: 1,
			ingredients: {
				connect: _ingredients.slice(15, 20),
			},
		},
	});

	// Барбекю
	const pizza5 = await prisma.product.create({
		data: {
			name: "Barbecue",
			imageUrl: "https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/pizza/Barbecue.webp",
			categoryId: 1,
			ingredients: {
				connect: _ingredients.slice(2, 15),
			},
		},
	});

	// Гавайская
	const pizza6 = await prisma.product.create({
		data: {
			name: "Hawaiano",
			imageUrl: "https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/pizza/Hawaiano.webp",
			categoryId: 1,
			ingredients: {
				connect: _ingredients.slice(5, 12),
			},
		},
	});

	// Ветчина и грибы
	const pizza7 = await prisma.product.create({
		data: {
			name: "Prosciutto e funghi",
			imageUrl:
				"https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/pizza/Pepperoni_freshJPG.webp",
			categoryId: 1,
			ingredients: {
				connect: _ingredients.slice(1, 7),
			},
		},
	});

	// Мясная
	const pizza8 = await prisma.product.create({
		data: {
			name: "4 Carne",
			imageUrl: "https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/pizza/4_Carne.webp",
			categoryId: 1,
			ingredients: {
				connect: _ingredients.slice(10, 16),
			},
		},
	});

	// Четыре сыра
	const pizza9 = await prisma.product.create({
		data: {
			name: "6 Formaggi",
			imageUrl: "https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/pizza/6_Formaggi.webp",
			categoryId: 1,
			ingredients: {
				connect: _ingredients.slice(0, 7),
			},
		},
	});

	// Деревенская
	const pizza10 = await prisma.product.create({
		data: {
			name: "Villaggio",
			imageUrl: "https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/pizza/Villaggio.webp",
			categoryId: 1,
			ingredients: {
				connect: _ingredients.slice(7, 14),
			},
		},
	});

	await prisma.productItem.createMany({
		data: [
			// Пицца "Пепперони фреш"
			generateProductItem({ productId: pizza1.id, pizzaType: 1, size: 20 }),
			generateProductItem({ productId: pizza1.id, pizzaType: 2, size: 30 }),
			generateProductItem({ productId: pizza1.id, pizzaType: 2, size: 40 }),

			// Пицца "Сырная"
			generateProductItem({ productId: pizza2.id, pizzaType: 1, size: 20 }),
			generateProductItem({ productId: pizza2.id, pizzaType: 1, size: 30 }),
			generateProductItem({ productId: pizza2.id, pizzaType: 1, size: 40 }),
			generateProductItem({ productId: pizza2.id, pizzaType: 2, size: 20 }),
			generateProductItem({ productId: pizza2.id, pizzaType: 2, size: 30 }),
			generateProductItem({ productId: pizza2.id, pizzaType: 2, size: 40 }),

			// Пицца "Чоризо фреш"
			generateProductItem({ productId: pizza3.id, pizzaType: 1, size: 20 }),
			generateProductItem({ productId: pizza3.id, pizzaType: 2, size: 30 }),
			generateProductItem({ productId: pizza3.id, pizzaType: 2, size: 40 }),

			// Пицца "Маргарита"
			generateProductItem({ productId: pizza4.id, pizzaType: 1, size: 20 }),
			generateProductItem({ productId: pizza4.id, pizzaType: 2, size: 30 }),
			generateProductItem({ productId: pizza4.id, pizzaType: 2, size: 40 }),

			// Пицца "Барбекю"
			generateProductItem({ productId: pizza5.id, pizzaType: 1, size: 20 }),
			generateProductItem({ productId: pizza5.id, pizzaType: 2, size: 30 }),
			generateProductItem({ productId: pizza5.id, pizzaType: 2, size: 40 }),

			// Пицца "Гавайская"
			generateProductItem({ productId: pizza6.id, pizzaType: 1, size: 20 }),
			generateProductItem({ productId: pizza6.id, pizzaType: 2, size: 30 }),
			generateProductItem({ productId: pizza6.id, pizzaType: 2, size: 40 }),

			// Пицца "Ветчина и грибы"
			generateProductItem({ productId: pizza7.id, pizzaType: 1, size: 20 }),
			generateProductItem({ productId: pizza7.id, pizzaType: 2, size: 30 }),
			generateProductItem({ productId: pizza7.id, pizzaType: 2, size: 40 }),

			// Пицца "Мясная"
			generateProductItem({ productId: pizza8.id, pizzaType: 1, size: 20 }),
			generateProductItem({ productId: pizza8.id, pizzaType: 2, size: 30 }),
			generateProductItem({ productId: pizza8.id, pizzaType: 2, size: 40 }),

			// Пицца "Мясная"
			generateProductItem({ productId: pizza9.id, pizzaType: 1, size: 20 }),
			generateProductItem({ productId: pizza9.id, pizzaType: 2, size: 30 }),
			generateProductItem({ productId: pizza9.id, pizzaType: 2, size: 40 }),

			// Пицца "Деревенская"
			generateProductItem({ productId: pizza10.id, pizzaType: 1, size: 20 }),
			generateProductItem({ productId: pizza10.id, pizzaType: 2, size: 30 }),
			generateProductItem({ productId: pizza10.id, pizzaType: 2, size: 40 }),

			// Остальные продукты
			generateProductItem({ productId: 1 }),
			generateProductItem({ productId: 2 }),
			generateProductItem({ productId: 3 }),
			generateProductItem({ productId: 4 }),
			generateProductItem({ productId: 5 }),
			generateProductItem({ productId: 6 }),
			generateProductItem({ productId: 7 }),
			generateProductItem({ productId: 8 }),
			generateProductItem({ productId: 9 }),
			generateProductItem({ productId: 10 }),
			generateProductItem({ productId: 11 }),
			generateProductItem({ productId: 12 }),
			generateProductItem({ productId: 13 }),
			generateProductItem({ productId: 14 }),
			generateProductItem({ productId: 15 }),
			generateProductItem({ productId: 16 }),
			generateProductItem({ productId: 17 }),
		],
	});

	// Создаем корзины для пользователей
	const cart1 = await prisma.cart.create({
		data: {
			userId: user1.id,
			totalAmount: 650,
			tokenId: "11111",
		},
	});

	// Добавляем товар в корзину первого пользователя
	await prisma.cartItem.create({
		data: {
			productItemId: 1,
			cartId: cart1.id,
			quantity: 2,
			ingredients: {
				connect: [{ id: 1 }, { id: 2 }, { id: 3 }],
			},
		},
	});

	const cart2 = await prisma.cart.create({
		data: {
			userId: user2.id,
			totalAmount: 0,
			tokenId: "222222",
		},
	});
	// Добавляем товар в корзину второго пользователя (НОВОЕ!)
	await prisma.cartItem.create({
		data: {
			productItemId: 2,
			cartId: cart2.id,
			quantity: 1,
			ingredients: {
				connect: [{ id: 4 }, { id: 5 }],
			},
		},
	});

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

	await prisma.storyItem.createMany({
		data: [
			// Story 1
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
			// Story 2
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
			// Story 3
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
			// Story 4
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
			// Story 5
			{
				storyId: 5,
				sourceUrl:
					"https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/story/storyItem/4.webp",
			},
			{
				storyId: 5,
				sourceUrl:
					"https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/story/storyItem/4.webp",
			},
			// Story 6
			{
				storyId: 6,
				sourceUrl:
					"https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/story/storyItem/1.webp",
			},
			{
				storyId: 2,
				sourceUrl:
					"https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/story/storyItem/4.webp",
			},
		],
	});
}

async function down() {
	await prisma.$executeRaw`TRUNCATE TABLE "User" RESTART IDENTITY CASCADE`;
	await prisma.$executeRaw`TRUNCATE TABLE "Category" RESTART IDENTITY CASCADE`;
	await prisma.$executeRaw`TRUNCATE TABLE "Cart" RESTART IDENTITY CASCADE`;
	await prisma.$executeRaw`TRUNCATE TABLE "CartItem" RESTART IDENTITY CASCADE`;
	await prisma.$executeRaw`TRUNCATE TABLE "Ingredient" RESTART IDENTITY CASCADE`;
	await prisma.$executeRaw`TRUNCATE TABLE "Product" RESTART IDENTITY CASCADE`;
	await prisma.$executeRaw`TRUNCATE TABLE "ProductItem" RESTART IDENTITY CASCADE`;
	await prisma.$executeRaw`TRUNCATE TABLE "Story" RESTART IDENTITY CASCADE`;
	await prisma.$executeRaw`TRUNCATE TABLE "StoryItem" RESTART IDENTITY CASCADE`;
	await prisma.$executeRaw`TRUNCATE TABLE "Order" RESTART IDENTITY CASCADE`;
	await prisma.$executeRaw`TRUNCATE TABLE "VerificationCode" RESTART IDENTITY CASCADE`;
}

async function main() {
	try {
		await down();
		await up();
	} catch (e) {
		console.error(e);
	}
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});
