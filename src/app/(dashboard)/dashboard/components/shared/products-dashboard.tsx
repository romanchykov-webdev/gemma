"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Api } from "../../../../../../services/api-client";
import { ProductCardDashboard } from "./products/product-card/product-card";
import { ProductCategoryFilter } from "./products/product-category-filter";
import { ProductCreateFormDashboard } from "./products/product-create-form-dashboard/product-create-form";
import {
	Category,
	CreateProductData,
	DoughType,
	Ingredient,
	Product,
	ProductSize,
	UpdateProductData,
} from "./products/product-types";
import { validateProductData } from "./products/product-utils";

interface Props {
	className?: string;
}

export const ProductsDashboard: React.FC<Props> = ({ className }) => {
	const [categories, setCategories] = useState<Category[]>([]);
	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

	// Данные для форм (загружаются один раз)
	const [ingredients, setIngredients] = useState<Ingredient[]>([]);
	const [sizes, setSizes] = useState<ProductSize[]>([]);
	const [doughTypes, setDoughTypes] = useState<DoughType[]>([]);

	// Загрузка категорий при монтировании
	useEffect(() => {
		loadCategories();
		loadFormData();
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

			// Конвертируем Decimal в number
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

	// Загрузка данных для форм (один раз)
	const loadFormData = async () => {
		try {
			const [ingredientsData, sizesData, doughTypesData] = await Promise.all([
				Api.ingredients.getAll(),
				Api.product_sizes_dashboard.getProductSizes(),
				Api.dough_types_dashboard.getDoughTypes(),
			]);

			setIngredients(ingredientsData);
			setSizes(sizesData);
			setDoughTypes(doughTypesData);
		} catch (error) {
			console.error("Errore nel caricamento dei dati del modulo:", error);
		}
	};

	// Создание продукта
	const handleCreate = async (data: CreateProductData) => {
		const validationError = validateProductData(data);
		if (validationError) {
			toast.error(validationError);
			return;
		}

		try {
			// Конвертируем null в undefined для API
			const apiData = {
				...data,
				items: data.items?.map((item) => ({
					price: item.price,
					sizeId: item.sizeId ?? undefined,
					doughTypeId: item.doughTypeId ?? undefined,
				})),
			};

			const newProduct = await Api.product_dashboard.createProduct(apiData);

			// Нормализуем данные
			const normalized = {
				...newProduct,
				items: newProduct.items.map((item) => ({ ...item, price: Number(item.price) })),
				ingredients: newProduct.ingredients?.map((ing) => ({ ...ing, price: Number(ing.price) })),
			};

			setProducts([normalized, ...products]);
			toast.success("Prodotto creato con successo");
		} catch (error: unknown) {
			const message =
				error instanceof Error && "response" in error
					? (error as { response?: { data?: { message?: string } } }).response?.data?.message
					: "Errore nella creazione";
			toast.error(message || "Errore nella creazione del prodotto");
		}
	};

	// Обновление продукта
	const handleUpdate = async (id: number, data: UpdateProductData) => {
		const validationError = validateProductData(data);
		if (validationError) {
			toast.error(validationError);
			return;
		}

		try {
			// Конвертируем items в правильный формат для API
			const apiData: UpdateProductData = {
				...data,
				items: data.items?.map((item) => ({
					id: item.id,
					price: Number(item.price),
					sizeId: item.sizeId,
					doughTypeId: item.doughTypeId,
				})),
			};

			const updated = await Api.product_dashboard.updateProduct(id, apiData);

			// Нормализуем данные
			const normalized = {
				...updated,
				items: updated.items.map((item) => ({ ...item, price: Number(item.price) })),
				ingredients: updated.ingredients?.map((ing) => ({ ...ing, price: Number(ing.price) })),
			};

			setProducts(products.map((prod) => (prod.id === id ? normalized : prod)));
			toast.success("Prodotto aggiornato");
		} catch (error: unknown) {
			const message =
				error instanceof Error && "response" in error
					? (error as { response?: { data?: { message?: string } } }).response?.data?.message
					: "Errore nell'aggiornamento";
			toast.error(message || "Errore nell'aggiornamento");
		}
	};

	// Удаление продукта
	const handleDelete = async (id: number) => {
		try {
			await Api.product_dashboard.deleteProduct(id);
			setProducts(products.filter((prod) => prod.id !== id));
			toast.success("Prodotto eliminato");
		} catch (error: unknown) {
			const message =
				error instanceof Error && "response" in error
					? (error as { response?: { data?: { message?: string } } }).response?.data?.message
					: "Errore nell'eliminazione";
			toast.error(message || "Errore nell'eliminazione");
		}
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

	return (
		<div className={cn("space-y-6", className)}>
			{/* Заголовок */}
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
			<ProductCreateFormDashboard
				categories={categories}
				ingredients={ingredients}
				sizes={sizes}
				doughTypes={doughTypes}
				onSubmit={handleCreate}
			/>

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
						<ProductCardDashboard
							key={product.id}
							product={product}
							categories={categories}
							ingredients={ingredients}
							sizes={sizes}
							doughTypes={doughTypes}
							onUpdate={handleUpdate}
							onDelete={handleDelete}
						/>
					))
				)}
			</div>
		</div>
	);
};
