import { SEO_CONFIG } from "@/constants/seo";
import { MetadataRoute } from "next";
import { prisma } from "../../prisma/prisma-client";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const baseUrl = SEO_CONFIG.siteUrl;

	// Главная страница
	const routes: MetadataRoute.Sitemap = [
		{
			url: baseUrl,
			lastModified: new Date(),
			changeFrequency: "daily",
			priority: 1.0,
		},
	];

	// Все страницы продуктов
	try {
		const products = await prisma.product.findMany({
			select: { id: true, updatedAt: true },
			orderBy: { updatedAt: "desc" },
		});

		const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
			url: `${baseUrl}/product/${product.id}`,
			lastModified: product.updatedAt,
			changeFrequency: "weekly",
			priority: 0.8,
		}));

		return [...routes, ...productRoutes];
	} catch (error) {
		console.error("[SITEMAP] Error fetching products:", error);
		return routes;
	}
}
