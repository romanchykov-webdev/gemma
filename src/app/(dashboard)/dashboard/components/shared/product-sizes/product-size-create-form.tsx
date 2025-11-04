"use client";

import { Button, Input } from "@/components/ui";
import { Plus } from "lucide-react";
import React, { useState } from "react";
import { CreateProductSizeData } from "./product-size-types";

interface Props {
	onSubmit: (data: CreateProductSizeData) => void;
	isCreating?: boolean;
}

export const ProductSizeCreateForm: React.FC<Props> = ({ onSubmit, isCreating = false }) => {
	const [name, setName] = useState("");
	const [value, setValue] = useState<number>(0);
	const [sortOrder, setSortOrder] = useState<number>(0);

	const handleSubmit = () => {
		onSubmit({
			name: name.trim(),
			value: value,
			sortOrder: sortOrder,
		});

		// Очистка формы после успешного создания
		setName("");
		setValue(0);
		setSortOrder(0);
	};

	const isFormValid = name.trim() && value > 0;

	return (
		<div className="bg-white p-4 rounded-lg border space-y-3">
			<h3 className="font-semibold">Aggiungi nuova dimensione</h3>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
				<Input
					placeholder="Nome (es. Piccola, Media, Grande)..."
					value={name}
					onChange={(e) => setName(e.target.value)}
					disabled={isCreating}
					onKeyPress={(e) => e.key === "Enter" && isFormValid && handleSubmit()}
				/>
				<Input
					type="number"
					placeholder="Valore (cm)..."
					value={value || ""}
					onChange={(e) => setValue(Number(e.target.value))}
					disabled={isCreating}
					min="1"
					onKeyPress={(e) => e.key === "Enter" && isFormValid && handleSubmit()}
				/>
				<Input
					type="number"
					placeholder="Ordine..."
					value={sortOrder || ""}
					onChange={(e) => setSortOrder(Number(e.target.value))}
					disabled={isCreating}
					onKeyPress={(e) => e.key === "Enter" && isFormValid && handleSubmit()}
				/>
			</div>
			<Button onClick={handleSubmit} disabled={isCreating || !isFormValid} className="w-full md:w-auto">
				<Plus className="w-4 h-4 mr-2" />
				Aggiungi
			</Button>
		</div>
	);
};
