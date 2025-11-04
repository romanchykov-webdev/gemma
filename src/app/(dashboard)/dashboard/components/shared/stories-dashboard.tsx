"use client";

import { cn } from "@/lib/utils";
import React, { JSX } from "react";
import { useStories } from "../../hooks/use-stories";
import { StoryCard } from "./stories/stories-card";
import { StoryCreateForm } from "./stories/stories-create-form";

interface Props {
	className?: string;
}

export const StoriesDashboard: React.FC<Props> = ({ className }): JSX.Element => {
	const { stories, loading, isCreating, loadingStoryIds, handleCreate, handleUpdate, handleDelete } = useStories();

	if (loading) {
		return (
			<div className={cn("p-6", className)}>
				<h2 className="text-2xl font-bold mb-6">Gestione Storie</h2>
				<div className="flex items-center justify-center h-64">
					<div className="text-center">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
						<p className="text-gray-600">Caricamento storie...</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className={cn("p-6 space-y-6", className)}>
			{/* Заголовок */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold">Gestione Storie</h2>
					<p className="text-gray-600 mt-1">
						Totale: {stories.length} {stories.length === 1 ? "storia" : "storie"}
					</p>
				</div>
			</div>

			{/* Форма создания */}
			<StoryCreateForm isCreating={isCreating} onSubmit={handleCreate} />

			{/* Список историй */}
			{stories.length === 0 ? (
				<div className="bg-white rounded-lg shadow p-12 text-center">
					<p className="text-gray-500 text-lg">Nessuna storia trovata</p>
					<p className="text-gray-400 text-sm mt-2">Crea la tua prima storia usando il modulo sopra</p>
				</div>
			) : (
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{stories.map((story) => (
						<StoryCard
							key={story.id}
							story={story}
							isLoading={loadingStoryIds.has(story.id)}
							onUpdate={handleUpdate}
							onDelete={handleDelete}
						/>
					))}
				</div>
			)}
		</div>
	);
};
