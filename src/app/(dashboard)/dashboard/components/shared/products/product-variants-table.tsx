"use client";

import { mapPizzaSize, mapPizzaTypes } from "@/constants/pizza";
import { Check } from "lucide-react";
import React from "react";

interface ProductItem {
	id: number;
	price: number;
	size: number | null;
	pizzaType: number | null;
}

interface Product {
	id: number;
	items: ProductItem[];
}

interface Props {
	product: Product;
}

export const ProductVariantsTable: React.FC<Props> = ({ product }) => {
	// Проверка наличия варианта
	const hasVariant = (size: number, pizzaType: number): ProductItem | undefined => {
		return product.items.find((item) => item.size === size && item.pizzaType === pizzaType);
	};

	return (
		<div className="px-4 pb-4 pt-2 bg-gray-50 border-t">
			<h4 className="text-sm font-semibold mb-3">Varianti disponibili:</h4>

			{/* Таблица размеров и типов теста */}
			<div className="overflow-x-auto">
				<table className="w-full text-sm">
					<thead>
						<tr className="border-b">
							<th className="text-left py-2 px-2">Dimensione</th>
							{Object.entries(mapPizzaTypes).map(([type, typeName]) => (
								<th key={type} className="text-center py-2 px-2">
									{typeName}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{Object.entries(mapPizzaSize).map(([size, sizeName]) => (
							<tr key={size} className="border-b last:border-0">
								<td className="py-2 px-2 font-medium">{sizeName}</td>
								{Object.keys(mapPizzaTypes).map((type) => {
									const variant = hasVariant(Number(size), Number(type));
									return (
										<td key={type} className="text-center py-2 px-2">
											{variant ? (
												<div className="flex flex-col items-center">
													<div className="w-5 h-5 rounded bg-green-500 flex items-center justify-center">
														<Check className="w-3 h-3 text-white" />
													</div>
													<span className="text-xs text-gray-600 mt-1">
														{variant.price} €
													</span>
												</div>
											) : (
												<div className="w-5 h-5 rounded bg-gray-200" />
											)}
										</td>
									);
								})}
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* Список всех вариантов */}
			<div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-2">
				{product.items.map((item) => (
					<div
						key={item.id}
						className="text-xs bg-white p-2 rounded border flex justify-between items-center"
					>
						<span>
							{item.size && mapPizzaSize[item.size as keyof typeof mapPizzaSize]} -{" "}
							{item.pizzaType && mapPizzaTypes[item.pizzaType as keyof typeof mapPizzaTypes]}
						</span>
						<span className="font-semibold">{item.price} €</span>
					</div>
				))}
			</div>
		</div>
	);
};
