"use client";

import { Api } from "@/../services/api-client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
	Category,
	CreateProductData,
	DoughType,
	Ingredient,
	Product,
	ProductSize,
	UpdateProductData,
} from "../components/shared/products/product-types";
import { validateProductData } from "../components/shared/products/product-utils";

interface UseProductsReturn {
	categories: Category[];
	products: Product[];
	loading: boolean;
	selectedCategoryId: number | null;
	ingredients: Ingredient[];
	sizes: ProductSize[];
	doughTypes: DoughType[];
	loadingProductIds: Set<number>;
	setSelectedCategoryId: (id: number | null) => void;
	handleCreate: (data: CreateProductData) => Promise<void>;
	handleUpdate: (id: number, data: UpdateProductData) => Promise<void>;
	handleDelete: (id: number) => Promise<void>;
}

/**
 * Кастомный хук для управления продуктами
 * Изолирует всю логику работы с API и состоянием от UI компонента
 */
export const useProducts = (): UseProductsReturn => {
	const [categories, setCategories] = useState<Category[]>([]);
	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

	// Данные для форм
	const [ingredients, setIngredients] = useState<Ingredient[]>([]);
	const [sizes, setSizes] = useState<ProductSize[]>([]);
	const [doughTypes, setDoughTypes] = useState<DoughType[]>([]);

	// Состояние загрузки для отдельных продуктов
	const [loadingProductIds, setLoadingProductIds] = useState<Set<number>>(new Set());

	// Загрузка категорий
	const loadCategories = async () => {
		try {
			const data = await Api.categories_dashboard.getCategories();
			setCategories(data);
		} catch (error) {
			toast.error("Errore nel caricamento delle categorie");
			console.error(error);
		}
	};

	// Загрузка продуктов
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

		// Добавляем ID в состояние загрузки
		setLoadingProductIds((prev) => new Set(prev).add(id));

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
		} finally {
			// Удаляем ID из состояния загрузки
			setLoadingProductIds((prev) => {
				const newSet = new Set(prev);
				newSet.delete(id);
				return newSet;
			});
		}
	};

	// Удаление продукта
	const handleDelete = async (id: number) => {
		// Добавляем ID в состояние загрузки
		setLoadingProductIds((prev) => new Set(prev).add(id));

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
		} finally {
			// Удаляем ID из состояния загрузки
			setLoadingProductIds((prev) => {
				const newSet = new Set(prev);
				newSet.delete(id);
				return newSet;
			});
		}
	};

	// Загрузка категорий и данных форм при монтировании
	useEffect(() => {
		loadCategories();
		loadFormData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Загрузка продуктов при изменении категории
	useEffect(() => {
		if (categories.length > 0) {
			loadProducts();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedCategoryId, categories]);

	return {
		categories,
		products,
		loading,
		selectedCategoryId,
		ingredients,
		sizes,
		doughTypes,
		loadingProductIds,
		setSelectedCategoryId,
		handleCreate,
		handleUpdate,
		handleDelete,
	};
};
