import { revalidatePath } from 'next/cache';
import { prisma } from '../../prisma/prisma-client';

/**
 * 🔥 Инвалидирует все связанные страницы конкретного продукта
 * Используется при обновлении/удалении продукта
 */
export function revalidateProduct(productId: number) {
  revalidatePath(`/product/${productId}`); // Страница продукта
  revalidatePath(`/@modal/(.)product/${productId}`); // Модальное окно
  revalidatePath('/'); // Главная страница (список продуктов)
}

/**
 * 🔥 Инвалидирует весь сайт (тяжелая операция)
 * Используется при изменении глобальных справочников
 */
export function revalidateAll() {
  revalidatePath('/', 'layout'); // Инвалидирует весь layout и все дочерние страницы
}

/**
 * 🔥 Инвалидирует главную страницу и все продукты с указанным ингредиентом
 * Используется при обновлении/удалении ингредиента
 */
export async function revalidateIngredient(ingredientId: number) {
  try {
    // Находим все продукты, которые используют этот ингредиент
    const products = await prisma.product.findMany({
      where: {
        OR: [
          // В базовых ингредиентах (JSON поле)
          {
            baseIngredients: {
              path: '$[*].id',
              array_contains: ingredientId,
            },
          },
          // В добавляемых ингредиентах (массив)
          {
            addableIngredientIds: {
              has: ingredientId,
            },
          },
        ],
      },
      select: { id: true },
    });

    // Инвалидируем каждую страницу продукта
    products.forEach(product => {
      revalidateProduct(product.id);
    });

    // Инвалидируем главную страницу
    revalidatePath('/');

    console.log(`✅ [revalidateIngredient] Инвалидировано продуктов: ${products.length}`);
  } catch (error) {
    console.error('[revalidateIngredient] Error:', error);
    // В случае ошибки - инвалидируем всё
    revalidateAll();
  }
}

/**
 * 🔥 Инвалидирует главную страницу и все продукты в категории
 * Используется при обновлении/удалении категории
 */
export async function revalidateCategory(categoryId: number) {
  try {
    // Находим все продукты в этой категории
    const products = await prisma.product.findMany({
      where: { categoryId },
      select: { id: true },
    });

    // Инвалидируем каждую страницу продукта
    products.forEach(product => {
      revalidateProduct(product.id);
    });

    // Инвалидируем главную страницу
    revalidatePath('/');

    console.log(`✅ [revalidateCategory] Инвалидировано продуктов: ${products.length}`);
  } catch (error) {
    console.error('[revalidateCategory] Error:', error);
    revalidateAll();
  }
}

/**
 * 🔥 Инвалидирует все страницы, которые используют размеры/типы
 * Используется при обновлении/удалении Size или Type
 */
export async function revalidateProductVariants() {
  try {
    // Размеры и типы используются во ВСЕХ продуктах

    revalidateAll();

    console.log('✅ [revalidateProductVariants] Инвалидирован весь сайт');
  } catch (error) {
    console.error('[revalidateProductVariants] Error:', error);
    revalidateAll();
  }
}

/**
 * 🔥 Инвалидирует страницу stories и главную
 * Используется при обновлении/создании/удалении stories
 */
export function revalidateStories() {
  revalidatePath('/'); // Главная (где отображаются stories)
  console.log('✅ [revalidateStories] Инвалидирована главная страница');
}
