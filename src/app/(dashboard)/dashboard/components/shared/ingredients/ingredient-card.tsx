"use client";

import { Button, Input } from "@/components/ui";
import { Check, Pencil, Trash2, X } from "lucide-react";
import React, { useState } from "react";
import { IngredientImagePreview } from "./ingredient-image-preview";
import { Ingredient, UpdateIngredientData } from "./ingredient-types";
import { formatPrice } from "./ingredient-utils";

interface Props {
	ingredient: Ingredient;
	onUpdate: (id: number, data: UpdateIngredientData) => void;
	onDelete: (id: number) => void;
}

export const IngredientCard: React.FC<Props> = ({ ingredient, onUpdate, onDelete }) => {
	const [isEditing, setIsEditing] = useState(false);
	const [editingName, setEditingName] = useState(ingredient.name);
	const [editingPrice, setEditingPrice] = useState(ingredient.price);
	const [editingImageUrl, setEditingImageUrl] = useState(ingredient.imageUrl);

	const startEditing = () => {
		setIsEditing(true);
		setEditingName(ingredient.name);
		setEditingPrice(ingredient.price);
		setEditingImageUrl(ingredient.imageUrl);
	};

	const cancelEditing = () => {
		setIsEditing(false);
		setEditingName(ingredient.name);
		setEditingPrice(ingredient.price);
		setEditingImageUrl(ingredient.imageUrl);
	};

	const handleUpdate = () => {
		onUpdate(ingredient.id, {
			name: editingName.trim(),
			price: editingPrice,
			imageUrl: editingImageUrl.trim(),
		});
		setIsEditing(false);
	};

	const handleDelete = () => {
		if (!confirm("Sei sicuro di voler eliminare questo ingrediente?")) {
			return;
		}
		onDelete(ingredient.id);
	};

	return (
		<div className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition">
			{isEditing ? (
				// 📝 Режим редактирования
				<div className="p-4 space-y-3">
					<IngredientImagePreview imageUrl={editingImageUrl} className="rounded-lg" />

					<Input
						value={editingName}
						onChange={(e) => setEditingName(e.target.value)}
						placeholder="Nome"
						autoFocus
					/>
					<Input
						type="number"
						value={editingPrice || ""}
						onChange={(e) => setEditingPrice(Number(e.target.value))}
						placeholder="Prezzo"
						min="0"
						step="0.01"
					/>
					<Input
						value={editingImageUrl}
						onChange={(e) => setEditingImageUrl(e.target.value)}
						placeholder="URL immagine"
					/>

					<div className="flex gap-2">
						<Button size="sm" onClick={handleUpdate} className="flex-1 bg-green-600 hover:bg-green-700">
							<Check className="w-4 h-4 mr-1" />
							Salva
						</Button>
						<Button size="sm" variant="outline" onClick={cancelEditing} className="flex-1">
							<X className="w-4 h-4 mr-1" />
							Annulla
						</Button>
					</div>
				</div>
			) : (
				// 👁️ Режим просмотра
				<>
					<IngredientImagePreview imageUrl={ingredient.imageUrl} alt={ingredient.name} />

					<div className="p-4">
						<h3 className="font-semibold text-lg mb-1">{ingredient.name}</h3>
						<p className="text-brand-primary font-bold text-xl mb-3">{formatPrice(ingredient.price)}</p>

						<div className="flex gap-2">
							<Button
								size="sm"
								variant="outline"
								onClick={startEditing}
								className="flex-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
							>
								<Pencil className="w-4 h-4 mr-1" />
								Modifica
							</Button>
							<Button
								size="sm"
								variant="outline"
								onClick={handleDelete}
								className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
							>
								<Trash2 className="w-4 h-4 mr-1" />
								Elimina
							</Button>
						</div>
					</div>
				</>
			)}
		</div>
	);
};
