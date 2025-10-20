import { cn } from "@/lib/utils";
import React from "react";

export type Variant = {
	name: string;
	value: string;
	disabled?: boolean;
};

interface Props {
	items: readonly Variant[];
	defaultValue?: string;
	onClick?: (value: Variant["value"]) => void;
	selectedValue?: Variant["value"];
	className?: string;
}

export const GroupVariants: React.FC<Props> = ({ items, className, onClick, selectedValue }) => {
	return (
		<div
			className={cn(
				className,
				"flex justify-between bg-surface-gray rounded-3xl p-1 select-none overflow-hidden",
			)}
		>
			{items.map((item) => (
				<button
					key={item.name}
					onClick={() => onClick?.(item.value)}
					className={cn(
						"flex items-center justify-center cursor-pointer h-[30px] px-5 flex-1 rounded-3xl transition-all duration-400 text-sm hover:text-brand-primary",
						{
							"bg-white shadow text-brand-primary": item.value === selectedValue,
							"text-gray-500 opacity-50 pointer-events-none  ": item.disabled,
						},
					)}
				>
					{item.name}
				</button>
			))}
		</div>
	);
};
