"use client";
import { Categories } from "@/components/shared/categories";
import { Container } from "@/components/shared/container";
import { cn } from "@/lib/utils";
import { Category } from "@prisma/client";
import React, { JSX } from "react";

interface ITopBarProps {
	className?: string;
	categories: Category[];
}

export const TopBar: React.FC<ITopBarProps> = ({ categories, className }): JSX.Element => {
	return (
		<div
			className={cn(
				"sticky top-0 py-5 bg-white shadow-lg shadow-black/5 z-10 overflow-x-auto scrollbar ",
				className,
			)}
		>
			<Container className="flex items-center justify-between ">
				<Categories items={categories} />
				<div className="flex items-center">{/* <SortPopup value="none" onChange={() => {}} /> */}</div>
			</Container>
		</div>
	);
};
