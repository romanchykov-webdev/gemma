import { cn } from "@/lib/utils";
import Image from "next/image";

import React, { JSX } from "react";

export type CSSVariables = React.CSSProperties & { ["--img"]?: string };
interface Props {
	imageUrl: string;
	className?: string;
	size: number;
}

export const ProductImage: React.FC<Props> = ({ imageUrl, className, size }): JSX.Element => {
	// const imgPct = size === 20 ? "60%" : size === 30 ? "70%" : "80%";
	const imgPct = size === 20 ? "60%" : size === 30 ? "70%" : "80%";
	const imgSize = size === 20 ? 215 : size === 30 ? 300 : 380;
	return (
		// <div

		// 	className={cn("relative aspect-square mx-auto", className)}
		// 	style={{ ["--img" as any]: imgPct }} // eslint-disable-line @typescript-eslint/no-explicit-any
		// >
		<div className={cn("relative aspect-square mx-auto", className)} style={{ ["--img"]: imgPct } as CSSVariables}>
			{/* <img
				src={imageUrl}
				alt="Пицца"
				className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 object-contain transition-all duration-500"
				style={{ width: "var(--img)", height: "var(--img)" }}
				loading="lazy"
				decoding="async"
			/> */}
			<Image
				src={imageUrl}
				alt="Пицца"
				width={imgSize}
				height={imgSize}
				className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 object-contain transition-all duration-500"
				style={{ width: "var(--img)", height: "var(--img)" }}
				priority={false} // В модалке не нужен priority
				quality={80}
				placeholder="blur"
				blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PC9zdmc+"
			/>

			{/* внешний круг */}
			{/* <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-gray-200 w-[88%] h-[88%]" /> */}

			{/* внутренний круг */}
			{/* <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dotted border-gray-100 w-[72%] h-[72%]" /> */}
		</div>
	);
};
