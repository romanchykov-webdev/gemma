import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import { Plus } from "lucide-react";
import Link from "next/link";
import React from "react";
import { toast } from "react-hot-toast";
import { BaseIngredient } from "../../../@types/prisma";
import { Button } from "../ui";
import { LazyImage } from "./lazy-image";
import { Title } from "./title";

interface Props {
	id: number;
	name: string;
	price: number;
	imageUrl: string;
	ingredients: Array<{ id: number; name: string; price: number }>;
	baseIngredients: BaseIngredient[];
	className?: string;

	itemId: number;
	priority?: boolean;
}

export const ProductCard: React.FC<Props> = ({
	id,
	name,
	price,
	imageUrl,
	ingredients,
	baseIngredients,
	className,
	itemId,
	priority = false,
}) => {
	//

	const addCartItem = useCartStore((state) => state.addCartItem);

	// Быстрое добавление в корзину
	const handleAddToCart = () => {
		// ⚠️ ПРОБЛЕМА: В ProductCard нет информации о variantId
		// Нужно либо передавать variantId в пропсы, либо использовать первый вариант
		// ВРЕМЕННОЕ РЕШЕНИЕ: используем itemId как variantId и id как productId
		addCartItem({
			productId: id, // ✅ ID продукта
			variantId: itemId, // ✅ variantId (предполагаем что itemId = variantId)
			ingredients: [],
			baseIngredientsSnapshot: baseIngredients,
			optimistic: {
				name,
				imageUrl,
				price,
				size: null,
				type: null,
				ingredientsData: [],
			},
		});

		toast.success(name + " aggiunto al carrello");
	};
	//
	return (
		<div className={cn("group flex flex-col h-full", className)}>
			<Link href={`/product/${id}`} className="flex flex-col flex-1 h-full justify-between">
				<div className="flex justify-center p-6 bg-secondary rounded-lg h-[260px] group-hover:shadow-md transition-all duration-300 ">
					<LazyImage
						src={imageUrl}
						alt={name}
						width={215}
						height={215}
						className="transition-transform duration-300 group-hover:scale-101"
						priority={priority}
						quality={75}
					/>
				</div>
				<div className="flex flex-col flex-1 justify-between">
					<div>
						<Title text={name} size="sm" className="mb-1 mt-3 font-bold" />
						<p className="text-sm text-gray-400">
							{ingredients.map((ingredient) => ingredient.name).join(", ")}
						</p>
					</div>
				</div>
			</Link>
			<div className="flex justify-between items-center mt-4">
				<span className="text-[20px]">
					от <b>{price} €</b>
				</span>

				<Button
					onClick={handleAddToCart}
					variant="secondary"
					className="text-base font-bold hover:bg-yellow-500 hover:shadow-md transition-all duration-300"
				>
					<Plus size={20} className="mr-1" />
					Aggiungere
				</Button>
			</div>
		</div>
	);
};
