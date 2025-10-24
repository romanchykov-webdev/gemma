// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	reactStrictMode: false,

	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "twjhdhfkcwoapajrkakp.supabase.co",
				pathname: "/storage/v1/object/public/**",
			},
		],
		// Форматы оптимизации
		formats: ["image/webp", "image/avif"],
	},
};

export default nextConfig;
