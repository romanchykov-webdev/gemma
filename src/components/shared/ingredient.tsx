import { cn } from "@/lib/utils";
import { CircleCheck } from "lucide-react";
import Image from "next/image";
import React, { JSX } from "react";

interface Props {
	imageUrl: string;
	name: string;
	price: number;
	active?: boolean;
	onClick?: () => void;
	className?: string;
}

export const Ingredient: React.FC<Props> = ({ imageUrl, name, price, active, onClick, className }): JSX.Element => {
	return (
		<div
			onClick={onClick}
			className={cn(
				"flex items-center flex-col p-1 rounded-md  text-center relative cursor-pointer shadow-md bg-white border border-transparent",
				{ "border border-brand-primary": active },
				className,
			)}
		>
			{active && <CircleCheck className="absolute top-2 right-2 text-brand-primary" />}
			{/* ✅ Ленивая загрузка для ингредиентов (часто вне viewport) */}
			<Image
				src={imageUrl}
				alt={name}
				width={110}
				height={110}
				loading="lazy"
				quality={75}
				className="object-contain"
			/>
			<span className="text-xs mb-1">{name}</span>
			<span className="font-bold">{price} €</span>
		</div>
	);
};
