"use client";

import { Button, Input } from "@/components/ui";
import { Check, Pencil, Trash2, X } from "lucide-react";
import React, { useState } from "react";
import { DoughType, UpdateDoughTypeData } from "../dough-types/dough-type-types";

interface Props {
	doughType: DoughType;
	onUpdate: (id: number, data: UpdateDoughTypeData) => void;
	onDelete: (id: number) => void;
}

export const DoughTypeCard: React.FC<Props> = ({ doughType, onUpdate, onDelete }) => {
	const [isEditing, setIsEditing] = useState(false);
	const [editingName, setEditingName] = useState(doughType.name);
	const [editingSortOrder, setEditingSortOrder] = useState(doughType.sortOrder);

	const startEditing = () => {
		setIsEditing(true);
		setEditingName(doughType.name);
		setEditingSortOrder(doughType.sortOrder);
	};

	const cancelEditing = () => {
		setIsEditing(false);
		setEditingName(doughType.name);
		setEditingSortOrder(doughType.sortOrder);
	};

	const handleUpdate = () => {
		onUpdate(doughType.id, {
			name: editingName.trim(),
			sortOrder: editingSortOrder,
		});
		setIsEditing(false);
	};

	const handleDelete = () => {
		if (!confirm("Sei sicuro di voler eliminare questo tipo di impasto?")) {
			return;
		}
		onDelete(doughType.id);
	};

	return (
		<div className="bg-white border rounded-lg p-4">
			{isEditing ? (
				<div className="flex gap-3 items-center">
					<Input
						value={editingName}
						onChange={(e) => setEditingName(e.target.value)}
						placeholder="Nome"
						className="flex-1"
						autoFocus
					/>
					<Input
						type="number"
						value={editingSortOrder || ""}
						onChange={(e) => setEditingSortOrder(Number(e.target.value))}
						placeholder="Ordine"
						className="w-32"
					/>
					<div className="text-sm text-gray-600 w-24 text-center">
						ID: <span className="font-mono font-semibold">{doughType.value}</span>
					</div>
					<Button size="sm" onClick={handleUpdate} className="bg-green-600 hover:bg-green-700">
						<Check className="w-4 h-4" />
					</Button>
					<Button size="sm" variant="outline" onClick={cancelEditing}>
						<X className="w-4 h-4" />
					</Button>
				</div>
			) : (
				<div className="flex items-center justify-between">
					<div className="flex-1">
						<h3 className="font-semibold text-lg">{doughType.name}</h3>
						<p className="text-sm text-gray-600">
							Valore ID: <span className="font-mono font-semibold">{doughType.value}</span> • Ordine:{" "}
							{doughType.sortOrder}
						</p>
					</div>
					<div className="flex gap-2">
						<Button
							size="sm"
							variant="outline"
							onClick={startEditing}
							className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
						>
							<Pencil className="w-4 h-4 mr-1" />
							Modifica
						</Button>
						<Button
							size="sm"
							variant="outline"
							onClick={handleDelete}
							className="text-red-600 hover:text-red-700 hover:bg-red-50"
						>
							<Trash2 className="w-4 h-4 mr-1" />
							Elimina
						</Button>
					</div>
				</div>
			)}
		</div>
	);
};
