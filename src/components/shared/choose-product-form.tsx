"use client";

import { cn } from "@/lib/utils";
import React from "react";
import { Button } from "../ui/button";
import { Title } from "./title";
// import { IProduct } from '@/hooks/use-choose-pizza';

// import { useCart } from '@/hooks/use-cart';

interface Props {
	imageUrl: string;
	name: string;
	price: number;
	loading: boolean;
	onSubmit?: VoidFunction;
	className?: string;
	// items?: IProduct['items'];
	// items?: any;
}

/**
 * Форма выбора продукта
 */

export const ChooseProductForm: React.FC<Props> = ({ name, imageUrl, onSubmit, className, price, loading }) => {
	return (
		<div className={cn(className, "flex flex-col justify-between lg:flex-row flex-1 max-h-[90vh] overflow-auto ")}>
			{/* Левая часть  */}
			<div className="w-full lg:w-[60%] h-auto min-h-[250px] sm:min-h-[300px] md:min-h-[400px] p-4 sm:p-6 flex flex-1 justify-center items-center">
				<img
					src={imageUrl}
					alt={name}
					className="w-full h-auto max-h-[250px] sm:max-h-[300px] md:max-h-[400px] object-contain"
				/>
			</div>

			{/* Правая часть - нижняя часть */}
			<div className="bg-surface-off-white p-4 lg:p-7 w-full lg:w-[40%] flex flex-col justify-between">
				<Title text={name} size="md" className="font-extrabold mb-1 text-center" />

				<Button
					onClick={() => onSubmit?.()}
					loading={loading}
					className="h-[55px] px-10 text-base rounded-[18px] w-full mt-5"
				>
					Aggiungi al carrello per {price} €
				</Button>
			</div>
		</div>
	);
};
