"use client";

import { Button, Input } from "@/components/ui";
import { ImageIcon, Plus, X } from "lucide-react";
import React, { useState } from "react";
import { ImageUpload } from "../image-upload";
import { CreateIngredientData } from "./ingredient-types";

interface Props {
	onSubmit: (data: CreateIngredientData) => void;
	isCreating?: boolean;
}

export const IngredientCreateForm: React.FC<Props> = ({ onSubmit, isCreating = false }) => {
	const [name, setName] = useState("");
	const [price, setPrice] = useState<number>(0);
	const [imageUrl, setImageUrl] = useState("");
	const [isUploading, setIsUploading] = useState(false);

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
	const upLoading = (item: string) => {
		setImageUrl(item);
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
					onChange={(e) => upLoading(e.target.value)}
					disabled={isCreating}
					onKeyPress={(e) => e.key === "Enter" && isFormValid && handleSubmit()}
				/>
				<ImageUpload
					imageUrl={imageUrl}
					onImageChange={setImageUrl}
					folder="products"
					label="Immagine prodotto"
					required
					isUploading={isUploading}
					setIsUploading={setIsUploading}
				/>
				<div>
					{/* Preview */}
					<div className="flex items-center justify-center ">
						{imageUrl ? (
							<div className="relative flex p-5 w-full item-center justify-center h-60 border rounded overflow-hidden bg-gray-100">
								<img src={imageUrl} alt="Preview" className=" h-50 object-cover" />
								<Button
									type="button"
									onClick={() => setImageUrl("")}
									size="sm"
									variant="destructive"
									className="absolute top-2 right-2"
									// disabled={disabled || isUploading}
								>
									<X className="h-4 w-4" />
								</Button>
							</div>
						) : (
							<div className="border-2 border-dashed w-full h-full flex flex-col items-center justify-center rounded p-8 text-center">
								<ImageIcon className="h-8 w-8 mx-auto text-gray-400 mb-2" />
								<p className="text-sm text-gray-500">Preview image</p>
							</div>
						)}
					</div>
				</div>
			</div>
			<Button onClick={handleSubmit} disabled={isCreating || !isFormValid} className="w-full md:w-auto">
				<Plus className="w-4 h-4 mr-2" />
				Aggiungi Ingrediente
			</Button>
		</div>
	);
};
