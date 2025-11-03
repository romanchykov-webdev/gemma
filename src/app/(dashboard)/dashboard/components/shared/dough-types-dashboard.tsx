"use client";

import { Api } from "@/../services/api-client";
import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { DoughTypeCard } from "./dough-types/dough-type-card";
import { DoughTypeCreateForm } from "./dough-types/dough-type-create-form";
import { CreateDoughTypeData, DoughType, UpdateDoughTypeData } from "./dough-types/dough-type-types";
import { isDuplicateName, validateDoughTypeData } from "./dough-types/dough-type-utils";

interface Props {
	className?: string;
}

export const DoughTypesDashboard: React.FC<Props> = ({ className }) => {
	const [doughTypes, setDoughTypes] = useState<DoughType[]>([]);
	const [loading, setLoading] = useState(true);
	const [isCreating, setIsCreating] = useState(false);

	useEffect(() => {
		loadDoughTypes();
	}, []);

	const loadDoughTypes = async () => {
		try {
			setLoading(true);
			const data = await Api.dough_types_dashboard.getDoughTypes();
			setDoughTypes(data);
		} catch (error) {
			toast.error("Errore nel caricamento dei tipi di impasto");
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	const handleCreate = async (data: CreateDoughTypeData) => {
		// Валидация
		const validationError = validateDoughTypeData(data);
		if (validationError) {
			toast.error(validationError);
			return;
		}

		// Проверка на дубликаты
		if (isDuplicateName(data.name, doughTypes)) {
			toast.error("Esiste già un tipo di impasto con questo nome");
			return;
		}

		try {
			setIsCreating(true);
			const created = await Api.dough_types_dashboard.createDoughType(data);
			setDoughTypes([created, ...doughTypes]);
			toast.success("Tipo di impasto creato con successo");
		} catch (error: unknown) {
			const message =
				error instanceof Error && "response" in error
					? (error as { response?: { data?: { message?: string } } }).response?.data?.message
					: "Errore nella creazione";
			toast.error(message || "Errore nella creazione");
		} finally {
			setIsCreating(false);
		}
	};

	const handleUpdate = async (id: number, data: UpdateDoughTypeData) => {
		// Валидация
		const validationError = validateDoughTypeData(data);
		if (validationError) {
			toast.error(validationError);
			return;
		}

		// Проверка на дубликаты (исключая текущий элемент)
		if (isDuplicateName(data.name, doughTypes, id)) {
			toast.error("Esiste già un tipo di impasto con questo nome");
			return;
		}

		try {
			const updated = await Api.dough_types_dashboard.updateDoughType(id, data);
			setDoughTypes(doughTypes.map((dt) => (dt.id === id ? updated : dt)));
			toast.success("Tipo di impasto aggiornato");
		} catch (error: unknown) {
			const message =
				error instanceof Error && "response" in error
					? (error as { response?: { data?: { message?: string } } }).response?.data?.message
					: "Errore nell'aggiornamento";
			toast.error(message || "Errore nell'aggiornamento");
		}
	};

	const handleDelete = async (id: number) => {
		try {
			await Api.dough_types_dashboard.deleteDoughType(id);
			setDoughTypes(doughTypes.filter((dt) => dt.id !== id));
			toast.success("Tipo di impasto eliminato");
		} catch (error: unknown) {
			const message =
				error instanceof Error && "response" in error
					? (error as { response?: { data?: { message?: string } } }).response?.data?.message
					: "Errore nell'eliminazione";
			toast.error(message || "Errore nell'eliminazione");
		}
	};

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
						/>
					))
				)}
			</div>
		</div>
	);
};
