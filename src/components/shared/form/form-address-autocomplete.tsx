"use client";
import { Autocomplete } from "@react-google-maps/api";
import React, { useRef } from "react";
import { useFormContext } from "react-hook-form";
import { ClearButton } from "../clear-button";
import { ErrorText } from "../error-text";
import { useGoogleMaps } from "../providers/google-maps-provider";
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

	const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

	// ✅ Используем контекст для проверки загрузки API
	const { isLoaded, loadError } = useGoogleMaps();

	const errorText = errors?.[name]?.message as string;
	const text = watch(name);

	const handleClear = () => {
		setValue(name, "", { shouldValidate: true });
	};

	const handlePlaceChanged = () => {
		if (autocompleteRef.current) {
			const place = autocompleteRef.current.getPlace();
			if (place && place.formatted_address) {
				setValue(name, place.formatted_address, { shouldValidate: true });
				if (onPlaceSelect) {
					onPlaceSelect(place);
				}
			}
		}
	};

	// Показываем состояние загрузки
	if (!isLoaded) {
		return (
			<div className={className}>
				{label && (
					<p className="font-medium mb-2">
						{label} {required && <RequiredSymbol />}
					</p>
				)}
				<div className="h-13 w-full rounded-md border bg-gray-50 px-3 py-1 flex items-center text-gray-400">
					Загрузка карт...
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
				<ErrorText text="Не удалось загрузить Google Maps API" />
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
				<Autocomplete
					onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
					onPlaceChanged={handlePlaceChanged}
					options={{
						componentRestrictions: { country: "it" },
						types: ["address"],
						fields: ["address_components", "formatted_address", "geometry", "place_id"],
					}}
				>
					<input
						{...register(name)}
						placeholder={placeholder}
						className="h-13 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none md:text-sm
              focus-visible:border-brand-primary/20 focus-visible:ring-brand-primary/30 focus-visible:ring-[2px]"
						{...props}
					/>
				</Autocomplete>
				{Boolean(text) && <ClearButton onClick={handleClear} />}
			</div>

			{errorText && <ErrorText text={errorText} />}
		</div>
	);
};

export default FormAddressAutocomplete;
