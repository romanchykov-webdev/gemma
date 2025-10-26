import { SEO_CONFIG, generateKeywords, generateProductsDescription } from "@/constants/seo";
import { findPizzas } from "@/lib";
import { Metadata } from "next";
import { cache } from "react";

// export async function generateMetadata(): Promise<Metadata> {
export const generateMetadata = cache(async (): Promise<Metadata> => {
	const categories = await findPizzas({});

	const allProducts = categories.flatMap((cat) => cat.products);
	const productNames = allProducts.map((p) => p.name);

	const allIngredients = new Set<string>();
	allProducts.forEach((product) => {
		product.ingredients.forEach((ing) => allIngredients.add(ing.name));
	});
	const ingredientsList = Array.from(allIngredients);

	const description = generateProductsDescription(productNames, ingredientsList, allProducts.length);

	const keywords = generateKeywords(productNames, ingredientsList);

	return {
		title: SEO_CONFIG.home.title,
		description,
		keywords,

		openGraph: {
			title: SEO_CONFIG.home.title,
			description,
			type: "website",
			locale: SEO_CONFIG.locale,
			url: SEO_CONFIG.siteUrl,
			siteName: SEO_CONFIG.siteName,
			images: [SEO_CONFIG.defaultOgImage],
		},

		twitter: {
			card: "summary_large_image",
			title: SEO_CONFIG.home.title,
			description,
			images: [SEO_CONFIG.defaultOgImage.url],
		},

		alternates: {
			canonical: SEO_CONFIG.siteUrl,
			languages: { "it-IT": SEO_CONFIG.siteUrl },
		},

		robots: {
			index: true,
			follow: true,
			googleBot: {
				index: true,
				follow: true,
				"max-image-preview": "large",
				"max-snippet": -1,
				"max-video-preview": -1,
			},
		},

		other: {
			"geo.region": "IT-VE",
			"geo.placename": "Torre di Mosto",
			"geo.position": `${SEO_CONFIG.company.geo.latitude};${SEO_CONFIG.company.geo.longitude}`,
			ICBM: `${SEO_CONFIG.company.geo.latitude}, ${SEO_CONFIG.company.geo.longitude}`,
		},
	};
});
