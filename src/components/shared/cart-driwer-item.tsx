import { cn } from "@/lib/utils";
import { Loader2, Trash2Icon } from "lucide-react";
import React, { JSX } from "react";
import * as CartItem from "./cart-item-details";
import { CartItemProps } from "./cart-item-details/cart-item-details.types";
import { CountButton } from "./count-button";

interface ICartDriwerItemProps extends CartItemProps {
	onClickCountButton?: (type: "plus" | "minus") => void;
	loading?: boolean;
	className?: string;
	onClickRemove?: () => void;
}

export const CartDriwerItem: React.FC<ICartDriwerItemProps> = ({
	imageUrl,
	name,
	price,
	quantity,
	details,
	onClickCountButton,
	loading,
	className,
	onClickRemove,
}): JSX.Element => {
	// console.log("CartDriwerItem details", details);

	return (
		<div
			className={cn(
				"flex bg-white p-5 gap-6 rounded-lg relative overflow-hidden min-h-[140px] flex-shrink-0",
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
			<CartItem.Image src={imageUrl} className="w-[60px] h-[60px] rounded-md flex-shrink-0" />

			<div className="flex-1 min-w-0">
				<CartItem.Info name={name} details={details} />

				<hr className="my-3" />

				<div className="flex items-center justify-between">
					<CountButton onClick={onClickCountButton} value={quantity} />

					<div className="flex items-center gap-3">
						<CartItem.Price value={price} />

						<Trash2Icon
							onClick={onClickRemove}
							className="text-gray-400 cursor-pointer hover:text-red-600 flex-shrink-0"
							size={24}
						/>
					</div>
				</div>
			</div>
		</div>
	);
};
