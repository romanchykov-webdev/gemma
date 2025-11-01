"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Api } from "../../../../../../services/api-client";
import { ProductCard } from "./products/product-card";
import { ProductCategoryFilter } from "./products/product-category-filter";
import { ProductCreateForm } from "./products/product-create-form";

interface Props {
	className?: string;
}

type Category = {
	id: number;
	name: string;
};

type ProductItem = {
	id: number;
	price: number | import("@prisma/client/runtime/library").Decimal;
	sizeId: number | null;
	doughTypeId: number | null;
};

type Product = {
	id: number;
	name: string;
	imageUrl: string;
	categoryId: number;
	category: {
		id: number;
		name: string;
	};
	items: ProductItem[];
	ingredients?: {
		id: number;
		name: string;
		price: number | import("@prisma/client/runtime/library").Decimal;
		imageUrl: string;
	}[];
};

export const ProductsDashboard: React.FC<Props> = ({ className }) => {
	const [categories, setCategories] = useState<Category[]>([]);
	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

	// Загрузка категорий при монтировании
	useEffect(() => {
		loadCategories();
	}, []);

	// Загрузка продуктов при изменении выбранной категории
	useEffect(() => {
		if (categories.length > 0) {
			loadProducts();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedCategoryId, categories]);

	const loadCategories = async () => {
		try {
			const data = await Api.categories_dashboard.getCategories();
			setCategories(data);
		} catch (error) {
			toast.error("Errore nel caricamento delle categorie");
			console.error(error);
		}
	};

	const loadProducts = async () => {
		try {
			setLoading(true);
			const data = await Api.product_dashboard.getProducts(selectedCategoryId || undefined);

			// ✅ Конвертируем Decimal в number для совместимости типов
			const normalizedData = data.map((product) => ({
				...product,
				items: product.items.map((item) => ({
					...item,
					price: Number(item.price),
				})),
				ingredients: product.ingredients?.map((ing) => ({
					...ing,
					price: Number(ing.price),
				})),
			}));

			setProducts(normalizedData);
		} catch (error) {
			console.error("Errore nel caricamento dei prodotti:", error);
			toast.error("Impossibile caricare i prodotti");
		} finally {
			setLoading(false);
		}
	};

	// Обработчик создания нового продукта
	const handleProductCreated = (newProduct: Product) => {
		setProducts([newProduct, ...products]);
	};

	// Обработчик обновления продукта
	const handleProductUpdated = (id: number, updated: Product) => {
		setProducts(products.map((prod) => (prod.id === id ? updated : prod)));
	};

	// Обработчик удаления продукта
	const handleProductDeleted = (id: number) => {
		setProducts(products.filter((prod) => prod.id !== id));
	};

	if (loading && categories.length === 0) {
		return (
			<div className={cn("p-6", className)}>
				<div className="animate-pulse space-y-4">
					<div className="h-8 bg-gray-200 rounded w-1/4"></div>
					<div className="h-12 bg-gray-200 rounded"></div>
				</div>
			</div>
		);
	}
	console.log("products", products);
	return (
		<div className={cn("space-y-6", className)}>
			{/* Заголовок и счетчик */}
			<div>
				<h2 className="text-2xl font-bold">Gestione Prodotti</h2>
				<p className="text-gray-500 text-sm mt-1">Totale: {products.length} prodotti</p>
			</div>

			{/* Фильтр по категориям */}
			<ProductCategoryFilter
				categories={categories}
				selectedCategoryId={selectedCategoryId}
				onCategoryChange={setSelectedCategoryId}
			/>

			{/* Форма создания */}
			<ProductCreateForm categories={categories} onProductCreated={handleProductCreated} />

			{/* Список продуктов */}
			<div className="grid grid-cols-1 gap-3">
				{loading ? (
					<div className="text-center py-8 text-gray-500">Caricamento...</div>
				) : products.length === 0 ? (
					<div className="text-center py-12 text-gray-500">
						<p>Nessun prodotto trovato</p>
						<p className="text-sm mt-2">
							{selectedCategoryId
								? "Questa categoria non contiene prodotti"
								: "Inizia creando il tuo primo prodotto"}
						</p>
					</div>
				) : (
					products.map((product) => (
						<ProductCard
							key={product.id}
							product={product}
							categories={categories}
							onUpdate={handleProductUpdated}
							onDelete={handleProductDeleted}
						/>
					))
				)}
			</div>
		</div>
	);
};
