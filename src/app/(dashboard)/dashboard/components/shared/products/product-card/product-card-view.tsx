"use client";

import { Button } from "@/components/ui";
import { ChevronDown, ChevronUp, Loader2, Pencil, Trash2 } from "lucide-react";
import React from "react";
import { ProductImagePreview } from "../product-image-preview";
import { Category, Product } from "../product-types";
import { formatPrice, getCategoryName, getVariantsCount } from "../product-utils";

interface Props {
	product: Product;
	categories: Category[];
	isExpanded: boolean;
	onToggleExpand: () => void;
	onEdit: () => void;
	onDelete: () => void;
	isLoading?: boolean;
}

export const ProductCardView: React.FC<Props> = ({
	product,
	categories,
	isExpanded,
	onToggleExpand,
	onEdit,
	onDelete,
	isLoading,
}) => {
	const categoryName = getCategoryName(product.categoryId, categories);
	const variantsCount = getVariantsCount(product);
	const ingredientsCount = product.ingredients?.length || 0;

	return (
		<div className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition relative ">
			{isLoading && (
				<div className="absolute top-0 left-0 w-full h-full bg-gray-500 opacity-50 flex items-center justify-center">
					<Loader2 className="animate-spin" size={50} />
				</div>
			)}
			<div className="p-4">
				<div className="flex gap-4">
					<ProductImagePreview
						imageUrl={product.imageUrl}
						alt={product.name}
						className="w-24 h-24 rounded-md"
					/>

					<div className="flex-1 min-w-0">
						<h3 className="font-semibold text-lg mb-1">{product.name}</h3>
						<p className="text-sm text-gray-600 mb-2">
							<span className="font-medium">Categoria:</span> {categoryName}
						</p>
						<div className="flex gap-4 text-sm text-gray-600">
							<span>{variantsCount} varianti</span>
							{ingredientsCount > 0 && <span>{ingredientsCount} ingredienti</span>}
						</div>
					</div>

					<div className="flex flex-col gap-2">
						<Button size="sm" variant="outline" onClick={onEdit} className="text-blue-600 hover:bg-blue-50">
							<Pencil className="w-4 h-4 mr-1" />
							Modifica
						</Button>
						<Button size="sm" variant="outline" onClick={onDelete} className="text-red-600 hover:bg-red-50">
							<Trash2 className="w-4 h-4 mr-1" />
							Elimina
						</Button>
						<Button size="sm" variant="ghost" onClick={onToggleExpand}>
							{isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
						</Button>
					</div>
				</div>
			</div>

			{isExpanded && (
				<div className="border-t bg-gray-50 p-4">
					<h4 className="font-semibold mb-2">Varianti del prodotto:</h4>
					<div className="space-y-1 text-sm">
						{product.items.map((item, idx) => (
							<div key={item.id} className="flex justify-between">
								<span>Variante {idx + 1}</span>
								<span className="font-medium">{formatPrice(item.price)}</span>
							</div>
						))}
					</div>

					{ingredientsCount > 0 && (
						<>
							<h4 className="font-semibold mb-2 mt-4">Ingredienti:</h4>
							<div className="flex flex-wrap gap-2">
								{product.ingredients?.map((ing) => (
									<span key={ing.id} className="px-2 py-1 bg-white rounded-md text-xs border">
										{ing.name}
									</span>
								))}
							</div>
						</>
					)}
				</div>
			)}
		</div>
	);
};
