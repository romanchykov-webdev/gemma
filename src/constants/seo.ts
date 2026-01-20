export const SEO_CONFIG = {
  // ✅ Основная информация о сайте
  siteName: 'Pizza Gemma',
  siteUrl: 'https://gemma-ten.vercel.app',
  locale: 'it_IT',
  language: 'it',

  // ✅ Информация о компании
  company: {
    name: 'Pizza Gemma',
    legalName: 'Pizzeria Gemma',
    description: 'Pizzeria italiana con consegna a domicilio a Torre di Mosto, Venezia',
    cuisine: 'Cucina italiana',
    priceRange: '€€',
    logo: '/logo.png',

    // Адрес
    address: {
      country: 'IT',
      countryName: 'Italia',
      region: 'Veneto',
      city: 'Torre di Mosto',
      province: 'VE', // Venezia
      postalCode: '30020',
      streetAddress: 'Viale Roma, 15',
      fullAddress: 'Viale Roma, 15, 30020 Torre di Mosto VE, Italia',
    },

    // Контакты
    phone: '+39 345 357 5021',
    phoneDisplay: '345 357 5021',
    email: 'gemma.test@gmail.com',

    // Координаты (Torre di Mosto)
    geo: {
      latitude: 45.6167,
      longitude: 12.7667,
    },

    // Часы работы
    openingHours: {
      monday: '18:00-22:00',
      tuesday: '18:00-22:00',
      wednesday: '18:00-22:00',
      thursday: 'Chiuso',
      friday: '18:00-22:00',
      saturday: '18:00-22:00',
      sunday: '18:00-22:00',
    },

    // Для Schema.org (формат ISO 8601)
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday'],
        opens: '18:00',
        closes: '22:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Thursday',
        opens: '00:00',
        closes: '00:00', // Закрыто
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Friday', 'Saturday', 'Sunday'],
        opens: '18:00',
        closes: '22:00',
      },
    ],
  },

  // ✅ Информация о доставке
  delivery: {
    available: true,
    minOrderAmount: null, // null = нет минимума
    deliveryCost: 'Gratis', // или укажите стоимость
    estimatedTime: '30-45 minuti',
    radius: '10 km', // примерный радиус
    areas: ['Torre di Mosto', 'San Donà di Piave', 'Eraclea'], // зоны доставки
  },

  // ✅ Главная страница
  home: {
    title: 'Pizza Gemma - Consegna Pizza a Domicilio | Torre di Mosto, Venezia',
    titleTemplate: '%s | Pizza Gemma',
    description:
      '🍕 Ordina pizza online da Pizza Gemma a Torre di Mosto! Consegna veloce a domicilio. Ingredienti freschi, ricette italiane autentiche. Aperto 18:00-22:00. Menu vario: Pizza, Colazione, Antipasti, Cocktail e Bevande.',
    keywords: [
      'pizza Torre di Mosto',
      'consegna pizza Venezia',
      'pizza a domicilio',
      'pizzeria Torre di Mosto',
      'Pizza Gemma',
      'ordina pizza online',
      'menu pizza',
      'pizza delivery Veneto',
      'ristorante italiano Torre di Mosto',
      'pizza San Donà di Piave',
    ],
  },

  // ✅ OG изображение
  defaultOgImage: {
    url: '/logo.png',
    width: 1200,
    height: 630,
    alt: 'Pizza Gemma - Consegna Pizza a Domicilio a Torre di Mosto',
  },

  // ✅ Социальные сети (добавьте ваши, если есть)
  social: {
    facebook: null, // Добавьте если есть
    instagram: null, // Добавьте если есть
    twitter: null,
    whatsapp: '+39 345 357 5021', // WhatsApp для заказов
  },

  // ✅ JSON-LD данные для ресторана
  jsonLd: {
    restaurant: {
      '@context': 'https://schema.org',
      '@type': 'Restaurant',
      '@id': 'https://gemma-ten.vercel.app/#restaurant',
      name: 'Pizza Gemma',
      image: 'https://gemma-ten.vercel.app/logo.png',
      description: 'Pizzeria italiana con consegna a domicilio a Torre di Mosto, Venezia',
      servesCuisine: 'Italiana',
      priceRange: '€€',
      telephone: '+39 345 357 5021',
      email: 'gamma.test@gmail.com',
      url: 'https://gemma-ten.vercel.app',
      hasMenu: 'https://gemma-ten.vercel.app/#menu',
      acceptsReservations: false,

      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Viale Roma, 15',
        addressLocality: 'Torre di Mosto',
        addressRegion: 'VE',
        postalCode: '30020',
        addressCountry: 'IT',
      },

      geo: {
        '@type': 'GeoCoordinates',
        latitude: 45.6167,
        longitude: 12.7667,
      },

      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday'],
          opens: '18:00',
          closes: '22:00',
        },
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Friday', 'Saturday', 'Sunday'],
          opens: '18:00',
          closes: '22:00',
        },
      ],
    },
  },
};

// ✅ Генерация описания с продуктами
export function generateProductsDescription(
  productNames: string[],
  ingredients: string[],
  totalCount: number,
): string {
  const productsText = productNames.slice(0, 12).join(', ');
  const ingredientsText = ingredients.slice(0, 20).join(', ');

  return `🍕 ${totalCount} tipi di pizza disponibili: ${productsText}. Ingredienti freschi: ${ingredientsText}. Consegna veloce a Torre di Mosto e dintorni! Ordina ora da Pizza Gemma.`;
}

// ✅ Генерация ключевых слов
export function generateKeywords(productNames: string[], ingredients: string[]): string[] {
  return [
    ...SEO_CONFIG.home.keywords,
    ...productNames.slice(0, 10).map(name => `pizza ${name}`),
    ...ingredients.slice(0, 12),
  ];
}

// ✅ Форматирование часов работы для отображения
export function getOpeningHoursText(): string {
  const { openingHours } = SEO_CONFIG.company;
  return `Lun-Mer: ${openingHours.monday} | Gio: Chiuso | Ven-Dom: ${openingHours.friday}`;
}

// ✅ Проверка, открыт ли ресторан сейчас
export function isOpenNow(): boolean {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const hour = now.getHours();
  const minute = now.getMinutes();
  const currentTime = hour * 60 + minute;

  // Четверг = закрыто
  if (day === 4) return false;

  // Остальные дни: 18:00-22:00
  const openTime = 18 * 60; // 18:00
  const closeTime = 22 * 60; // 22:00

  return currentTime >= openTime && currentTime < closeTime;
}
