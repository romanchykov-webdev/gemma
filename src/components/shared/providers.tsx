"use client";

import "@/lib/console-filter";
import { useCartStore } from "@/store";
import { Loader2 } from "lucide-react";
import { Session } from "next-auth";
import { SessionProvider, useSession } from "next-auth/react";
import NextTopLoader from "nextjs-toploader";
import React, { useEffect } from "react";
import { Toaster } from "react-hot-toast";

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
	session?: Session | null; // ✅ Сессия из SSR
}

export const Providers: React.FC<ProvidersProps> = ({ children, session }) => {
	// ✅ Загружаем корзину ОДИН РАЗ при старте приложения
	useEffect(() => {
		useCartStore.getState().fetchCartItems();
	}, []);

	return (
		<>
			<SessionProvider
				session={session} // ✅ Используем SSR сессию (0 запросов!)
				refetchInterval={0} // ✅ Не обновлять автоматически
				refetchOnWindowFocus={false} // ✅ Не обновлять при фокусе
			>
				{children}
				<AuthLoadingOverlay />
			</SessionProvider>
			<Toaster />
			<NextTopLoader />
		</>
	);
};
