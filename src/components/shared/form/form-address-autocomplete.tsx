'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { ClearButton } from '../clear-button';
import { ErrorText } from '../error-text';
import { useGoogleMaps } from '../providers/google-maps-provider';
import { RequiredSymbol } from '../required-symbol';

interface ParsedSuggestion {
  placeId: string;
  fullText: string;
  mainText: string;
  secondaryText: string;
  original: google.maps.places.AutocompleteSuggestion;
}

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label?: string;
  required?: boolean;
  className?: string;
  placeholder?: string;
  onPlaceSelect?: (place: google.maps.places.PlaceResult) => void;
}

export const FormAddressAutocomplete: React.FC<Props> = ({
  className,
  name,
  label,
  required,
  placeholder = "Inserisci l'indirizzo ...",
  onPlaceSelect,
  ...props
}) => {
  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = useFormContext();

  const inputRef = useRef<HTMLInputElement>(null);
  const [suggestions, setSuggestions] = useState<ParsedSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const { isLoaded, loadError } = useGoogleMaps();

  const errorText = errors?.[name]?.message as string;
  const text = watch(name);

  const handleClear = () => {
    setValue(name, '', { shouldValidate: true });
    setSuggestions([]);
    setShowSuggestions(false);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  // ✅ Обработка ввода текста (НОВЫЙ API)
  const handleInputChange = useCallback(async (value: string) => {
    if (!value || value.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      const request = {
        input: value,
        includedRegionCodes: ['it'],
      };

      const { suggestions: results } =
        await google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions(request);

      if (results && results.length > 0) {
        // Преобразуем в читаемый формат с проверкой на null
        const parsedSuggestions: ParsedSuggestion[] = results
          .filter(suggestion => suggestion.placePrediction !== null)
          .map(suggestion => {
            const pp = suggestion.placePrediction!; // Non-null assertion после фильтра

            // Получаем текст через метод toString()
            const fullText = pp.text?.toString() || '';

            return {
              placeId: pp.placeId || '',
              fullText: fullText,
              mainText: fullText.split(',')[0] || fullText, // Первая часть до запятой
              secondaryText: fullText.split(',').slice(1).join(',').trim() || '', // Остальное
              original: suggestion,
            };
          });

        setSuggestions(parsedSuggestions);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Ошибка получения предложений:', error);
      }
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, []);

  // ✅ Обработка выбора места (НОВЫЙ API)
  const handleSelectSuggestion = useCallback(
    async (suggestion: google.maps.places.AutocompleteSuggestion) => {
      if (!suggestion.placePrediction) return;

      try {
        const placeId = suggestion.placePrediction.placeId;
        if (!placeId) return;

        const place = new google.maps.places.Place({ id: placeId });

        await place.fetchFields({
          fields: ['displayName', 'formattedAddress', 'location', 'addressComponents'],
        });

        const formattedAddress =
          place.formattedAddress || suggestion.placePrediction.text?.toString() || '';

        setValue(name, formattedAddress, { shouldValidate: true });

        if (onPlaceSelect) {
          const placeResult: google.maps.places.PlaceResult = {
            formatted_address: formattedAddress,
            place_id: placeId,
            geometry: place.location ? { location: place.location } : undefined,
            address_components: place.addressComponents?.map(component => ({
              long_name: component.longText || '',
              short_name: component.shortText || '',
              types: component.types || [],
            })),
          };
          onPlaceSelect(placeResult);
        }

        setShowSuggestions(false);
        setSuggestions([]);
      } catch (error) {
        console.error('Ошибка получения деталей места:', error);
      }
    },
    [name, onPlaceSelect, setValue],
  );

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  if (!isLoaded) {
    return (
      <div className={className}>
        {label && (
          <p className="font-medium mb-2">
            {label} {required && <RequiredSymbol />}
          </p>
        )}
        <div className="h-13 w-full rounded-md border bg-gray-50 px-3 py-1 flex items-center text-gray-400">
          Caricamento mappe...
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className={className}>
        {label && (
          <p className="font-medium mb-2">
            {label} {required && <RequiredSymbol />}
          </p>
        )}
        <ErrorText text="Impossibile caricare Google Maps API" />
      </div>
    );
  }

  return (
    <div className={className}>
      {label && (
        <p className="font-medium mb-2">
          {label} {required && <RequiredSymbol />}
        </p>
      )}

      <div className="relative">
        <input
          {...register(name)}
          ref={e => {
            register(name).ref(e);
            inputRef.current = e;
          }}
          placeholder={placeholder}
          className="h-13 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none md:text-sm
              focus-visible:border-brand-primary/20 focus-visible:ring-brand-primary/30 focus-visible:ring-[2px]"
          onChange={e => handleInputChange(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          autoComplete="off"
          {...props}
        />

        {Boolean(text) && <ClearButton onClick={handleClear} />}

        {/* Список предложений */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {suggestions.map((suggestion, index) => {
              return (
                <button
                  key={suggestion.placeId || index}
                  type="button"
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none transition-colors"
                  onClick={() => handleSelectSuggestion(suggestion.original)}
                >
                  <div className="text-sm font-medium text-gray-900">{suggestion.mainText}</div>
                  {suggestion.secondaryText && (
                    <div className="text-xs text-gray-500">{suggestion.secondaryText}</div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {errorText && <ErrorText text={errorText} />}
    </div>
  );
};

export default FormAddressAutocomplete;
