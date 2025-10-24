"use client";

import React, { useEffect, useRef } from "react";
import { useIntersection } from "react-use";

import { cn } from "@/lib/utils";
import { useCategoryStore } from "@/store/category";

import { ProductWithRelations } from "../../../@types/prisma";
import { ProductCard } from "./product-card";
import { Title } from "./title";

interface Props {
	title: string;

	items: ProductWithRelations[];
	categoryId: number;
	className?: string;
}

export const ProductsGroupList: React.FC<Props> = ({ title, items, categoryId, className }) => {
	//
	const HEADER_OFFSET = 100; // высота sticky-зоны (TopBar + отступы)

	const setActiveCategoryId = useCategoryStore((state) => state.setActiveId);

	const intersectionRef = useRef<HTMLDivElement>(null);

	// const intersection = useIntersection(intersectionRef as React.RefObject<HTMLElement>, {
	// 	threshold: 0.4,
	// });

	const intersection = useIntersection(intersectionRef as React.RefObject<HTMLElement>, {
		root: null,
		// сдвигаем окно наблюдения вниз на высоту шапки, и “сужаем” снизу, чтобы
		// предыдущая секция не считалась активной, когда новая почти у верха
		rootMargin: `-${HEADER_OFFSET}px 0px -60% 0px`,
		threshold: [0, 0.1, 0.25, 0.5],
	});

	useEffect(() => {
		if (intersection?.isIntersecting) {
			setActiveCategoryId(categoryId);
			// console.log("categoryId", categoryId);
		}
	}, [categoryId, intersection?.isIntersecting, title, setActiveCategoryId]);

	return (
		<div className={className} id={title} ref={intersectionRef} style={{ scrollMarginTop: "120px" }}>
			<Title text={title} size="lg" className="font-extrabold mb-5" />

			<div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4")}>
				{items
					.filter((product) => product.items.length > 0)
					.map((product, index) => {
						// console.log("ProductsGroupList", JSON.stringify(product, null));
						// Находим минимальную цену из всех вариантов
						// Находим item с минимальной ценой
						const minPriceItem = product.items.reduce((min, item) => (item.price < min.price ? item : min));
						return (
							<ProductCard
								key={product.id}
								id={product.id}
								name={product.name}
								imageUrl={product.imageUrl}
								price={minPriceItem.price}
								ingredients={product.ingredients}
								itemId={minPriceItem.id}
								// for lazy loading
								priority={index < 6}
							/>
						);
					})}
			</div>
		</div>
	);
};
