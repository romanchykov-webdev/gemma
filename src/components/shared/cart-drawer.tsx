"use client";

import React, { JSX, useState } from "react";

import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";

import { getCartItemDetails } from "@/lib";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui";
import { CartDriwerItem } from "./cart-driwer-item";

import { useCart } from "@/hooks";
import Image from "next/image";
import EmptyCartSvg from "../../../public/assets/basket-empty.svg";

export const CartDrawer: React.FC<React.PropsWithChildren> = ({ children }): JSX.Element => {
	//
	const { totalAmount, items, loading, removeCartItem, changeItemCount } = useCart();

	const [redirecting, setRedirecting] = useState(false);

	// console.log("CartDrawer items", items);
	const itemsCount = items.reduce((acc, item) => acc + item.quantity, 0);

	return (
		<Sheet>
			<SheetTrigger asChild>{children}</SheetTrigger>
			<SheetContent
				side="right"
				className="flex flex-col justify-between pb-0 bg-surface-beige sm:max-w-md w-full "
			>
				<SheetHeader>
					<SheetTitle>
						{items.length > 0 && (
							<span>
								Nel cestino
								<span className="font-bold">
									{/* {items.length}  */} {itemsCount} merce
								</span>
							</span>
						)}
					</SheetTitle>
					<VisuallyHidden>
						<SheetDescription>Your shopping cart items</SheetDescription>
					</VisuallyHidden>
				</SheetHeader>

				<div className="flex flex-1 h-full flex-col overflow-auto scrollbar gap-2 ">
					{/* <div className="flex flex-col overflow-auto scrollbar gap-2 max-h-[calc(100vh-200px)]"> */}
					{items.length > 0 ? (
						items.map((item) => (
							<CartDriwerItem
									key={item.id}
									loading={loading || redirecting}
									id={item.id}
									imageUrl={item.imageUrl}
									details={(() => {
										// console.log("🔍 [CartDrawer] item.removedIngredients:", item.removedIngredients);
										return getCartItemDetails(
											item.ingredients,
											item.sizeName,
											item.typeName,
											item.removedIngredients,
										);
									})()}
									name={item.name}
									price={item.price}
									quantity={item.quantity}
									// onClickCountButton={(type) => onClickCountButton(item.id, item.quantity, type)}
									onClickCountButton={(type) => changeItemCount(item.id, item.quantity, type)}
									onClickRemove={() => removeCartItem(item.id)}
								/>
						))
					) : (
						<div className="flex flex-1 flex-col p-4 items-center justify-center min-h-[300px]">
							<Image
								src={EmptyCartSvg}
								alt="Cestino vuoto"
								width={300}
								height={300}
								style={{ width: "auto", height: "auto" }}
							/>
							<p className="mt-4 text-gray-500 text-center mb-10">Il tuo cestino è vuoto</p>

							<SheetClose asChild>
								<Button className="w-full h-12 text-base">
									<ArrowLeft className="w-5 mr-5" />
									Indietro
								</Button>
							</SheetClose>
						</div>
					)}
				</div>

				{items.length > 0 && (
					<SheetFooter className="bg-white p-4 sm:p-8 mt-auto sticky bottom-0 left-0 right-0">
						<div className="w-full">
							<div className="flex mb-4">
								<span className="flex flex-1 text-lg text-neutral-500">
									Totale
									<div className="flex-1 border-b border-dashed border-b-neutral-200 relative -top-1 mx-2" />
								</span>

								<span className="font-bold text-lg flex items-center justify-center gap-2">
									{loading ? <Loader2 className="w-5 h-5 animate-spin" /> : totalAmount} €
								</span>
							</div>

							{/* <SheetClose asChild> */}
							<Link href="/checkout" className="flex items-center justify-center">
								<Button
									// asChild
									disabled={loading || redirecting}
									onClick={() => setRedirecting(true)}
									loading={loading || redirecting}
									className="w-full h-12 text-base"
								>
									Effettua un ordine <ArrowRight className="w-5 ml-2" />
								</Button>
							</Link>
							{/* </SheetClose> */}
						</div>
					</SheetFooter>
				)}
			</SheetContent>
		</Sheet>
	);
};
