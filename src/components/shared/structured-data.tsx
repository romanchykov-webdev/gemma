"use client";

import { SEO_CONFIG } from "@/constants/seo";
import Script from "next/script";

interface Product {
	id: number;
	name: string;
	imageUrl: string;
	ingredients: { name: string; price: number }[];
}

interface Category {
	id: number;
	name: string;
	products: Product[];
}

interface StructuredDataProps {
	products: Product[];
	categories: Category[];
}

export const StructuredData: React.FC<StructuredDataProps> = ({ products, categories }) => {
	// ✅ ItemList для всех продуктов (первые 50 для оптимизации)
	const itemListStructuredData = {
		"@context": "https://schema.org",
		"@type": "ItemList",
		name: "Menu Pizza Gemma",
		description: "Menu completo con pizza, colazione, antipasti, cocktail e bevande",
		url: `${SEO_CONFIG.siteUrl}/#menu`,
		itemListElement: products.slice(0, 50).map((product, index) => ({
			"@type": "ListItem",
			position: index + 1,
			item: {
				"@type": "Product",
				"@id": `${SEO_CONFIG.siteUrl}/product/${product.id}`,
				name: product.name,
				image: product.imageUrl.startsWith("http")
					? product.imageUrl
					: `${SEO_CONFIG.siteUrl}${product.imageUrl}`,
				description: `Pizza ${product.name} con: ${product.ingredients.map((i) => i.name).join(", ")}`,
				offers: {
					"@type": "Offer",
					availability: "https://schema.org/InStock",
					priceCurrency: "EUR",
					url: `${SEO_CONFIG.siteUrl}/product/${product.id}`,
					seller: {
						"@type": "Restaurant",
						name: SEO_CONFIG.company.name,
					},
				},
			},
		})),
	};

	// ✅ Расширенная информация о ресторане с меню
	const restaurantWithMenu = {
		...SEO_CONFIG.jsonLd.restaurant,
		menu: {
			"@type": "Menu",
			"@id": `${SEO_CONFIG.siteUrl}/#menu`,
			name: "Menu completo",
			description: "Pizza, Colazione, Antipasti, Cocktail e Bevande",
			hasMenuSection: categories.map((category) => ({
				"@type": "MenuSection",
				name: category.name,
				description: `Sezione ${category.name} del menu`,
				hasMenuItem: category.products.map((product) => ({
					"@type": "MenuItem",
					name: product.name,
					description: product.ingredients.map((i) => i.name).join(", "),
					image: product.imageUrl.startsWith("http")
						? product.imageUrl
						: `${SEO_CONFIG.siteUrl}${product.imageUrl}`,
					offers: {
						"@type": "Offer",
						priceCurrency: "EUR",
					},
				})),
			})),
		},
	};

	// ✅ Breadcrumb для навигации
	const breadcrumbStructuredData = {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: [
			{
				"@type": "ListItem",
				position: 1,
				name: "Home",
				item: SEO_CONFIG.siteUrl,
			},
			{
				"@type": "ListItem",
				position: 2,
				name: "Menu",
				item: `${SEO_CONFIG.siteUrl}/#menu`,
			},
		],
	};

	// ✅ WebSite с поиском
	const websiteStructuredData = {
		"@context": "https://schema.org",
		"@type": "WebSite",
		"@id": `${SEO_CONFIG.siteUrl}/#website`,
		name: SEO_CONFIG.siteName,
		url: SEO_CONFIG.siteUrl,
		description: SEO_CONFIG.home.description,
		publisher: {
			"@type": "Restaurant",
			name: SEO_CONFIG.company.name,
		},
		potentialAction: {
			"@type": "SearchAction",
			target: {
				"@type": "EntryPoint",
				urlTemplate: `${SEO_CONFIG.siteUrl}?query={search_term_string}`,
			},
			"query-input": "required name=search_term_string",
		},
	};

	// ✅ LocalBusiness для местного поиска
	const localBusinessStructuredData = {
		"@context": "https://schema.org",
		"@type": "LocalBusiness",
		"@id": `${SEO_CONFIG.siteUrl}/#localbusiness`,
		name: SEO_CONFIG.company.name,
		image: `${SEO_CONFIG.siteUrl}/logo.png`,
		telephone: SEO_CONFIG.company.phone,
		email: SEO_CONFIG.company.email,
		address: {
			"@type": "PostalAddress",
			streetAddress: SEO_CONFIG.company.address.streetAddress,
			addressLocality: SEO_CONFIG.company.address.city,
			addressRegion: SEO_CONFIG.company.address.region,
			postalCode: SEO_CONFIG.company.address.postalCode,
			addressCountry: SEO_CONFIG.company.address.country,
		},
		geo: {
			"@type": "GeoCoordinates",
			latitude: SEO_CONFIG.company.geo.latitude,
			longitude: SEO_CONFIG.company.geo.longitude,
		},
		url: SEO_CONFIG.siteUrl,
		priceRange: SEO_CONFIG.company.priceRange,
		servesCuisine: "Italiana",
		openingHoursSpecification: SEO_CONFIG.company.openingHoursSpecification,
	};

	return (
		<>
			<Script
				id="itemlist-ld"
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListStructuredData) }}
				strategy="afterInteractive"
			/>

			<Script
				id="restaurant-ld"
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantWithMenu) }}
				strategy="afterInteractive"
			/>

			<Script
				id="breadcrumb-ld"
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbStructuredData) }}
				strategy="afterInteractive"
			/>

			<Script
				id="website-ld"
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteStructuredData) }}
				strategy="afterInteractive"
			/>

			<Script
				id="localbusiness-ld"
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessStructuredData) }}
				strategy="afterInteractive"
			/>
		</>
	);
};
