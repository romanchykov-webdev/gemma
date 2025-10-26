import { Nunito } from "next/font/google";
import { ReactNode } from "react";

import { Providers } from "@/components/shared/providers";
import { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
	icons: { icon: "/logo.png" },
};

const nunito = Nunito({
	subsets: ["cyrillic"],
	variable: "--font-nunito",
	weight: ["400", "500", "600", "700", "800", "900"],
});

export default function RootLayout({
	children,
}: Readonly<{
	children: ReactNode;
}>) {
	return (
		<html lang="it-IT" suppressHydrationWarning>
			<body className={nunito.className}>
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
