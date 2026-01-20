/**
 * Фильтрует некритичные предупреждения Next.js, Google Maps и React DevTools
 * Используется только в development режиме
 */

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // ⚡ Сохраняем оригинальные методы ДО любых других скриптов
  const originalWarn = console.warn.bind(console);
  const originalError = console.error.bind(console);
  const originalLog = console.log.bind(console);

  // 🔇 Фильтрация предупреждений
  console.warn = function (...args: unknown[]) {
    // Преобразуем все аргументы в строку для проверки
    const message = args.map(arg => String(arg)).join(' ');

    const ignoreWarnings = [
      // Next.js Image warnings
      'Image with src',
      'has either width or height modified',

      // Google Maps deprecation warnings - все части сообщения
      'google.maps.places.Autocomplete',
      'PlaceAutocompleteElement',
      'not available to new customers',
      'is recommended over',
      'will continue to receive bug fixes',
      'At least 12 months notice',
      'developers.google.com/maps/legacy',
      'developers.google.com/maps/documentation/javascript/places-migration',
      'As of March 1st, 2025',

      // Font preload warnings (RU/EN)
      'уже загруженный по ссылке для предварительной загрузки',
      'was preloaded using link preload but not used',
      'не был использован в течение нескольких секунд',
      'Убедитесь, что все атрибуты тега',
      '_next/static/media',
      '.woff2',
    ];

    const shouldIgnore = ignoreWarnings.some(warning => message.includes(warning));

    if (shouldIgnore) {
      return; // Не показываем это предупреждение
    }

    // Все остальные предупреждения показываем
    originalWarn(...args);
  };

  // 🔇 Фильтрация ошибок source maps от React DevTools
  console.error = function (...args: unknown[]) {
    // Преобразуем все аргументы в строку для проверки
    const message = args
      .map(arg => {
        if (arg instanceof Error) {
          return arg.message + ' ' + (arg.stack || '');
        }
        return String(arg);
      })
      .join(' ');

    const ignoreErrors = [
      // React DevTools source maps
      'installHook.js.map',
      'react_devtools_backend',
      'react_devtools_backend_compact',

      // Source map errors (RU/EN)
      'Ошибка карты кода',
      'Error loading source map',
      'can\'t access property "sources"',
      'map is undefined',

      // 404 errors для source maps
      'request failed with status 404',
      'URL карты кода:',
      'Stack in the worker',
      'networkRequest@resource',

      // Anonymous code source maps
      '%3Canonymous%20code%3E',
      '<anonymous code>',
      'anonymous code',
    ];

    const shouldIgnore = ignoreErrors.some(error => message.includes(error));

    if (shouldIgnore) {
      return; // Не показываем эту ошибку
    }

    originalError(...args);
  };

  // 🔇 Фильтрация через console.log
  console.log = function (...args: unknown[]) {
    const message = args.map(arg => String(arg)).join(' ');

    const ignoreLogs = [
      'google.maps.places.Autocomplete',
      'PlaceAutocompleteElement',
      'installHook.js.map',
    ];

    const shouldIgnore = ignoreLogs.some(log => message.includes(log));

    if (shouldIgnore) {
      return;
    }

    originalLog(...args);
  };

  // 🚀 Перехватываем даже console.info (некоторые предупреждения могут идти туда)
  const originalInfo = console.info.bind(console);
  console.info = function (...args: unknown[]) {
    const message = args.map(arg => String(arg)).join(' ');

    const ignoreInfo = ['google.maps.places.Autocomplete', 'PlaceAutocompleteElement'];

    const shouldIgnore = ignoreInfo.some(info => message.includes(info));

    if (shouldIgnore) {
      return;
    }

    originalInfo(...args);
  };
}
