"use client";

import { Button, Input } from "@/components/ui";
import { Plus } from "lucide-react";
import React, { useState } from "react";
import { CreateCategoryData } from "./category-types";

interface Props {
	onSubmit: (data: CreateCategoryData) => void;
	isCreating?: boolean;
}

export const CategoryCreateForm: React.FC<Props> = ({ onSubmit, isCreating = false }) => {
	const [name, setName] = useState("");

	const handleSubmit = () => {
		onSubmit({ name: name.trim() });
		setName("");
	};

	const isFormValid = name.trim();

	return (
		<div className="flex gap-2 items-center">
			<Input
				placeholder="Nome nuova categoria..."
				value={name}
				onChange={(e) => setName(e.target.value)}
				onKeyPress={(e) => e.key === "Enter" && isFormValid && handleSubmit()}
				disabled={isCreating}
				className="flex-1"
			/>
			<Button onClick={handleSubmit} disabled={isCreating || !isFormValid} className="h-13">
				<Plus className="w-4 h-4 mr-2" />
				Aggiungi
			</Button>
		</div>
	);
};
