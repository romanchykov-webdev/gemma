"use client";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import React, { JSX } from "react";
import * as CartItemDetails from "./cart-item-details";
import { CartItemProps } from "./cart-item-details/cart-item-details.types";
import { ClearButton } from "./clear-button";
import { CountButtonProps } from "./count-button";

interface Props extends CartItemProps {
	name: string;
	price: number;
	imageUrl: string;
	details: {
		base: string;
		added: string;
		removed: string;
	};
	quantity: number;
	loading?: boolean;
	className?: string;
	onClickRemove: () => void;
	onClickCountButton: CountButtonProps["onClick"];
}

export const CheckoutItemOrder: React.FC<Props> = ({
	name,
	price,
	imageUrl,
	details,
	quantity,
	loading,
	className,
	onClickRemove,
	onClickCountButton,
}): JSX.Element => {
	return (
		<div
			className={cn(
				"flex flex-col items-center justify-between lg:flex-row lg:justify-center lg:items-center shadow-md rounded-lg overflow-hidden min-h-[140px] p-5 relative ",
				className,
			)}
		>
			{loading && (
				<div
					className="absolute top-0 right-0 bg-gray-500 w-full h-full opacity-50 z-10 flex 
				items-center justify-center"
				>
					<Loader2 className="text-yellow-500 animate-spin" size={50} />
				</div>
			)}
			<div className="flex items-center gap-5 flex-1 lg:mr-10  w-full lg:w-auto ">
				<CartItemDetails.Image src={imageUrl} />
				<CartItemDetails.Info name={name} details={details} />
			</div>

			<div className="flex mt-10 lg:mt-0 lg:w-auto items-center gap-5 justify-between  w-full ">
				<CartItemDetails.Price value={price} />

				<div className="flex items-center  gap-3 ml-20">
					<CartItemDetails.CountButton onClick={onClickCountButton} value={quantity} />

					{/*  */}
					<ClearButton onClick={onClickRemove} className="relative  right-0 top-0 -translate-y-0" />
					{/* <button type="button" onClick={onClickRemove}>
						<Trash2Icon
							// onClick={onClickRemove}
							className="text-gray-400 cursor-pointer hover:text-red-600 flex-shrink-0"
							size={24}
						/>
					</button> */}
				</div>
			</div>
		</div>
	);
};
