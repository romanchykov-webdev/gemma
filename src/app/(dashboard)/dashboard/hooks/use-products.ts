'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Api } from '../../../../../services/api-client';
import {
  Category,
  CreateProductData,
  DoughType,
  Ingredient,
  Product,
  ProductSize,
  UpdateProductData,
} from '../components/shared/products/product-types';
import { validateProductData } from '../components/shared/products/product-utils';

// 🛠️ DTO (Data Transfer Object)
interface ProductVariantDTO {
  variantId: number;
  price: number | string;
  sizeId: number | null;
  typeId: number | null;
}
interface BaseIngredientDTO {
  id: number;
  name: string;
  imageUrl: string;
  removable: boolean;
  isDisabled: boolean;
}

interface ProductResponseDTO {
  id: number;
  name: string;
  imageUrl: string;
  categoryId: number;
  category: { id: number; name: string };
  createdAt: string | Date;
  updatedAt: string | Date;
  variants: ProductVariantDTO[];
  baseIngredients: BaseIngredientDTO[];
  addableIngredientIds: number[];
}

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

// 🔄 API Request Types
interface CreateProductRequest {
  name: string;
  imageUrl: string;
  categoryId: number;
  baseIngredients?: BaseIngredientDTO[];
  addableIngredientIds?: number[];
  variants?: Array<{
    variantId: number;
    price: number;
    sizeId?: number;
    typeId?: number;
  }>;
}

interface UpdateProductRequest {
  name: string;
  imageUrl: string;
  categoryId: number;
  baseIngredients?: BaseIngredientDTO[];
  addableIngredientIds?: number[];
  variants?: Array<{
    variantId: number;
    price: number;
    sizeId?: number | null;
    typeId?: number | null;
  }>;
}

export const useProducts = (): UseProductsReturn => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  // Данные для форм
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [sizes, setSizes] = useState<ProductSize[]>([]);
  const [doughTypes, setDoughTypes] = useState<DoughType[]>([]);

  const [loadingProductIds, setLoadingProductIds] = useState<Set<number>>(new Set());

  // Загрузка категорий
  const loadCategories = async () => {
    try {
      const data = await Api.categories_dashboard.getCategories();
      setCategories(data);
    } catch (error) {
      toast.error('Errore nel caricamento delle categorie');
      console.error(error);
    }
  };

  // 🔄 Загрузка продуктов
  const loadProducts = async () => {
    try {
      setLoading(true);

      const data = (await Api.product_dashboard.getProducts(
        selectedCategoryId || undefined,
      )) as unknown as ProductResponseDTO[];

      const normalizedData: Product[] = data.map(product => ({
        ...product,
        variants: (product.variants || []).map(variant => ({
          ...variant,
          price: Number(variant.price),
        })),
        baseIngredients: product.baseIngredients || [],
        addableIngredientIds: product.addableIngredientIds || [],
      }));

      setProducts(normalizedData);
    } catch (error) {
      console.error('Errore nel caricamento dei prodotti:', error);
      toast.error('Impossibile caricare i prodotti');
    } finally {
      setLoading(false);
    }
  };

  // Загрузка справочников
  const loadFormData = async () => {
    try {
      const [ingredientsData, sizesData, doughTypesData] = await Promise.all([
        Api.ingredients.getAll(),
        Api.product_sizes_dashboard.getProductSizes(),
        Api.dough_types_dashboard.getDoughTypes(),
      ]);

      setIngredients(
        ingredientsData.map(ing => ({
          ...ing,
          price: Number(ing.price),
        })),
      );
      setSizes(sizesData);
      setDoughTypes(doughTypesData);
    } catch (error) {
      console.error('Errore nel caricamento dei dati del modulo:', error);
    }
  };

  // 🔄 Создание продукта
  const handleCreate = async (data: CreateProductData) => {
    // ✅ Раскомментировали валидацию
    const validationError = validateProductData(data);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      const apiData = {
        name: data.name,
        imageUrl: data.imageUrl,
        categoryId: data.categoryId,
        baseIngredients: data.baseIngredients,
        addableIngredientIds: data.addableIngredientIds,
        variants: data.variants?.map(variant => ({
          variantId: variant.variantId,
          price: variant.price,
          sizeId: variant.sizeId ?? undefined,
          typeId: variant.typeId ?? undefined,
        })),
      };

      const newProduct = (await Api.product_dashboard.createProduct(
        apiData as CreateProductRequest,
      )) as unknown as ProductResponseDTO;

      const normalized: Product = {
        ...newProduct,
        variants: (newProduct.variants || []).map(v => ({ ...v, price: Number(v.price) })),
        baseIngredients: newProduct.baseIngredients || [],
        addableIngredientIds: newProduct.addableIngredientIds || [],
      };

      setProducts([normalized, ...products]);
      toast.success('Prodotto creato con successo');
    } catch (error: unknown) {
      console.error(error);
      const message =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : 'Errore nella creazione';
      toast.error(message || 'Errore nella creazione del prodotto');
    }
  };

  // 🔄 Обновление продукта
  const handleUpdate = async (id: number, data: UpdateProductData) => {
    // ✅ Раскомментировали валидацию
    const validationError = validateProductData(data);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setLoadingProductIds(prev => new Set(prev).add(id));

    try {
      const apiData = {
        name: data.name,
        imageUrl: data.imageUrl,
        categoryId: data.categoryId,
        baseIngredients: data.baseIngredients,
        addableIngredientIds: data.addableIngredientIds,
        variants: data.variants?.map(variant => ({
          variantId: variant.variantId,
          price: Number(variant.price),
          sizeId: variant.sizeId,
          typeId: variant.typeId,
        })),
      };

      const updated = (await Api.product_dashboard.updateProduct(
        id,
        apiData as UpdateProductRequest,
      )) as unknown as ProductResponseDTO;

      const normalized: Product = {
        ...updated,
        variants: (updated.variants || []).map(v => ({ ...v, price: Number(v.price) })),
        baseIngredients: updated.baseIngredients || [],
        addableIngredientIds: updated.addableIngredientIds || [],
      };

      setProducts(products.map(prod => (prod.id === id ? normalized : prod)));
      toast.success('Prodotto aggiornato');
    } catch (error: unknown) {
      console.error(error);
      const message =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : "Errore nell'aggiornamento";
      toast.error(message || "Errore nell'aggiornamento");
    } finally {
      setLoadingProductIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleDelete = async (id: number) => {
    setLoadingProductIds(prev => new Set(prev).add(id));

    try {
      await Api.product_dashboard.deleteProduct(id);
      setProducts(products.filter(prod => prod.id !== id));
      toast.success('Prodotto eliminato');
    } catch (error: unknown) {
      const message =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : "Errore nell'eliminazione";
      toast.error(message || "Errore nell'eliminazione");
    } finally {
      setLoadingProductIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  useEffect(() => {
    loadCategories();
    loadFormData();
  }, []);

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
