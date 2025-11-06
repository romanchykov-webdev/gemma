"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import React, { useState } from "react";

interface LazyImageProps {
	src: string;
	alt: string;
	width: number;
	height: number;
	className?: string;
	priority?: boolean;
	quality?: number;
	onClick?: () => void;
}

// 🔥 Функция проверки, является ли URL из Supabase
const isSupabaseUrl = (url: string): boolean => {
	return url.includes("supabase.co");
};

export const LazyImage: React.FC<LazyImageProps> = ({
	src,
	alt,
	width,
	height,
	className,
	priority = false,
	quality = 75,
	onClick,
}) => {
	const [isLoaded, setIsLoaded] = useState(false);

	// 🔥 Определяем, использовать ли Next.js Image
	const useNextImage = isSupabaseUrl(src);

	return (
		<div className={cn("relative", className)} style={{ width, height }} onClick={onClick}>
			{useNextImage ? (
				// 🔥 Next.js Image для Supabase (с оптимизацией)
				<Image
					src={src}
					alt={alt}
					width={width}
					height={height}
					className={cn("transition-opacity duration-300", isLoaded ? "opacity-100" : "opacity-0")}
					quality={quality}
					priority={priority}
					onLoad={() => setIsLoaded(true)}
				/>
			) : (
				// 🔥 Обычный img для внешних источников (Instagram, etc.)
				<img
					src={src}
					alt={alt}
					width={width}
					height={height}
					className={cn("transition-opacity duration-300", isLoaded ? "opacity-100" : "opacity-0")}
					onLoad={() => setIsLoaded(true)}
				/>
			)}
		</div>
	);
};
