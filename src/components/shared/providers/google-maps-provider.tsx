// src/components/shared/providers/google-maps-provider.tsx
'use client';
import Script from 'next/script';
import { createContext, ReactNode, useContext, useState } from 'react';

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
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<Error | undefined>(undefined);

  const handleScriptLoad = () => {
    // ✅ Проверяем что новый Places API загружен
    const checkNewPlacesLoaded = () => {
      if (window.google?.maps?.places?.AutocompleteSuggestion) {
        setIsLoaded(true);
      } else {
        // Ждём загрузки библиотеки
        setTimeout(checkNewPlacesLoaded, 100);
      }
    };

    if (window.google?.maps) {
      checkNewPlacesLoaded();
    } else {
      setLoadError(new Error('Google Maps API не загружен'));
    }
  };

  const handleScriptError = () => {
    setLoadError(new Error('Ошибка загрузки Google Maps API'));
  };

  return (
    <>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&language=it&loading=async`}
        strategy="lazyOnload"
        onLoad={handleScriptLoad}
        onError={handleScriptError}
      />
      <GoogleMapsContext.Provider value={{ isLoaded, loadError }}>
        {children}
      </GoogleMapsContext.Provider>
    </>
  );
};

// ✅ Хук для использования в компонентах
export const useGoogleMaps = () => {
  const context = useContext(GoogleMapsContext);
  if (!context) {
    throw new Error('useGoogleMaps должен использоваться внутри GoogleMapsProvider');
  }
  return context;
};
