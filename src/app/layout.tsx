import { Nunito } from "next/font/google";
import { ReactNode } from "react";

import { Providers } from "@/components/shared/providers";
import { authOptions } from "@/constants/auth-options";
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import "./globals.css";

export const metadata: Metadata = {
	icons: { icon: "/logo.png" },
};

const nunito = Nunito({
	subsets: ["cyrillic"],
	variable: "--font-nunito",
	weight: ["400", "500", "600", "700", "800", "900"],
});

export default async function RootLayout({
	children,
}: Readonly<{
	children: ReactNode;
}>) {
	// ✅ Получаем сессию на сервере (0 запросов на клиенте!)
	const session = await getServerSession(authOptions);

	return (
		<html lang="it-IT" suppressHydrationWarning>
			<body className={nunito.className}>
				<Providers session={session}>{children}</Providers>
			</body>
		</html>
	);
}
