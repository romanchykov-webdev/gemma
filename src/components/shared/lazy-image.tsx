"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";

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
	const [isInView, setIsInView] = useState(priority);
	const [isLoaded, setIsLoaded] = useState(false);
	const imgRef = useRef<HTMLDivElement>(null);

	// useEffect(() => {
	// 	if (priority) return; // Если priority - грузим сразу

	// 	const observer = new IntersectionObserver(
	// 		(entries) => {
	// 			entries.forEach((entry) => {
	// 				if (entry.isIntersecting) {
	// 					setIsInView(true);
	// 					observer.disconnect();
	// 				}
	// 			});
	// 		},
	// 		{
	// 			rootMargin: "100px", // Начинаем загрузку за 200px до появления
	// 			threshold: 0.1,
	// 		},
	// 	);

	// 	if (imgRef.current) {
	// 		observer.observe(imgRef.current);
	// 	}

	// 	return () => observer.disconnect();
	// }, [priority]);

	//
	useEffect(() => {
		if (priority) return;

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						setIsInView(true);
						observer.disconnect();
					}
				});
			},
			{
				// ✅ Настоящая ленивая загрузка: только когда изображение РЕАЛЬНО в viewport
				rootMargin: "0px", // Загружать только когда изображение в viewport (без предзагрузки)
				threshold: 0.01, // Начинать загрузку когда видно хотя бы 1% изображения
			},
		);

		if (imgRef.current) {
			observer.observe(imgRef.current);
		}

		return () => observer.disconnect();
	}, [priority]);

	// 🔥 Определяем, использовать ли Next.js Image
	const useNextImage = isSupabaseUrl(src);

	return (
		<div ref={imgRef} className={cn("relative", className)} style={{ width, height }} onClick={onClick}>
			{!isInView ? (
				// Placeholder пока изображение не в viewport
				<div className="w-full h-full bg-gray-200 animate-pulse rounded-md" style={{ width, height }} />
			) : useNextImage ? (
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
