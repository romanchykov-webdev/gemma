// src/components/shared/providers/google-maps-provider.tsx
"use client";
import { useLoadScript } from "@react-google-maps/api";
import { createContext, ReactNode, useContext } from "react";

const libraries: "places"[] = ["places"];

interface GoogleMapsContextType {
	isLoaded: boolean;
	loadError: Error | undefined;
}

const GoogleMapsContext = createContext<GoogleMapsContextType>({
	isLoaded: false,
	loadError: undefined,
});

interface GoogleMapsProviderProps {
	children: ReactNode;
}

export const GoogleMapsProvider: React.FC<GoogleMapsProviderProps> = ({ children }) => {
	const { isLoaded, loadError } = useLoadScript({
		googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
		libraries,
		language: "ru",
	});

	return <GoogleMapsContext.Provider value={{ isLoaded, loadError }}>{children}</GoogleMapsContext.Provider>;
};

// ✅ Хук для использования в компонентах
export const useGoogleMaps = () => {
	const context = useContext(GoogleMapsContext);
	if (!context) {
		throw new Error("useGoogleMaps должен использоваться внутри GoogleMapsProvider");
	}
	return context;
};
