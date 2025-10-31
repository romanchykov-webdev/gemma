"use client";

import { Button, Input } from "@/components/ui";
import { Check, ChevronDown, ChevronUp, Pencil, Trash2, X } from "lucide-react";
import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { Api } from "../../../../../../../services/api-client";
import { ProductImagePreview } from "./product-image-preview";
import { ProductVariantsTable } from "./product-variants-table";

interface ProductItem {
	id: number;
	price: number;
	size: number | null;
	pizzaType: number | null;
}

interface Product {
	id: number;
	name: string;
	imageUrl: string;
	categoryId: number;
	category: {
		id: number;
		name: string;
	};
	items: ProductItem[];
}

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

export const ProductCard: React.FC<Props> = ({ product, categories, onUpdate, onDelete }) => {
	const [isEditing, setIsEditing] = useState(false);
	const [isExpanded, setIsExpanded] = useState(false);
	const [editingName, setEditingName] = useState(product.name);
	const [editingImageUrl, setEditingImageUrl] = useState(product.imageUrl);
	const [editingCategoryId, setEditingCategoryId] = useState(product.categoryId);

	const startEditing = () => {
		setIsEditing(true);
		setEditingName(product.name);
		setEditingImageUrl(product.imageUrl);
		setEditingCategoryId(product.categoryId);
	};

	const cancelEditing = () => {
		setIsEditing(false);
		setEditingName(product.name);
		setEditingImageUrl(product.imageUrl);
		setEditingCategoryId(product.categoryId);
	};

	const handleUpdate = async () => {
		// Валидация
		if (!editingName.trim()) {
			toast.error("Il nome non può essere vuoto");
			return;
		}
		if (!editingImageUrl.trim()) {
			toast.error("L'URL dell'immagine non può essere vuoto");
			return;
		}

		try {
			const updated = await Api.product_dashboard.updateProduct(product.id, {
				name: editingName.trim(),
				imageUrl: editingImageUrl.trim(),
				categoryId: editingCategoryId,
			});

			onUpdate(product.id, updated);
			setIsEditing(false);
			toast.success("Prodotto aggiornato");
		} catch (error: any) {
			toast.error(error.response?.data?.message || "Errore nell'aggiornamento");
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
		} catch (error: any) {
			toast.error(error.response?.data?.message || "Errore nell'eliminazione");
		}
	};

	return (
		<div className="bg-white border rounded-lg overflow-hidden">
			{/* Основная информация о продукте */}
			<div className="flex items-center gap-3 p-4 hover:bg-gray-50 transition">
				{/* Изображение */}
				<ProductImagePreview
					imageUrl={isEditing ? editingImageUrl : product.imageUrl}
					alt={product.name}
					size="sm"
				/>

				{isEditing ? (
					<>
						<div className="flex-1 space-y-2">
							<Input
								value={editingName}
								onChange={(e) => setEditingName(e.target.value)}
								placeholder="Nome prodotto"
								autoFocus
							/>
							<Input
								value={editingImageUrl}
								onChange={(e) => setEditingImageUrl(e.target.value)}
								placeholder="URL immagine"
							/>
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
						<Button
							size="icon"
							variant="ghost"
							onClick={handleUpdate}
							className="text-green-600 hover:text-green-700"
						>
							<Check className="w-4 h-4" />
						</Button>
						<Button
							size="icon"
							variant="ghost"
							onClick={cancelEditing}
							className="text-gray-600 hover:text-gray-700"
						>
							<X className="w-4 h-4" />
						</Button>
					</>
				) : (
					<>
						<div className="flex-1">
							<p className="font-medium">{product.name}</p>
							<p className="text-sm text-gray-500">{product.category.name}</p>
							<p className="text-xs text-gray-400">{product.items.length} varianti</p>
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
					</>
				)}
			</div>

			{/* Варианты продукта (раскрывающиеся) */}
			{isExpanded && product.items.length > 0 && <ProductVariantsTable product={product} />}
		</div>
	);
};
