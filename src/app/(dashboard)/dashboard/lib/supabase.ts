import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
	throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Загрузка изображения в Supabase Storage
 *
 * @param file - Файл для загрузки (File объект)
 * @param folder - Папка для хранения (например: 'ingredients', 'pizza', 'products/Bevande')
 * @param bucketName - Название bucket (по умолчанию 'gemma')
 * @returns URL загруженного файла или null при ошибке
 *
 * @example
 * const file = input.files[0];
 * const url = await uploadImage(file, 'ingredients');
 * if (url) console.log('Изображение загружено:', url);
 */
export async function uploadImage(file: File, folder: string, bucketName: string = "gemma"): Promise<string | null> {
	try {
		// Валидация файла
		if (!file) {
			console.error("[UPLOAD_IMAGE] Файл не предоставлен");
			return null;
		}

		// Проверка типа файла
		const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
		if (!allowedTypes.includes(file.type)) {
			console.error("[UPLOAD_IMAGE] Неподдерживаемый тип файла:", file.type);
			return null;
		}

		// Проверка размера файла (макс 5MB)
		const maxSize = 5 * 1024 * 1024; // 5MB
		if (file.size > maxSize) {
			console.error("[UPLOAD_IMAGE] Файл слишком большой:", file.size);
			return null;
		}

		// Генерация уникального имени файла
		const timestamp = Date.now();
		const randomString = Math.random().toString(36).substring(2, 15);
		const fileExtension = file.name.split(".").pop();
		const fileName = `${timestamp}_${randomString}.${fileExtension}`;

		// Формирование пути: folder/fileName
		const filePath = `${folder}/${fileName}`;

		// Загрузка файла в Supabase Storage
		const { error } = await supabase.storage.from(bucketName).upload(filePath, file, {
			cacheControl: "3600",
			upsert: false,
		});

		if (error) {
			console.error("[UPLOAD_IMAGE] Ошибка загрузки:", error);
			return null;
		}

		// Получение публичного URL
		const {
			data: { publicUrl },
		} = supabase.storage.from(bucketName).getPublicUrl(filePath);

		console.log("[UPLOAD_IMAGE] Успешно загружено:", publicUrl);
		return publicUrl;
	} catch (error) {
		console.error("[UPLOAD_IMAGE] Неожиданная ошибка:", error);
		return null;
	}
}

/**
 * Удаление изображения из Supabase Storage
 *
 * @param imageUrl - Полный URL изображения
 * @param bucketName - Название bucket (по умолчанию 'gemma')
 * @returns true если удаление успешно, иначе false
 *
 * @example
 * const deleted = await deleteImage('https://...supabase.co/storage/v1/object/public/images/ingredients/123.jpg');
 */
export async function deleteImage(imageUrl: string, bucketName: string = "gemma"): Promise<boolean> {
	try {
		// Извлечение пути из URL
		// Пример URL: https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/products/Caffe_Latte2.webp
		const urlParts = imageUrl.split("/storage/v1/object/public/" + bucketName + "/");
		if (urlParts.length !== 2) {
			console.error("[DELETE_IMAGE] Неверный формат URL:", imageUrl);
			return false;
		}

		const filePath = urlParts[1];

		// Удаление файла
		const { error } = await supabase.storage.from(bucketName).remove([filePath]);

		if (error) {
			console.error("[DELETE_IMAGE] Ошибка удаления:", error);
			return false;
		}

		console.log("[DELETE_IMAGE] Успешно удалено:", filePath);
		return true;
	} catch (error) {
		console.error("[DELETE_IMAGE] Неожиданная ошибка:", error);
		return false;
	}
}

/**
 * Обновление изображения (удаление старого + загрузка нового)
 *
 * @param newFile - Новый файл для загрузки
 * @param oldImageUrl - URL старого изображения (для удаления)
 * @param folder - Папка для хранения
 * @param bucketName - Название bucket (по умолчанию 'images')
 * @returns URL нового изображения или null при ошибке
 */
export async function updateImage(
	newFile: File,
	oldImageUrl: string | null,
	folder: string,
	bucketName: string = "gemma",
): Promise<string | null> {
	try {
		// Загрузка нового изображения
		const newUrl = await uploadImage(newFile, folder, bucketName);

		if (!newUrl) {
			return null;
		}

		// Удаление старого изображения (если есть)
		if (oldImageUrl) {
			await deleteImage(oldImageUrl, bucketName);
		}

		return newUrl;
	} catch (error) {
		console.error("[UPDATE_IMAGE] Ошибка обновления:", error);
		return null;
	}
}
