"use client";

import { Button, Input } from "@/components/ui";
import { Plus } from "lucide-react";
import React, { useState } from "react";
import { toast } from "react-hot-toast";

interface Props {
	onIngredientCreated: (ingredient: any) => void;
}

export const IngredientCreateForm: React.FC<Props> = ({ onIngredientCreated }) => {
	const [isCreating, setIsCreating] = useState(false);
	const [name, setName] = useState("");
	const [price, setPrice] = useState<number>(0);
	const [imageUrl, setImageUrl] = useState("");

	const handleCreate = async () => {
		// Валидация
		if (!name.trim()) {
			toast.error("Inserisci il nome dell'ingrediente");
			return;
		}
		if (!price || price <= 0) {
			toast.error("Inserisci un prezzo valido");
			return;
		}
		if (!imageUrl.trim()) {
			toast.error("Inserisci l'URL dell'immagine");
			return;
		}

		try {
			setIsCreating(true);
			const { Api } = await import("@/../services/api-client");
			const newIngredient = await Api.ingredients_dashboard.createIngredient({
				name: name.trim(),
				price: price,
				imageUrl: imageUrl.trim(),
			});

			// Очищаем форму
			setName("");
			setPrice(0);
			setImageUrl("");

			toast.success("Ingrediente creato con successo");
			onIngredientCreated(newIngredient);
		} catch (error: any) {
			toast.error(error.response?.data?.message || "Errore nella creazione");
		} finally {
			setIsCreating(false);
		}
	};

	return (
		<div className="bg-white p-4 rounded-lg border space-y-3">
			<h3 className="font-semibold">Aggiungi nuovo ingrediente</h3>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
				<Input
					placeholder="Nome ingrediente..."
					value={name}
					onChange={(e) => setName(e.target.value)}
					disabled={isCreating}
				/>
				<Input
					type="number"
					placeholder="Prezzo (€)..."
					value={price || ""}
					onChange={(e) => setPrice(Number(e.target.value))}
					disabled={isCreating}
					min="0"
					step="0.01"
				/>
				<Input
					placeholder="URL immagine..."
					value={imageUrl}
					onChange={(e) => setImageUrl(e.target.value)}
					disabled={isCreating}
				/>
			</div>
			<Button
				onClick={handleCreate}
				disabled={isCreating || !name.trim() || !price || !imageUrl.trim()}
				className="w-full md:w-auto"
			>
				<Plus className="w-4 h-4 mr-2" />
				Aggiungi Ingrediente
			</Button>
		</div>
	);
};
