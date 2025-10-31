"use client";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import React, { JSX } from "react";
import { menuItems } from "../constants";

interface Props {
	className?: string;
	toggleMenu: (item: string) => void;
	activeSection: string;
}

export const MenuList: React.FC<Props> = ({ className, toggleMenu, activeSection }): JSX.Element => {
	return (
		<nav className={cn("flex flex-col gap-2", className)}>
			{menuItems.map((item) => (
				<Button
					key={item}
					variant="outline"
					className={cn(
						"capitalize text-lg font-bold",
						activeSection === item && "bg-brand-primary text-white",
					)}
					onClick={() => toggleMenu(item)}
				>
					{item}
				</Button>
			))}
		</nav>
	);
};
