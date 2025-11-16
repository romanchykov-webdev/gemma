import { Nunito } from "next/font/google";
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
	const session = await getServerSession(authOptions);

	return (
		<html lang="it-IT" suppressHydrationWarning data-scroll-behavior="smooth">
			<head></head>
			<body className={nunito.className}>
				<Providers session={session}>{children}</Providers>
			</body>
		</html>
	);
}
