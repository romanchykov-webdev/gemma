"use client";

import { Button, Input } from "@/components/ui";
import { Plus } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import { useProductOptionsDashboard } from "@/hooks/dashboard/useProductOptionsDashboard";
import { Category } from "@prisma/client";
import { Api } from "../../../../../../../../services/api-client";
import { ProductIngredientsDashboard } from "./product-ingredients-dashboard";
import { ProductVariantsDashboard } from "./product-variants-dashboard";

type ProductItemFrontend = {
	id: number;
	price: number; // number, а не Decimal
	sizeId: number | null;
	doughTypeId: number | null;
};

type ProductFrontend = {
	id: number;
	name: string;
	imageUrl: string;
	categoryId: number;
	category: { id: number; name: string };
	items: ProductItemFrontend[];
	ingredients?: { id: number; name: string; price: number; imageUrl: string }[];
};

interface Props {
	categories: Category[];
	onProductCreated: (product: ProductFrontend) => void;
}

export const ProductCreateFormDashboard: React.FC<Props> = ({ categories, onProductCreated }) => {
	const { loading, ingredients, sizes, doughTypes } = useProductOptionsDashboard();

	const [name, setName] = useState("");
	const [imageUrl, setImageUrl] = useState("");
	const [categoryId, setCategoryId] = useState(categories[0]?.id || 0);

	const [variants, setVariants] = useState<{ sizeId: number | null; doughTypeId: number | null; price: number }[]>(
		[],
	);
	const [showVariants, setShowVariants] = useState(false);

	const [selectedIngredientIds, setSelectedIngredientIds] = useState<number[]>([]);
	const [showIngredients, setShowIngredients] = useState(false);

	const [isCreating, setIsCreating] = useState(false);

	const addVariant = () => {
		const defaultSizeId = sizes[0]?.id || null;
		const defaultDoughTypeId = doughTypes[0]?.id || null;
		setVariants([...variants, { sizeId: defaultSizeId, doughTypeId: defaultDoughTypeId, price: 0 }]);
		setShowVariants(true);
	};

	const removeVariant = (index: number) => setVariants(variants.filter((_, i) => i !== index));

	const updateVariant = (index: number, field: keyof (typeof variants)[0], value: number | null) => {
		const updated = [...variants];
		updated[index] = { ...updated[index], [field]: value };
		setVariants(updated);
	};

	const toggleIngredient = (id: number) =>
		setSelectedIngredientIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

	const handleCreate = async () => {
		if (!name.trim()) return toast.error("Inserisci il nome del prodotto");
		if (!imageUrl.trim()) return toast.error("Inserisci l'URL dell'immagine");
		if (!categoryId) return toast.error("Seleziona una categoria");
		if (variants.some((v) => !v.price || v.price <= 0))
			return toast.error("Inserisci un prezzo valido per tutte le varianti");

		try {
			setIsCreating(true);

			const created = await Api.product_dashboard.createProduct({
				name: name.trim(),
				imageUrl: imageUrl.trim(),
				categoryId,
				ingredientIds: selectedIngredientIds.length > 0 ? selectedIngredientIds : undefined,
				items: variants.length
					? variants.map((v) => ({
							price: v.price,
							sizeId: v.sizeId || undefined,
							doughTypeId: v.doughTypeId || undefined,
						}))
					: undefined,
			});

			const category = categories.find((c) => c.id === categoryId) || { id: categoryId, name: "" };

			// Формируем объект для фронтенда
			const newProduct: ProductFrontend = {
				id: created.id,
				name: created.name,
				imageUrl: created.imageUrl,
				categoryId: created.categoryId,
				category,
				items: (created.items || []).map((i) => ({
					id: i.id,
					price: Number(i.price), // конвертация Decimal -> number
					sizeId: i.sizeId || null,
					doughTypeId: i.doughTypeId || null,
				})),
				ingredients: [], 
			};

			// Очистка формы
			setName("");
			setImageUrl("");
			setCategoryId(categories[0]?.id || 0);
			setVariants([]);
			setSelectedIngredientIds([]);
			setShowVariants(false);
			setShowIngredients(false);

			toast.success("Prodotto creato con successo");
			onProductCreated(newProduct);
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : "Errore nella creazione";
			toast.error(message);
		} finally {
			setIsCreating(false);
		}
	};

	return (
		<div className="bg-white p-4 rounded-lg border space-y-3">
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

			{/* Категории */}
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

			{/* Варианты */}
			<ProductVariantsDashboard
				variants={variants}
				availableSizes={sizes}
				availableDoughTypes={doughTypes}
				showVariants={showVariants}
				setShowVariants={setShowVariants}
				addVariant={addVariant}
				removeVariant={removeVariant}
				updateVariant={updateVariant}
				loadingOptions={loading}
				isCreating={isCreating}
			/>

			{/* Ингредиенты */}
			<ProductIngredientsDashboard
				availableIngredients={ingredients}
				selectedIngredientIds={selectedIngredientIds}
				toggleIngredient={toggleIngredient}
				showIngredients={showIngredients}
				setShowIngredients={setShowIngredients}
				isCreating={isCreating}
			/>

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
