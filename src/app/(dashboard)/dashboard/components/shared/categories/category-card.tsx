"use client";

import { Button, Input } from "@/components/ui";
import { Check, Loader2, Pencil, Trash2, X } from "lucide-react";
import React, { useState } from "react";
import { Category, UpdateCategoryData } from "./category-types";

interface Props {
	category: Category;
	onUpdate: (id: number, data: UpdateCategoryData) => void;
	onDelete: (id: number, productsCount: number) => void;
	isLoading?: boolean;
}

export const CategoryCard: React.FC<Props> = ({ category, onUpdate, onDelete, isLoading = false }) => {
	const [isEditing, setIsEditing] = useState(false);
	const [editingName, setEditingName] = useState(category.name);

	const startEditing = () => {
		setIsEditing(true);
		setEditingName(category.name);
	};

	const cancelEditing = () => {
		setIsEditing(false);
		setEditingName(category.name);
	};

	const handleUpdate = () => {
		onUpdate(category.id, { name: editingName.trim() });
		setIsEditing(false);
	};

	const handleDelete = () => {
		if (!confirm("Sei sicuro di voler eliminare questa categoria?")) {
			return;
		}
		onDelete(category.id, category._count?.products || 0);
	};

	// Показываем лоадер если идет загрузка
	// if (isLoading && !isEditing) {
	// 	return (
	// 		<div className="flex items-center gap-2 p-3 bg-white border rounded-lg">
	// 			<div className="flex-1 animate-pulse">
	// 				<div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
	// 				<div className="h-4 bg-gray-200 rounded w-1/4"></div>
	// 			</div>
	// 		</div>
	// 	);
	// }

	return (
		<div className="flex items-center gap-2 p-3 bg-white border rounded-lg hover:shadow-md transition relative overflow-hidden">
			{isLoading && (
				<div className="absolute top-0 left-0 w-full h-full bg-gray-500 opacity-50 flex items-center justify-center">
					<Loader2 className="animate-spin" size={50} />
				</div>
			)}
			{isEditing ? (
				<>
					<Input
						value={editingName}
						onChange={(e) => setEditingName(e.target.value)}
						onKeyPress={(e) => e.key === "Enter" && handleUpdate()}
						className="flex-1"
						autoFocus
					/>
					<Button
						size="icon"
						variant="ghost"
						onClick={handleUpdate}
						className="text-green-600 hover:text-green-700 hover:bg-green-50"
					>
						<Check className="w-4 h-4" />
					</Button>
					<Button
						size="icon"
						variant="ghost"
						onClick={cancelEditing}
						className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
					>
						<X className="w-4 h-4" />
					</Button>
				</>
			) : (
				<>
					<div className="flex-1">
						<p className="font-medium">{category.name}</p>
						<p className="text-sm text-gray-500">{category._count?.products || 0} prodotti</p>
					</div>
					<Button
						size="icon"
						variant="ghost"
						onClick={startEditing}
						className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
					>
						<Pencil className="w-4 h-4" />
					</Button>
					<Button
						size="icon"
						variant="outline"
						onClick={handleDelete}
						className="text-red-600 hover:text-red-700 hover:bg-red-50"
					>
						<Trash2 className="w-4 h-4" />
					</Button>
				</>
			)}
		</div>
	);
};
