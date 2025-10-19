import { cn } from "@/lib/utils";
import { Ingredient } from "@prisma/client";
import { Plus } from "lucide-react";
import Link from "next/link";
import React from "react";
import { Button } from "../ui";
import { Title } from "./title";

// import { Ingredient } from '@prisma/client';

interface Props {
	id: number;
	name: string;
	price: number;
	imageUrl: string;
	ingredients: Ingredient[];
	className?: string;
}

export const ProductCard: React.FC<Props> = ({ id, name, price, imageUrl, ingredients, className }) => {
	//
	return (
		<div className={cn("flex flex-col h-full", className)}>
			<Link href={`/product/${id}`} className="flex flex-col flex-1 h-full justify-between">
				<div className="flex justify-center p-6 bg-secondary rounded-lg h-[260px] hover:shadow-md transition-all duration-300 ">
					<img className="w-[215px] h-[215px]" src={imageUrl} alt={name + " loading"} />
				</div>
				<div className="flex flex-col flex-1 justify-between">
					<div>
						<Title text={name} size="sm" className="mb-1 mt-3 font-bold" />
						<p className="text-sm text-gray-400">
							{ingredients.map((ingredient) => ingredient.name).join(", ")}
						</p>
					</div>

					<div className="flex justify-between items-center mt-4">
						<span className="text-[20px]">
							от <b>{price} €</b>
						</span>

						<Button
							variant="secondary"
							className="text-base font-bold hover:bg-yellow-500 hover:shadow-md transition-all duration-300"
						>
							<Plus size={20} className="mr-1" />
							Добавить
						</Button>
					</div>
				</div>
			</Link>
		</div>
	);
};
