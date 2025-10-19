"use client";
import Script from "next/script";
import React, { useEffect, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { ClearButton } from "../clear-button";
import { ErrorText } from "../error-text";
import { RequiredSymbol } from "../required-symbol";

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
	placeholder = "Введите адрес ...",
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
	const [mapsLoaded, setMapsLoaded] = useState(false);
	const [loadError, setLoadError] = useState<string | null>(null);

	const errorText = errors?.[name]?.message as string;
	const text = watch(name);

	const handleClear = () => {
		setValue(name, "", { shouldValidate: true });
	};

	// Инициализация автозаполнения после загрузки скрипта Google Maps
	useEffect(() => {
		if (!mapsLoaded || !inputRef.current) return;

		try {
			const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
				componentRestrictions: { country: "it" },
				types: ["address"],
				fields: ["address_components", "formatted_address", "geometry", "place_id"],
			});

			const listener = autocomplete.addListener("place_changed", () => {
				const place = autocomplete.getPlace();
				if (place && place.formatted_address) {
					setValue(name, place.formatted_address, { shouldValidate: true });
					if (onPlaceSelect) {
						onPlaceSelect(place);
					}
				}
			});

			return () => {
				if (listener) {
					window.google.maps.event.removeListener(listener);
				}
			};
		} catch (error) {
			console.error("Ошибка при инициализации автозаполнения:", error);
			setLoadError("Не удалось инициализировать автозаполнение адреса");
		}
	}, [mapsLoaded, name, onPlaceSelect, setValue]);

	return (
		<>
			<Script
				src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&language=ru`}
				onLoad={() => setMapsLoaded(true)}
				onError={() => setLoadError("Не удалось загрузить Google Maps API")}
			/>

			<div className={className}>
				{label && (
					<p className="font-medium mb-2">
						{label} {required && <RequiredSymbol />}
					</p>
				)}

				<div className="relative">
					<input
						{...register(name)}
						ref={(e) => {
							register(name).ref(e);
							inputRef.current = e;
						}}
						placeholder={placeholder}
						className="h-13 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none md:text-sm
              focus-visible:border-brand-primary/20 focus-visible:ring-brand-primary/30 focus-visible:ring-[2px]"
						{...props}
					/>
					{Boolean(text) && <ClearButton onClick={handleClear} />}
				</div>

				{errorText && <ErrorText text={errorText} />}
				{loadError && <ErrorText text={loadError} />}
			</div>
		</>
	);
};

export default FormAddressAutocomplete;
