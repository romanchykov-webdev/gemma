import { SEO_CONFIG } from "@/constants/seo";
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
	return {
		rules: [
			{
				userAgent: "*",
				allow: "/",
				disallow: ["/api/", "/checkout/", "/dashboard/", "/profile/"],
			},
			{
				userAgent: "Googlebot",
				allow: "/",
				disallow: ["/api/", "/dashboard/"],
			},
		],
		sitemap: `${SEO_CONFIG.siteUrl}/sitemap.xml`,
		host: SEO_CONFIG.siteUrl,
	};
}
