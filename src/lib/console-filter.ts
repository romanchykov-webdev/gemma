/**
 * Фильтрует некритичные предупреждения Next.js Image
 * Используется только в development режиме
 */

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
	const originalWarn = console.warn;

	console.warn = (...args: any[]) => {
		const message = args[0]?.toString() || "";

		// 🔇 Список предупреждений для игнорирования
		const ignoreWarnings = [
			"Image with src", // Next.js Image warnings
			"has either width or height modified", // Aspect ratio warnings
			// Добавьте сюда другие предупреждения для фильтрации:
			// 'React DevTools',
			// 'Download the React DevTools',
		];

		// Проверяем, содержит ли сообщение игнорируемые фразы
		const shouldIgnore = ignoreWarnings.some((warning) => message.includes(warning));

		if (shouldIgnore) {
			return; // Не показываем это предупреждение
		}

		// Все остальные предупреждения показываем
		originalWarn.apply(console, args);
	};
}
