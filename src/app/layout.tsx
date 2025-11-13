import { Nunito } from "next/font/google";
import Script from "next/script";
import { ReactNode } from "react";

import { Providers } from "@/components/shared/providers";
import { authOptions } from "@/constants/auth-options";
import { SEO_CONFIG } from "@/constants/seo";
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import "./globals.css";

export const metadata: Metadata = {
	metadataBase: new URL(SEO_CONFIG.siteUrl),
	icons: { icon: "/logo.png" },
};

const nunito = Nunito({
	subsets: ["cyrillic"],
	variable: "--font-nunito",
	weight: ["400", "500", "600", "700", "800"],
	display: "swap",
	preload: true,
});

export default async function RootLayout({
	children,
}: Readonly<{
	children: ReactNode;
}>) {
	// ✅ Получаем сессию на сервере (0 запросов на клиенте!)
	const session = await getServerSession(authOptions);

	return (
		<html lang="it-IT" suppressHydrationWarning data-scroll-behavior="smooth">
			<head>
				{/* Временный фильтр консоли для проверки работы Google Maps API */}
				<Script
					id="console-filter"
					strategy="beforeInteractive"
					dangerouslySetInnerHTML={{
						__html: `
							if (typeof window !== "undefined" && "${process.env.NODE_ENV}" === "development") {
								const originalWarn = console.warn.bind(console);
								const originalError = console.error.bind(console);
								const originalLog = console.log.bind(console);
								const originalInfo = console.info.bind(console);

								console.warn = function(...args) {
									const message = args.map(arg => String(arg)).join(" ");
									const ignore = [
										"Image with src",
										"has either width or height modified",
										"google.maps.places.Autocomplete",
										"PlaceAutocompleteElement",
										"not available to new customers",
										"уже загруженный по ссылке",
										"was preloaded using link preload",
										"_next/static/media",
										".woff2"
									];
									if (ignore.some(w => message.includes(w))) return;
									originalWarn(...args);
								};

								console.error = function(...args) {
									const message = args.map(arg => {
										if (arg instanceof Error) return arg.message + " " + (arg.stack || "");
										return String(arg);
									}).join(" ");
									const ignore = [
										"installHook.js.map",
										"react_devtools_backend",
										"Ошибка карты кода",
										"Error loading source map",
										"can't access property",
										"request failed with status 404",
										"anonymous code"
									];
									if (ignore.some(e => message.includes(e))) return;
									originalError(...args);
								};

								console.log = function(...args) {
									const message = args.map(arg => String(arg)).join(" ");
									const ignore = ["google.maps.places.Autocomplete", "PlaceAutocompleteElement"];
									if (ignore.some(l => message.includes(l))) return;
									originalLog(...args);
								};

								console.info = function(...args) {
									const message = args.map(arg => String(arg)).join(" ");
									const ignore = ["google.maps.places.Autocomplete", "PlaceAutocompleteElement"];
									if (ignore.some(i => message.includes(i))) return;
									originalInfo(...args);
								};
							}
						`,
					}}
				/>
			</head>
			<body className={nunito.className}>
				<Providers session={session}>{children}</Providers>
			</body>
		</html>
	);
}
