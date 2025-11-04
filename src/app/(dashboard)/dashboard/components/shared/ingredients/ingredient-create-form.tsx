"use client";

import { Button, Input } from "@/components/ui";
import { Plus } from "lucide-react";
import React, { useState } from "react";
import { CreateIngredientData } from "./ingredient-types";

interface Props {
	onSubmit: (data: CreateIngredientData) => void;
	isCreating?: boolean;
}

export const IngredientCreateForm: React.FC<Props> = ({ onSubmit, isCreating = false }) => {
	const [name, setName] = useState("");
	const [price, setPrice] = useState<number>(0);
	const [imageUrl, setImageUrl] = useState("");

	const handleSubmit = () => {
		onSubmit({
			name: name.trim(),
			price: price,
			imageUrl: imageUrl.trim(),
		});

		// Очищаем форму после успешной отправки
		setName("");
		setPrice(0);
		setImageUrl("");
	};

	const isFormValid = name.trim() && price > 0 && imageUrl.trim();

	return (
		<div className="bg-white p-4 rounded-lg border space-y-3">
			<h3 className="font-semibold">Aggiungi nuovo ingrediente</h3>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
				<Input
					placeholder="Nome ingrediente..."
					value={name}
					onChange={(e) => setName(e.target.value)}
					disabled={isCreating}
					onKeyPress={(e) => e.key === "Enter" && isFormValid && handleSubmit()}
				/>
				<Input
					type="number"
					placeholder="Prezzo (€)..."
					value={price || ""}
					onChange={(e) => setPrice(Number(e.target.value))}
					disabled={isCreating}
					min="0"
					step="0.01"
					onKeyPress={(e) => e.key === "Enter" && isFormValid && handleSubmit()}
				/>
				<Input
					placeholder="URL immagine..."
					value={imageUrl}
					onChange={(e) => setImageUrl(e.target.value)}
					disabled={isCreating}
					onKeyPress={(e) => e.key === "Enter" && isFormValid && handleSubmit()}
				/>
			</div>
			<Button onClick={handleSubmit} disabled={isCreating || !isFormValid} className="w-full md:w-auto">
				<Plus className="w-4 h-4 mr-2" />
				Aggiungi Ingrediente
			</Button>
		</div>
	);
};
