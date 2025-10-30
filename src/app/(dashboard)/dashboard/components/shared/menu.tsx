import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import React, { JSX } from "react";
import { MenuList } from "./menu-list";

interface Props {
	className?: string;
	children?: React.ReactNode;
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
}

export const Menu: React.FC<Props> = ({ className, children, isOpen, setIsOpen }): JSX.Element => {
	return (
		<div className={cn("", className)}>
			<Sheet open={isOpen} onOpenChange={setIsOpen}>
				<SheetTrigger asChild>{children}</SheetTrigger>
				<SheetContent
					side="left"
					className="flex flex-col justify-between pb-0 bg-white sm:max-w-md w-full pl-6 overflow-y-auto"
				>
					<SheetHeader>
						<SheetTitle></SheetTitle>
						<VisuallyHidden>
							<SheetDescription>Filter products by ingredients, sizes, and price</SheetDescription>
						</VisuallyHidden>
					</SheetHeader>

					<div className="flex-1 overflow-y-auto scrollbar pr-12 pb-6">
						<MenuList />
					</div>
				</SheetContent>
			</Sheet>
		</div>
	);
};
