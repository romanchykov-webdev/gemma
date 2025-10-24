"use client";
import { cn } from "@/lib/utils";

import { useCartStore } from "@/store";
import { ArrowRight, ShoppingCart } from "lucide-react";
import React from "react";
import { Button } from "../ui";
import { LazyCartDrawer } from "./lazy-cart-drawer";

interface Props {
	className?: string;
}

export const CartButton: React.FC<Props> = ({ className }) => {
	const totalAmount = useCartStore((state) => state.totalAmount);

	const loading = useCartStore((state) => state.loading);

	const items = useCartStore((state) => state.items);
	const itemsCount = items.length;

	return (
		<LazyCartDrawer>
			<Button loading={loading} className={cn("group relative min-w-[150px]", className)}>
				<b>{totalAmount} €</b>
				<span className="h-full w-[1px] bg-white/30 mx-3" />
				<div className="flex items-center gap-1 transition duration-300 group-hover:opacity-0">
					<ShoppingCart className="h-4 w-4 relative" strokeWidth={2} />
					<b>{itemsCount}</b>
				</div>
				<ArrowRight className="w-5 absolute right-5 transition duration-300 -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0" />
			</Button>
		</LazyCartDrawer>
	);
};
