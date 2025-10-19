"use client";

import { Loader2 } from "lucide-react";
import { SessionProvider, useSession } from "next-auth/react";
import NextTopLoader from "nextjs-toploader";
import React from "react";
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

export const Providers: React.FC<React.PropsWithChildren> = ({ children }) => {
	return (
		<>
			<SessionProvider>
				{children}
				<AuthLoadingOverlay />
			</SessionProvider>
			<Toaster />
			<NextTopLoader />
		</>
	);
};
