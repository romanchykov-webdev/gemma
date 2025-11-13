"use client";

import "@/lib/console-filter";
import { initDevTools, useCartStore } from "@/store";
import { Loader2 } from "lucide-react";
import { Session } from "next-auth";
import { SessionProvider, useSession } from "next-auth/react";
import NextTopLoader from "nextjs-toploader";
import React, { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { GoogleMapsProvider } from "./providers/google-maps-provider";

const AuthLoadingOverlay: React.FC = () => {
	const { status } = useSession();

	if (status !== "loading") return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm">
			<Loader2 className="text-yellow-500 animate-spin" size={50} />
		</div>
	);
};

interface ProvidersProps {
	children: React.ReactNode;
	session?: Session | null;
}

export const Providers: React.FC<ProvidersProps> = ({ children, session }) => {
	// ✅ Загружаем корзину ОДИН РАЗ при старте приложения
	useEffect(() => {
		useCartStore.getState().fetchCartItems();

		// 🔧 Инициализируем DevTools wrapper (только в development)
		initDevTools();
	}, []);

	return (
		<>
			<SessionProvider session={session} refetchInterval={0} refetchOnWindowFocus={false}>
				<GoogleMapsProvider>
					{children}
					<AuthLoadingOverlay />
				</GoogleMapsProvider>
			</SessionProvider>
			<Toaster />
			<NextTopLoader />
		</>
	);
};
