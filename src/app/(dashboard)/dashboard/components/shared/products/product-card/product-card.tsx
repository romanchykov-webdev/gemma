"use client";

import React, { useState } from "react";
import { Category, DoughType, Ingredient, Product, ProductSize, UpdateProductData } from "../product-types";
import { ProductCardView } from "./product-card-view";
import { ProductEditForm } from "./product-edit-form";

interface Props {
	product: Product;
	categories: Category[];
	ingredients: Ingredient[];
	sizes: ProductSize[];
	doughTypes: DoughType[];
	onUpdate: (id: number, data: UpdateProductData) => void;
	onDelete: (id: number) => void;
	isLoading?: boolean;
}

export const ProductCardDashboard: React.FC<Props> = ({
	product,
	categories,
	ingredients,
	sizes,
	doughTypes,
	onUpdate,
	onDelete,
	isLoading,
}) => {
	const [isEditing, setIsEditing] = useState(false);
	const [isExpanded, setIsExpanded] = useState(false);

	const handleSave = (data: UpdateProductData) => {
		onUpdate(product.id, data);
		setIsEditing(false);
	};

	const handleDelete = () => {
		if (confirm("Sei sicuro di voler eliminare questo prodotto?")) {
			onDelete(product.id);
		}
	};

	if (isEditing) {
		return (
			<ProductEditForm
				product={product}
				categories={categories}
				ingredients={ingredients}
				sizes={sizes}
				doughTypes={doughTypes}
				onSave={handleSave}
				onCancel={() => setIsEditing(false)}
			/>
		);
	}

	return (
		<ProductCardView
			product={product}
			categories={categories}
			isExpanded={isExpanded}
			onToggleExpand={() => setIsExpanded(!isExpanded)}
			onEdit={() => setIsEditing(true)}
			onDelete={handleDelete}
			isLoading={isLoading}
			//
			sizes={sizes}
			doughTypes={doughTypes}
		/>
	);
};
