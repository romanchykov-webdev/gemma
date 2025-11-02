"use client";

import React, { useEffect, useState } from "react";
import { Api } from "../../../../../../../services/api-client";
import { Product } from "../../../../../../../services/dashboaed/products";

interface Props {
	product: Product;
}

export const ProductVariantsTable: React.FC<Props> = ({ product }) => {
	const [sizes, setSizes] = useState<Array<{ id: number; name: string; value: number }>>([]);
	const [doughTypes, setDoughTypes] = useState<Array<{ id: number; name: string }>>([]);

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

	// const hasVariant = (sizeId: number, doughTypeId: number): ProductItem | undefined => {
	// 	return product.items.find((item) => item.sizeId === sizeId && item.doughTypeId === doughTypeId);
	// };

	if (sizes.length === 0 || doughTypes.length === 0) {
		return <div className="px-4 pb-4 pt-2">Caricamento...</div>;
	}

	return (
		<div className="px-4 pb-4 pt-2 bg-gray-50 border-t">
			{/* <h4 className="text-sm font-semibold mb-3">Varianti disponibili:</h4> */}

			{/* Flex grid */}
			<div className="flex flex-col gap-2">
				{/* Заголовки теста */}
				{/* <div className="flex">
					<div className="w-32"></div>
					{doughTypes.map((type) => (
						<div
							key={type.id}
							className="flex-1 text-center font-medium text-sm px-2 py-1 border-b border-gray-300"
						>
							{type.name}
						</div>
					))}
				</div> */}

				{/* Размеры и варианты
				{sizes.map((size) => (
					<div key={size.id} className="flex items-center"> */}
				{/* Размер */}
				{/* <div className="w-32 px-2 py-1 font-medium border-b border-gray-300">
							{size.name} - {size.value} cm
						</div> */}

				{/* Варианты для этого размера */}
				{/* {doughTypes.map((type) => {
							const variant = hasVariant(size.id, type.id);
							return (
								<div
									key={type.id}
									className="flex-1 flex flex-col items-center justify-center border-b border-gray-300 py-1 px-2"
								>
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
								</div>
							);
						})}
					</div>
				))} */}
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
