import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import React, { ElementType, JSX } from "react";

interface ICheckoutItemDetailsProps {
	title?: string;
	value?: string;
	className?: string;
	priceClassName?: string;
	icon?: ElementType;
	loading?: boolean;
}

export const CheckoutItemDetails: React.FC<ICheckoutItemDetailsProps> = ({
	className,
	priceClassName,
	title,
	value,
	icon: Icon,
	loading,
}): JSX.Element => {
	return (
		<div className={cn("flex my-5 border-b border-dashed border-b-neutral-200", className, priceClassName)}>
			<div className=" flex flex-1 items-center justify-between">
				<div className="flex items-center gap-2">
					{Icon && <Icon className="text-neutral-500" size={20} />}
					<span className="text-lg text-neutral-500">{title} : </span>
				</div>

				<span className={cn("text-xl font-extrabold", priceClassName)}>
					{loading ? (
						<Loader2 className="text-yellow-500 animate-spin" size={20} />
					) : (
						<>
							{value}
							{"\u00A0"}€
						</>
					)}
				</span>
			</div>
		</div>
	);
};
