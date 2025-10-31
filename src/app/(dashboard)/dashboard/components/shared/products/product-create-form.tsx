"use client";

import { Button, Input } from "@/components/ui";
import { mapPizzaSize, mapPizzaTypes } from "@/constants/pizza";
import { Plus, Trash2, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Api } from "../../../../../../../services/api-client";

interface Category {
	id: number;
	name: string;
}

interface Ingredient {
	id: number;
	name: string;
	price: number;
	imageUrl: string;
}

interface ProductVariant {
	size: number | null;
	pizzaType: number | null;
	price: number;
}

interface Props {
	categories: Category[];
	onProductCreated: (product: any) => void;
}

export const ProductCreateForm: React.FC<Props> = ({ categories, onProductCreated }) => {
	const [isCreating, setIsCreating] = useState(false);
	const [name, setName] = useState("");
	const [imageUrl, setImageUrl] = useState("");
	const [categoryId, setCategoryId] = useState<number>(categories[0]?.id || 0);

	// Состояние для ингредиентов
	const [availableIngredients, setAvailableIngredients] = useState<Ingredient[]>([]);
	const [selectedIngredientIds, setSelectedIngredientIds] = useState<number[]>([]);
	const [showIngredients, setShowIngredients] = useState(false);

	// Состояние для вариантов продукта
	const [variants, setVariants] = useState<ProductVariant[]>([]);
	const [showVariants, setShowVariants] = useState(false);

	// Загрузка ингредиентов при монтировании
	useEffect(() => {
		loadIngredients();
	}, []);

	const loadIngredients = async () => {
		try {
			const data = await Api.ingredients.getAll();
			setAvailableIngredients(data);
		} catch (error) {
			console.error("Errore nel caricamento degli ingredienti:", error);
		}
	};

	// Переключение выбора ингредиента
	const toggleIngredient = (ingredientId: number) => {
		setSelectedIngredientIds((prev) =>
			prev.includes(ingredientId) ? prev.filter((id) => id !== ingredientId) : [...prev, ingredientId],
		);
	};

	// Добавление варианта
	const addVariant = () => {
		setVariants([...variants, { size: 20, pizzaType: 1, price: 0 }]);
		setShowVariants(true);
	};

	// Удаление варианта
	const removeVariant = (index: number) => {
		setVariants(variants.filter((_, i) => i !== index));
	};

	// Обновление варианта
	const updateVariant = (index: number, field: keyof ProductVariant, value: number | null) => {
		const updated = [...variants];
		updated[index] = { ...updated[index], [field]: value };
		setVariants(updated);
	};

	const handleCreate = async () => {
		// Валидация
		if (!name.trim()) {
			toast.error("Inserisci il nome del prodotto");
			return;
		}
		if (!imageUrl.trim()) {
			toast.error("Inserisci l'URL dell'immagine");
			return;
		}
		if (!categoryId) {
			toast.error("Seleziona una categoria");
			return;
		}

		// Валидация вариантов
		if (variants.length > 0) {
			const hasInvalidVariant = variants.some((v) => !v.price || v.price <= 0);
			if (hasInvalidVariant) {
				toast.error("Inserisci un prezzo valido per tutte le varianti");
				return;
			}
		}

		try {
			setIsCreating(true);

			const newProduct = await Api.product_dashboard.createProduct({
				name: name.trim(),
				imageUrl: imageUrl.trim(),
				categoryId: categoryId,
				ingredientIds: selectedIngredientIds.length > 0 ? selectedIngredientIds : undefined,
				items: variants.length > 0 ? variants : undefined,
			});

			// Очищаем форму
			setName("");
			setImageUrl("");
			setCategoryId(categories[0]?.id || 0);
			setSelectedIngredientIds([]);
			setVariants([]);
			setShowIngredients(false);
			setShowVariants(false);

			toast.success("Prodotto creato con successo");
			onProductCreated(newProduct);
		} catch (error: any) {
			toast.error(error.response?.data?.message || "Errore nella creazione");
		} finally {
			setIsCreating(false);
		}
	};

	return (
		<div className="bg-white p-4 rounded-lg border space-y-3">
			<h3 className="font-semibold">Aggiungi nuovo prodotto</h3>

			{/* Основные поля */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
				<Input
					placeholder="Nome prodotto..."
					value={name}
					onChange={(e) => setName(e.target.value)}
					disabled={isCreating}
				/>
				<Input
					placeholder="URL immagine..."
					value={imageUrl}
					onChange={(e) => setImageUrl(e.target.value)}
					disabled={isCreating}
				/>
			</div>

			{/* Категория */}
			<div className="flex gap-2">
				<select
					className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
					value={categoryId}
					onChange={(e) => setCategoryId(Number(e.target.value))}
					disabled={isCreating}
				>
					<option value={0}>Seleziona categoria...</option>
					{categories.map((cat) => (
						<option key={cat.id} value={cat.id}>
							{cat.name}
						</option>
					))}
				</select>
			</div>

			{/* Секция вариантов */}
			<div className="border-t pt-3">
				<div className="flex items-center justify-between mb-2">
					<span className="text-sm font-medium">
						Varianti {variants.length > 0 && `(${variants.length})`}
					</span>
					<div className="flex gap-2">
						{variants.length > 0 && (
							<Button
								type="button"
								variant="ghost"
								size="sm"
								onClick={() => setShowVariants(!showVariants)}
								disabled={isCreating}
							>
								{showVariants ? "Nascondi" : "Mostra"}
							</Button>
						)}
						<Button type="button" variant="outline" size="sm" onClick={addVariant} disabled={isCreating}>
							<Plus className="w-3 h-3 mr-1" />
							Aggiungi Variante
						</Button>
					</div>
				</div>

				{/* Список вариантов */}
				{showVariants && variants.length > 0 && (
					<div className="space-y-2 border rounded-lg p-3 bg-gray-50">
						{variants.map((variant, index) => (
							<div key={index} className="flex items-center gap-2 bg-white p-3 rounded-lg border">
								<div className="flex-1 grid grid-cols-3 gap-2">
									{/* Размер */}
									<select
										className="flex h-9 rounded-md border border-input bg-background px-2 text-sm"
										value={variant.size ?? 20}
										onChange={(e) => updateVariant(index, "size", Number(e.target.value))}
										disabled={isCreating}
									>
										{Object.entries(mapPizzaSize).map(([value, name]) => (
											<option key={value} value={value}>
												{name}
											</option>
										))}
									</select>

									{/* Тип теста */}
									<select
										className="flex h-9 rounded-md border border-input bg-background px-2 text-sm"
										value={variant.pizzaType ?? 1}
										onChange={(e) => updateVariant(index, "pizzaType", Number(e.target.value))}
										disabled={isCreating}
									>
										{Object.entries(mapPizzaTypes).map(([value, name]) => (
											<option key={value} value={value}>
												{name}
											</option>
										))}
									</select>

									{/* Цена */}
									<Input
										type="number"
										placeholder="Prezzo €"
										value={variant.price || ""}
										onChange={(e) => updateVariant(index, "price", Number(e.target.value))}
										disabled={isCreating}
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
									disabled={isCreating}
									className="text-red-600 hover:text-red-700 h-9 w-9"
								>
									<Trash2 className="w-4 h-4" />
								</Button>
							</div>
						))}
					</div>
				)}

				{/* Краткое отображение вариантов когда скрыто */}
				{!showVariants && variants.length > 0 && (
					<div className="flex flex-wrap gap-2 mt-2">
						{variants.map((variant, index) => (
							<div
								key={index}
								className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs"
							>
								<span>
									{variant.size && mapPizzaSize[variant.size as keyof typeof mapPizzaSize]} -{" "}
									{variant.pizzaType &&
										mapPizzaTypes[variant.pizzaType as keyof typeof mapPizzaTypes]}{" "}
									- €{variant.price}
								</span>
							</div>
						))}
					</div>
				)}
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
						disabled={isCreating}
					>
						{showIngredients ? "Nascondi" : "Mostra"}
					</Button>
				</div>

				{/* Отображение выбранных ингредиентов */}
				{selectedIngredientIds.length > 0 && (
					<div className="flex flex-wrap gap-2 mb-3">
						{selectedIngredientIds.map((id) => {
							const ingredient = availableIngredients.find((ing) => ing.id === id);
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
										disabled={isCreating}
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
								Nessun ingrediente disponibile
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
										disabled={isCreating}
										className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
									/>
									<span className="text-sm">{ingredient.name}</span>
								</label>
							))
						)}
					</div>
				)}
			</div>

			{/* Кнопка создания */}
			<Button
				onClick={handleCreate}
				disabled={isCreating || !name.trim() || !imageUrl.trim() || !categoryId}
				className="w-full"
			>
				<Plus className="w-4 h-4 mr-2" />
				{isCreating ? "Creazione..." : "Aggiungi Prodotto"}
			</Button>
		</div>
	);
};
