import { Skeleton } from "@/components/ui";
import { cn } from "@/lib/utils";
import React, { JSX } from "react";

interface Props {
	className?: string;
	countSizes?: number;
	countPizzaTypes?: number;
	countIngredients?: number;
}

export const SkeletonFollbackFilters: React.FC<Props> = ({
	className,
	countSizes = 1,
	countPizzaTypes = 1,
	countIngredients = 1,
}): JSX.Element => {
	return (
		<Skeleton className={cn("w-full h-full rounded-sm  bg-gray-200", className)}>
			{/*  */}
			<div className="flex flex-col">
				{/* title */}
				<Skeleton className="w-40 h-8 rounded-xl  bg-gray-300 mb-10" />

				{/* type pizza */}
				<div className="flex flex-col  gap-2 bg-gray-200 rounded-xl mb-7">
					<Skeleton className="w-20 h-8 rounded-xl  bg-gray-300 " />

					{Array.from({ length: countSizes }).map((_, index) => (
						<Skeleton key={index} className="w-40 h-8 rounded-xl  bg-gray-300 " />
					))}
				</div>

				{/* size pizza */}
				<div className="flex flex-col  gap-2 bg-gray-200 rounded-xl mb-6">
					<Skeleton className="w-20 h-8 rounded-xl  bg-gray-300 " />

					{Array.from({ length: countPizzaTypes }).map((_, index) => (
						<Skeleton key={index} className="w-40 h-8 rounded-xl  bg-gray-300 " />
					))}
				</div>

				{/* price */}
				<div className="flex flex-col  gap-2 bg-gray-200 rounded-xl mb-15">
					<Skeleton className="w-30 h-8 rounded-xl  bg-gray-300 " />

					<div className="flex items-center gap-2 justify-between">
						<Skeleton className="w-30 h-14 rounded-xl  bg-gray-300 " />
						<Skeleton className="w-30 h-14 rounded-xl  bg-gray-300 " />
					</div>
					{/* range slider */}
					<Skeleton className="w-full h-5 rounded-xl  bg-gray-300 " />
				</div>

				{/* ingredients */}
				<div className="flex flex-col  gap-2 bg-gray-200 rounded-xl">
					<Skeleton className="w-30 h-8 rounded-xl  bg-gray-300 " />

					{Array.from({ length: countIngredients }).map((_, index) => (
						<Skeleton key={index} className="w-40 h-8 rounded-xl  bg-gray-300 " />
					))}
				</div>
			</div>
		</Skeleton>
	);
};
