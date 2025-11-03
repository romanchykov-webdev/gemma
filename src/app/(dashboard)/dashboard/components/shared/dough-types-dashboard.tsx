"use client";

import { cn } from "@/lib/utils";
import React from "react";
import { useDoughTypes } from "../../hooks/use-dough-types";
import { DoughTypeCard } from "./dough-types/dough-type-card";
import { DoughTypeCreateForm } from "./dough-types/dough-type-create-form";

interface Props {
	className?: string;
}

export const DoughTypesDashboard: React.FC<Props> = ({ className }) => {
	// Hooks
	const { doughTypes, loading, isCreating, loadingDoughTypeIds, handleCreate, handleUpdate, handleDelete } =
		useDoughTypes();

	// Loading state
	if (loading) {
		return (
			<div className={cn("p-6", className)}>
				<div className="animate-pulse space-y-4">
					<div className="h-8 bg-gray-200 rounded w-1/4"></div>
					<div className="h-12 bg-gray-200 rounded"></div>
					<div className="h-12 bg-gray-200 rounded"></div>
				</div>
			</div>
		);
	}

	return (
		<div className={cn("space-y-6", className)}>
			<div>
				<h2 className="text-2xl font-bold">Gestione Tipi di Impasto</h2>
				<p className="text-gray-500 text-sm mt-1">Totale: {doughTypes.length} tipi</p>
			</div>

			<DoughTypeCreateForm onSubmit={handleCreate} isCreating={isCreating} />
			<div className="space-y-2">
				{doughTypes.length === 0 ? (
					<div className="text-center py-12 text-gray-500">
						<p>Nessun tipo di impasto trovato</p>
						<p className="text-sm mt-2">Inizia creando il tuo primo tipo di impasto</p>
					</div>
				) : (
					doughTypes.map((doughType) => (
						<DoughTypeCard
							key={doughType.id}
							doughType={doughType}
							onUpdate={handleUpdate}
							onDelete={handleDelete}
							isLoading={loadingDoughTypeIds.has(doughType.id)}
						/>
					))
				)}
			</div>
		</div>
	);
};
