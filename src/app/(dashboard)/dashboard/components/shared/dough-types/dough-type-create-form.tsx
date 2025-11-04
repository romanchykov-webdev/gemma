"use client";

import { Button, Input } from "@/components/ui";
import { Plus } from "lucide-react";
import React, { useState } from "react";
import { CreateDoughTypeData } from "../dough-types/dough-type-types";

interface Props {
	onSubmit: (data: CreateDoughTypeData) => void;
	isCreating?: boolean;
}

export const DoughTypeCreateForm: React.FC<Props> = ({ onSubmit, isCreating = false }) => {
	const [name, setName] = useState("");
	const [sortOrder, setSortOrder] = useState<number>(0);

	const handleSubmit = () => {
		onSubmit({
			name: name.trim(),
			sortOrder: sortOrder,
		});

		// Очистка формы после успешного создания
		setName("");
		setSortOrder(0);
	};

	const isFormValid = name.trim();

	return (
		<div className="bg-white p-4 rounded-lg border space-y-3">
			<h3 className="font-semibold">Aggiungi nuovo tipo di impasto</h3>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
				<Input
					placeholder="Nome (es. Tradizionale, Sottile)..."
					value={name}
					onChange={(e) => setName(e.target.value)}
					disabled={isCreating}
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
			<p className="text-xs text-gray-500">💡 Il valore ID verrà generato automaticamente dalla base di dati</p>
		</div>
	);
};
