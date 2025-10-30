import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import React, { JSX } from "react";
import { menuItems } from "../constants";

interface Props {
	className?: string;
}

export const MenuList: React.FC<Props> = ({ className }): JSX.Element => {
	return (
		<nav className={cn("flex flex-col gap-2", className)}>
			{menuItems.map((item) => (
				<Button key={item} variant="outline" className="capitalize text-lg font-bold">
					{item}
				</Button>
			))}
		</nav>
	);
};
