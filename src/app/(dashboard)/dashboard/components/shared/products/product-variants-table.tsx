"use client";

import { Check } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Api } from "../../../../../../../services/api-client";
import { Product, ProductItem } from "../../../../../../../services/dashboaed/products";

interface Props {
	product: Product;
}

export const ProductVariantsTable: React.FC<Props> = ({ product }) => {
	const [sizes, setSizes] = useState<Array<{ id: number; name: string; value: number }>>([]);
	const [doughTypes, setDoughTypes] = useState<Array<{ id: number; name: string }>>([]);

	// Загрузка размеров и типов теста
	useEffect(() => {
		loadData();
	}, []);

	const loadData = async () => {
		try {
			const [sizesData, typesData] = await Promise.all([
				Api.product_sizes_dashboard.getProductSizes(),
				Api.dough_types_dashboard.getDoughTypes(),
			]);
			setSizes(sizesData.map((s) => ({ id: s.id, name: s.name, value: s.value })));
			setDoughTypes(typesData.map((d) => ({ id: d.id, name: d.name })));
		} catch (error) {
			console.error("Errore nel caricamento dei dati:", error);
		}
	};

	// Проверка наличия варианта
	const hasVariant = (sizeId: number, doughTypeId: number): ProductItem | undefined => {
		return product.items.find((item) => item.sizeId === sizeId && item.doughTypeId === doughTypeId);
	};

	if (sizes.length === 0 || doughTypes.length === 0) {
		return <div className="px-4 pb-4 pt-2">Caricamento...</div>;
	}

	return (
		<div className="px-4 pb-4 pt-2 bg-gray-50 border-t">
			<h4 className="text-sm font-semibold mb-3">Varianti disponibili:</h4>

			{/* Таблица размеров и типов теста */}
			<div className="overflow-x-auto">
				<table className="w-full text-sm">
					<thead>
						<tr className="border-b">
							<th className="text-left py-2 px-2">Dimensione</th>
							{doughTypes.map((type) => (
								<th key={type.id} className="text-center py-2 px-2">
									{type.name}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{sizes.map((size) => (
							<tr key={size.id} className="border-b last:border-0">
								<td className="py-2 px-2 font-medium">
									{size.name} - {size.value} cm
								</td>
								{doughTypes.map((type) => {
									const variant = hasVariant(size.id, type.id);
									return (
										<td key={type.id} className="text-center py-2 px-2">
											{variant ? (
												<div className="flex flex-col items-center">
													<div className="w-5 h-5 rounded bg-green-500 flex items-center justify-center">
														<Check className="w-3 h-3 text-white" />
													</div>
													<span className="text-xs text-gray-600 mt-1">
														{Number(variant.price).toFixed(2)} €
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
				{product.items.map((item) => {
					const size = sizes.find((s) => s.id === item.sizeId);
					const doughType = doughTypes.find((d) => d.id === item.doughTypeId);
					return (
						<div
							key={item.id}
							className="text-xs bg-white p-2 rounded border flex justify-between items-center"
						>
							<span>
								{size?.name} - {doughType?.name}
							</span>
							<span className="font-semibold">{Number(item.price).toFixed(2)} €</span>
						</div>
					);
				})}
			</div>
		</div>
	);
};
