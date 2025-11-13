/**
 * Фильтрует некритичные предупреждения Next.js, Google Maps и React DevTools
 * Используется только в development режиме
 */

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
	const originalWarn = console.warn;
	const originalError = console.error;

	// 🔇 Фильтрация предупреждений
	console.warn = (...args: unknown[]) => {
		const message = args[0]?.toString() || "";

		const ignoreWarnings = [
			// Next.js Image warnings
			"Image with src",
			"has either width or height modified",

			// Google Maps deprecation warnings
			"google.maps.places.Autocomplete is not available to new customers",
			"PlaceAutocompleteElement is recommended",

			// Font preload warnings
			"уже загруженный по ссылке для предварительной загрузки",
			"was preloaded using link preload but not used",
		];

		const shouldIgnore = ignoreWarnings.some((warning) => message.includes(warning));

		if (shouldIgnore) {
			return; // Не показываем это предупреждение
		}

		// Все остальные предупреждения показываем
		originalWarn.apply(console, args);
	};

	// 🔇 Фильтрация ошибок source maps от React DevTools
	console.error = (...args: unknown[]) => {
		const message = args[0]?.toString() || "";

		const ignoreErrors = [
			"installHook.js.map", // React DevTools source map
			"react_devtools_backend", // React DevTools backend source map
			"Ошибка карты кода", // Source map errors in Russian
			"Error loading source map", // Source map errors in English
			"request failed with status 404", // 404 для source maps
		];

		const shouldIgnore = ignoreErrors.some((error) => message.includes(error));

		if (shouldIgnore) {
			return; // Не показываем эту ошибку
		}

		originalError.apply(console, args);
	};
}
