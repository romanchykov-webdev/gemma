import { cn } from "@/lib/utils";
import { ArrowRightIcon, PackageIcon, PercentIcon, TruckIcon } from "lucide-react";
import React, { JSX } from "react";
import { Button } from "../ui";
import { CheckoutItemDetails } from "./checkout-item-details";
import { WhiteBlock } from "./white-block";

interface ICheckoutSidebarProps {
	totalAmount: number;
	loading: boolean;
	className?: string;
	onSubmitCash: () => void;
}

export const CheckoutSidebar: React.FC<ICheckoutSidebarProps> = ({
	className,
	totalAmount,
	loading,
	onSubmitCash,
}): JSX.Element => {
	const VAT = 5;
	const DELIVERY_PRICE = 12;
	const allTotalPrice = (totalAmount + (totalAmount * VAT) / 100 + DELIVERY_PRICE).toFixed(2);

	return (
		<WhiteBlock className={cn("p-4 sticky top-4 ", className)}>
			{/* totle price block */}

			<CheckoutItemDetails loading={loading} title="Totale" value={allTotalPrice} priceClassName="text-[34px]" />

			{/* delivery price block */}
			<CheckoutItemDetails loading={loading} title="Costo" value={totalAmount.toFixed(2)} icon={PackageIcon} />
			<CheckoutItemDetails
				loading={loading}
				title="Imposte"
				value={((totalAmount * VAT) / 100).toFixed(2)}
				icon={PercentIcon}
			/>
			<CheckoutItemDetails
				loading={loading}
				title="Consegna"
				value={DELIVERY_PRICE.toFixed(2)}
				icon={TruckIcon}
			/>

			{/* <span className="text-xl cursor-pointer">У вас есть промокод?</span> */}

			{/* upload block */}
			<div className="flex flex-col gap-2">
				<Button loading={loading} type="submit" className="w-full h-14 rounded-2xl mt-6 text-base font-bold">
					Vai al pagamento
					<ArrowRightIcon className="w-5 ml-2" />
				</Button>

				{/* order without payment */}
				<Button
					loading={loading}
					type="button"
					onClick={onSubmitCash}
					className="w-full h-14 rounded-2xl mt-6 text-base font-bold"
				>
					Pagamento alla consegna
					<ArrowRightIcon className="w-5 ml-2" />
				</Button>
			</div>
		</WhiteBlock>
	);
};
