"use client";

import { Button, Input } from "@/components/ui";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, ChevronUp, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Api } from "../../../../../../../services/api-client";
import { Ingredient, Product, ProductItem } from "../../../../../../../services/dashboaed/products";
import { ProductImagePreview } from "./product-image-preview";
import { ProductVariantsTable } from "./product-variants-table";

interface Category {
	id: number;
	name: string;
}

interface Props {
	product: Product;
	categories: Category[];
	onUpdate: (id: number, updated: Product) => void;
	onDelete: (id: number) => void;
}

export const ProductCardDashboard: React.FC<Props> = ({ product, categories, onUpdate, onDelete }) => {
	const [isEditing, setIsEditing] = useState(false);
	const [isExpanded, setIsExpanded] = useState(false);

	// loading
	const [isLoading, setIsLoading] = useState(false);

	// Состояние для редактирования
	const [editingName, setEditingName] = useState(product.name);
	const [editingImageUrl, setEditingImageUrl] = useState(product.imageUrl);
	const [editingCategoryId, setEditingCategoryId] = useState(product.categoryId);

	// Состояние для ингредиентов
	const [availableIngredients, setAvailableIngredients] = useState<Ingredient[]>([]);
	const [selectedIngredientIds, setSelectedIngredientIds] = useState<number[]>(
		product.ingredients?.map((ing) => ing.id) || [],
	);
	const [showIngredients, setShowIngredients] = useState(false);

	// 🔥 НОВОЕ: Динамические размеры и типы теста
	const [availableSizes, setAvailableSizes] = useState<Array<{ id: number; name: string; value: number }>>([]);
	const [availableDoughTypes, setAvailableDoughTypes] = useState<Array<{ id: number; name: string; value: number }>>(
		[],
	);

	// Состояние для вариантов
	const [editingVariants, setEditingVariants] = useState<ProductItem[]>([]);
	const [showVariantsEdit, setShowVariantsEdit] = useState(false);

	// 🔥 ОБНОВЛЕНО: Загрузка всех данных при переходе в режим редактирования
	useEffect(() => {
		if (isEditing) {
			if (availableIngredients.length === 0) {
				loadIngredients();
			}
			if (availableSizes.length === 0) {
				loadSizes();
			}
			if (availableDoughTypes.length === 0) {
				loadDoughTypes();
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isEditing]);

	const loadIngredients = async () => {
		try {
			const data = await Api.ingredients.getAll();
			setAvailableIngredients(data);
		} catch (error) {
			console.error("Errore nel caricamento degli ingredienti:", error);
		}
	};

	// 🔥 НОВОЕ: Загрузка размеров
	const loadSizes = async () => {
		try {
			const data = await Api.product_sizes_dashboard.getProductSizes();
			setAvailableSizes(data.map((s) => ({ id: s.id, name: s.name, value: s.value })));
		} catch (error) {
			console.error("Errore nel caricamento dei formati:", error);
		}
	};

	// 🔥 НОВОЕ: Загрузка типов теста
	const loadDoughTypes = async () => {
		try {
			const data = await Api.dough_types_dashboard.getDoughTypes();
			setAvailableDoughTypes(data.map((d) => ({ id: d.id, name: d.name, value: d.value })));
		} catch (error) {
			console.error("Errore nel caricamento dei tipi di impasto:", error);
		}
	};

	const startEditing = () => {
		setIsEditing(true);
		setEditingName(product.name);
		setEditingImageUrl(product.imageUrl);
		setEditingCategoryId(product.categoryId);
		setSelectedIngredientIds(product.ingredients?.map((ing) => ing.id) || []);
		setEditingVariants([...product.items]);
	};

	const cancelEditing = () => {
		setIsEditing(false);
		setEditingName(product.name);
		setEditingImageUrl(product.imageUrl);
		setEditingCategoryId(product.categoryId);
		setSelectedIngredientIds(product.ingredients?.map((ing) => ing.id) || []);
		setShowIngredients(false);
		setEditingVariants([]);
		setShowVariantsEdit(false);
	};

	// Переключение выбора ингредиента
	const toggleIngredient = (ingredientId: number) => {
		setSelectedIngredientIds((prev) =>
			prev.includes(ingredientId) ? prev.filter((id) => id !== ingredientId) : [...prev, ingredientId],
		);
	};

	// 🔥 ОБНОВЛЕНО: Добавление нового варианта с динамическими дефолтными значениями
	const addVariant = () => {
		const newVariant: ProductItem = {
			id: -Date.now(), // Временный отрицательный ID
			sizeId: availableSizes[0]?.id || null,
			doughTypeId: availableDoughTypes[0]?.id || null,
			price: 0,
		};
		setEditingVariants([...editingVariants, newVariant]);
		setShowVariantsEdit(true);
	};

	// Удаление варианта
	const removeVariant = (index: number) => {
		setEditingVariants(editingVariants.filter((_, i) => i !== index));
	};

	// Обновление варианта
	const updateVariant = (index: number, field: keyof ProductItem, value: number | null) => {
		const updated = [...editingVariants];
		updated[index] = { ...updated[index], [field]: value };
		setEditingVariants(updated);
	};

	const handleUpdate = async () => {
		setIsLoading(true);
		// Валидация
		if (!editingName.trim()) {
			toast.error("Il nome non può essere vuoto");
			return;
		}
		if (!editingImageUrl.trim()) {
			toast.error("L'URL dell'immagine non può essere vuoto");
			return;
		}

		// Валидация вариантов
		if (editingVariants.length > 0) {
			const hasInvalidVariant = editingVariants.some((v) => !v.price || Number(v.price) <= 0);
			if (hasInvalidVariant) {
				toast.error("Inserisci un prezzo valido per tutte le varianti");
				return;
			}
		}

		try {
			const updated = await Api.product_dashboard.updateProduct(product.id, {
				name: editingName.trim(),
				imageUrl: editingImageUrl.trim(),
				categoryId: editingCategoryId,
				ingredientIds: selectedIngredientIds.length > 0 ? selectedIngredientIds : undefined,
				items: editingVariants.map((item) => ({
					...(item.id > 0 ? { id: item.id } : {}),
					price: Number(item.price),
					sizeId: item.sizeId,
					doughTypeId: item.doughTypeId,
				})),
			});

			onUpdate(product.id, updated);
			setIsEditing(false);
			setShowIngredients(false);
			setShowVariantsEdit(false);
			toast.success("Prodotto aggiornato");
		} catch (error: unknown) {
			const message =
				error instanceof Error && "response" in error
					? (error as unknown as { response?: { data?: { message?: string } } }).response?.data?.message
					: error instanceof Error
						? error.message
						: "Errore nell'aggiornamento";
			toast.error(message || "Errore nell'aggiornamento");
		} finally {
			setIsLoading(false);
		}
	};

	const handleDelete = async () => {
		if (product.items.length > 0) {
			toast.error("Impossibile eliminare. Il prodotto ha varianti");
			return;
		}

		if (!confirm("Sei sicuro di voler eliminare questo prodotto?")) {
			return;
		}

		try {
			await Api.product_dashboard.deleteProduct(product.id);
			onDelete(product.id);
			toast.success("Prodotto eliminato");
		} catch (error: unknown) {
			const message =
				error instanceof Error && "response" in error
					? (error as unknown as { response?: { data?: { message?: string } } }).response?.data?.message
					: error instanceof Error
						? error.message
						: "Errore nell'eliminazione";
			toast.error(message || "Errore nell'eliminazione");
		}
	};

	// Режим редактирования - развернутая форма
	if (isEditing) {
		return (
			<div
				className={cn("bg-white border-2 border-orange-500 rounded-lg p-4 space-y-4 relative overflow-hidden")}
			>
				{isLoading && (
					<div className="absolute inset-0 h-[100%] w-[100%] bg-black/50 z-10 flex items-center justify-center">
						<Loader2 className="w-10 h-10 animate-spin text-white" />
					</div>
				)}
				<div className="flex items-center justify-between">
					<h3 className="font-semibold text-lg">Modifica Prodotto</h3>
					<div className="flex gap-2">
						<Button size="sm" onClick={handleUpdate} className="bg-green-600 hover:bg-green-700">
							<Check className="w-4 h-4 mr-1" />
							Salva
						</Button>
						<Button size="sm" variant="outline" onClick={cancelEditing}>
							<X className="w-4 h-4 mr-1" />
							Annulla
						</Button>
					</div>
				</div>

				{/* Основные поля */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
					<Input
						placeholder="Nome prodotto..."
						value={editingName}
						onChange={(e) => setEditingName(e.target.value)}
						autoFocus
					/>
					<Input
						placeholder="URL immagine..."
						value={editingImageUrl}
						onChange={(e) => setEditingImageUrl(e.target.value)}
					/>
				</div>

				{/* Превью изображения */}
				<div className="flex items-center gap-3">
					<ProductImagePreview imageUrl={editingImageUrl} alt={editingName} size="md" />
					<div className="text-sm text-gray-500">{`Anteprima dell'immagine`}</div>
				</div>

				{/* Категория */}
				<div>
					<label className="text-sm font-medium mb-2 block">Categoria</label>
					<select
						className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
						value={editingCategoryId}
						onChange={(e) => setEditingCategoryId(Number(e.target.value))}
					>
						{categories.map((cat) => (
							<option key={cat.id} value={cat.id}>
								{cat.name}
							</option>
						))}
					</select>
				</div>

				{/* Секция ингредиентов */}
				<div className="border-t pt-3">
					<div className="flex items-center justify-between mb-2">
						<span className="text-sm font-medium">
							Ingredienti {selectedIngredientIds.length > 0 && `(${selectedIngredientIds.length})`}
						</span>
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={() => setShowIngredients(!showIngredients)}
						>
							{showIngredients ? "Nascondi" : "Mostra"}
						</Button>
					</div>

					{/* Отображение выбранных ингредиентов */}
					{selectedIngredientIds.length > 0 && (
						<div className="flex flex-wrap gap-2 mb-3">
							{selectedIngredientIds.map((id) => {
								const ingredient =
									availableIngredients.find((ing) => ing.id === id) ||
									product.ingredients?.find((ing) => ing.id === id);
								return (
									<div
										key={id}
										className="flex items-center gap-1 bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs"
									>
										<span>{ingredient?.name}</span>
										<button
											type="button"
											onClick={() => toggleIngredient(id)}
											className="hover:text-orange-900"
										>
											<X className="w-3 h-3" />
										</button>
									</div>
								);
							})}
						</div>
					)}

					{/* Список всех ингредиентов */}
					{showIngredients && (
						<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-60 overflow-y-auto border rounded-lg p-3 bg-gray-50">
							{availableIngredients.length === 0 ? (
								<div className="col-span-full text-center text-sm text-gray-500 py-4">
									Caricamento ingredienti...
								</div>
							) : (
								availableIngredients.map((ingredient) => (
									<label
										key={ingredient.id}
										className="flex items-center gap-2 p-2 hover:bg-white rounded cursor-pointer transition"
									>
										<input
											type="checkbox"
											checked={selectedIngredientIds.includes(ingredient.id)}
											onChange={() => toggleIngredient(ingredient.id)}
											className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
										/>
										<span className="text-sm">{ingredient.name}</span>
									</label>
								))
							)}
						</div>
					)}
				</div>

				{/* Секция вариантов - полное редактирование */}
				<div className="border-t pt-3">
					<div className="flex items-center justify-between mb-2">
						<span className="text-sm font-medium">
							Varianti {editingVariants.length > 0 && `(${editingVariants.length})`}
						</span>
						<div className="flex gap-2">
							{editingVariants.length > 0 && (
								<Button
									type="button"
									variant="ghost"
									size="sm"
									onClick={() => setShowVariantsEdit(!showVariantsEdit)}
								>
									{showVariantsEdit ? "Nascondi" : "Mostra"}
								</Button>
							)}
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={addVariant}
								disabled={availableSizes.length === 0 || availableDoughTypes.length === 0}
							>
								<Plus className="w-3 h-3 mr-1" />
								Aggiungi
							</Button>
						</div>
					</div>

					{/* Список вариантов для редактирования */}
					{showVariantsEdit && editingVariants.length > 0 && (
						<div className="space-y-2 border rounded-lg p-3 bg-gray-50">
							{editingVariants.map((variant, index) => (
								<div
									key={variant.id || index}
									className="flex items-center gap-2 bg-white p-3 rounded-lg border"
								>
									<div className="flex-1 grid grid-cols-3 gap-2">
										{/* 🔥 ОБНОВЛЕНО: Размер с динамическими данными */}
										<select
											className="flex h-9 rounded-md border border-input bg-background px-2 text-sm"
											value={variant.sizeId ?? availableSizes[0]?.id}
											onChange={(e) => updateVariant(index, "sizeId", Number(e.target.value))}
											disabled={availableSizes.length === 0}
										>
											{availableSizes.map((size) => (
												<option key={size.id} value={size.id}>
													{size.name} - {size.value} cm
												</option>
											))}
										</select>

										{/* 🔥 ОБНОВЛЕНО: Тип теста с динамическими данными */}
										<select
											className="flex h-9 rounded-md border border-input bg-background px-2 text-sm"
											value={variant.doughTypeId ?? availableDoughTypes[0]?.id}
											onChange={(e) =>
												updateVariant(index, "doughTypeId", Number(e.target.value))
											}
											disabled={availableDoughTypes.length === 0}
										>
											{availableDoughTypes.map((type) => (
												<option key={type.id} value={type.id}>
													{type.name}
												</option>
											))}
										</select>

										{/* Цена */}
										<Input
											type="number"
											placeholder="Prezzo €"
											value={Number(variant.price) || ""}
											onChange={(e) => updateVariant(index, "price", Number(e.target.value))}
											min="0"
											step="0.5"
											className="h-9"
										/>
									</div>

									{/* Кнопка удаления */}
									<Button
										type="button"
										variant="ghost"
										size="icon"
										onClick={() => removeVariant(index)}
										className="text-red-600 hover:text-red-700 h-9 w-9"
									>
										<Trash2 className="w-4 h-4" />
									</Button>
								</div>
							))}
						</div>
					)}

					{/* 🔥 ОБНОВЛЕНО: Краткое отображение вариантов с динамическими данными */}
					{!showVariantsEdit && editingVariants.length > 0 && (
						<div className="flex flex-wrap gap-2 mt-2">
							{editingVariants.map((variant, index) => {
								const size = availableSizes.find((s) => s.id === variant.sizeId);
								const doughType = availableDoughTypes.find((d) => d.id === variant.doughTypeId);
								return (
									<div
										key={variant.id || index}
										className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs"
									>
										{size?.name} - {doughType?.name} - €{Number(variant.price)}
									</div>
								);
							})}
						</div>
					)}
				</div>
			</div>
		);
	}

	// Режим просмотра - компактная карточка
	return (
		<div className="bg-white border rounded-lg overflow-hidden">
			{/* Основная информация о продукте */}
			<div className="flex items-center gap-3 p-4 hover:bg-gray-50 transition">
				{/* Изображение */}
				<ProductImagePreview imageUrl={product.imageUrl} alt={product.name} size="sm" />

				<div className="flex-1">
					<p className="font-medium">{product.name}</p>
					<p className="text-sm text-gray-500">{product.category.name}</p>
					<div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
						<span>{product.items.length} varianti</span>
						{product.ingredients && product.ingredients.length > 0 && (
							<>
								<span>•</span>
								<span>{product.ingredients.length} ingredienti</span>
							</>
						)}
					</div>
				</div>

				{/* Кнопка раскрытия вариантов */}
				{product.items.length > 0 && (
					<Button
						size="icon"
						variant="ghost"
						onClick={() => setIsExpanded(!isExpanded)}
						className="text-gray-600 hover:text-gray-700"
					>
						{isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
					</Button>
				)}

				<Button
					size="icon"
					variant="ghost"
					onClick={startEditing}
					className="text-blue-600 hover:text-blue-700"
				>
					<Pencil className="w-4 h-4" />
				</Button>
				<Button
					size="icon"
					variant="ghost"
					onClick={handleDelete}
					className="text-red-600 hover:text-red-700"
					disabled={product.items.length > 0}
				>
					<Trash2 className="w-4 h-4" />
				</Button>
			</div>

			{/* Варианты продукта (раскрывающиеся) */}
			{isExpanded && product.items.length > 0 && <ProductVariantsTable product={product} />}
		</div>
	);
};
