"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Film, Image as ImageIcon, Loader2, Plus, Trash2, X } from "lucide-react";
// import Image from "next/image";
import React, { useState } from "react";
import { Story, UpdateStoryData } from "./stories-types";
import { formatDate, getFileType } from "./stories-utils";

interface Props {
	story: Story;
	isLoading?: boolean;
	onUpdate: (id: number, data: UpdateStoryData) => Promise<void>;
	onDelete: (id: number) => Promise<void>;
}

export const StoryCard: React.FC<Props> = ({ story, isLoading, onUpdate, onDelete }) => {
	const [isEditing, setIsEditing] = useState(false);
	const [editingPreviewUrl, setEditingPreviewUrl] = useState(story.previewImageUrl);
	const [editingItems, setEditingItems] = useState<{ sourceUrl: string }[]>(
		story.items.map((item) => ({ sourceUrl: item.sourceUrl })),
	);

	const handleSave = async () => {
		const updateData: UpdateStoryData = {};

		// // Проверяем изменения
		// if (editingPreviewUrl !== story.previewImageUrl) {
		// 	updateData.previewImageUrl = editingPreviewUrl;
		// }

		// // Проверяем изменения в items
		// const itemsChanged =
		// 	editingItems.length !== story.items.length ||
		// 	editingItems.some((item, index) => item.sourceUrl !== story.items[index]?.sourceUrl);

		// if (itemsChanged) {
		// 	updateData.items = editingItems;
		// }

		// if (Object.keys(updateData).length === 0) {
		// 	setIsEditing(false);
		// 	return;
		// }

		await onUpdate(story.id, updateData);
		setIsEditing(false);
	};

	const handleCancel = () => {
		setEditingPreviewUrl(story.previewImageUrl);
		setEditingItems(story.items.map((item) => ({ sourceUrl: item.sourceUrl })));
		setIsEditing(false);
	};

	const addItem = () => {
		setEditingItems([...editingItems, { sourceUrl: "" }]);
	};

	const removeItem = (index: number) => {
		setEditingItems(editingItems.filter((_, i) => i !== index));
	};

	const updateItem = (index: number, sourceUrl: string) => {
		const newItems = [...editingItems];
		newItems[index] = { sourceUrl };
		setEditingItems(newItems);
	};

	return (
		<div
			className={cn(
				"bg-white rounded-lg shadow p-6 space-y-4 transition-opacity relative",
				isLoading && "pointer-events-none",
			)}
		>
			{/* Loader */}
			{isLoading && (
				<div className="absolute top-0 left-0 w-full h-full bg-white/80 flex items-center justify-center z-50 rounded-lg">
					<div className="text-center">
						<Loader2 className="animate-spin text-neutral-600 mx-auto mb-2" size={40} />
					</div>
				</div>
			)}

			{/* Заголовок */}
			<div className="flex items-start justify-between">
				<div className="flex-1">
					<h3 className="text-lg font-semibold text-gray-800">Storia #{story.id}</h3>
					<p className="text-sm text-gray-500 mt-1">
						{story._count?.items || story.items.length} elementi • Creato: {formatDate(story.createdAt)}
					</p>
				</div>

				{/* Кнопки управления */}
				<div className="flex gap-2">
					{isEditing ? (
						<>
							<Button onClick={handleSave} size="sm" disabled={isLoading}>
								Salva
							</Button>
							<Button onClick={handleCancel} size="sm" variant="outline" disabled={isLoading}>
								Annulla
							</Button>
						</>
					) : (
						<>
							<Button onClick={() => setIsEditing(true)} size="sm" variant="outline" disabled={isLoading}>
								Modifica
							</Button>
							<Button
								onClick={() => onDelete(story.id)}
								size="sm"
								variant="destructive"
								disabled={isLoading}
							>
								<Trash2 className="h-4 w-4" />
							</Button>
						</>
					)}
				</div>
			</div>

			{/* Preview Image */}
			<div className="border-t pt-4">
				<div className="flex items-center gap-2 mb-2">
					<ImageIcon className="h-4 w-4 text-gray-400" />
					<label className="text-sm font-medium text-gray-700">Immagine di anteprima</label>
				</div>

				{isEditing ? (
					<div className="space-y-2">
						<input
							type="url"
							value={editingPreviewUrl}
							onChange={(e) => setEditingPreviewUrl(e.target.value)}
							className="w-full border rounded px-3 py-2 text-sm"
							placeholder="https://example.com/preview.jpg"
						/>
						{/* Превью в режиме редактирования */}
						{editingPreviewUrl && (
							<div className="relative w-full h-40 rounded border overflow-hidden bg-gray-100">
								{/* <Image
									src={editingPreviewUrl}
									alt="Preview edit"
									fill
									className="object-cover"
									onError={(e) => {
										console.error("Failed to load preview:", editingPreviewUrl);
									}}
								/> */}
								<img
									src={story.previewImageUrl}
									alt={`Story ${story.id} preview`}
									className="w-full h-40 object-cover"
									onError={(e) => {
										console.error("Failed to load preview:", story.previewImageUrl);
										e.currentTarget.src = "/assets/images/not-found.png";
									}}
								/>
							</div>
						)}
					</div>
				) : (
					<div className="relative group w-full h-40 rounded border overflow-hidden">
						{/* <Image
							src={story.previewImageUrl}
							alt={`Story ${story.id} preview`}
							fill
							className="object-cover"
							onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
								console.error("Failed to load preview:", story.previewImageUrl);
								e.currentTarget.src = "/assets/images/not-found.png";
							}}
						/> */}
						<img
							src={story.previewImageUrl}
							alt={`Story ${story.id} preview`}
							className="w-full h-40 object-cover"
							onError={(e) => {
								console.error("Failed to load preview:", story.previewImageUrl);
								e.currentTarget.src = "/assets/images/not-found.png";
							}}
						/>
						<div className="absolute inset-0   group-hover:bg-neutral-600/70 cursor-pointer transition-all duration-300 flex items-center justify-center">
							<a
								href={story.previewImageUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="text-white opacity-0 group-hover:opacity-100 duration-300 text-sm underline"
							>
								Visualizza originale
							</a>
						</div>
					</div>
				)}
			</div>

			{/* Story Items */}
			<div className="border-t pt-4">
				<div className="flex items-center justify-between mb-3">
					<div className="flex items-center gap-2">
						<Film className="h-4 w-4 text-gray-400" />
						<label className="text-sm font-medium text-gray-700">Elementi della storia</label>
					</div>
					{isEditing && (
						<Button onClick={addItem} size="sm" variant="outline" disabled={isLoading}>
							<Plus className="h-4 w-4 mr-1" />
							Aggiungi
						</Button>
					)}
				</div>

				<div className="space-y-3">
					{isEditing
						? editingItems.map((item, index) => {
								const fileType = getFileType(item.sourceUrl);
								return (
									<div key={index} className="space-y-2 p-3 border rounded bg-gray-50">
										<div className="flex items-center gap-2">
											<span className="text-sm font-medium text-gray-500 min-w-[30px]">
												{index + 1}.
											</span>
											<input
												type="url"
												value={item.sourceUrl}
												onChange={(e) => updateItem(index, e.target.value)}
												className="flex-1 border rounded px-3 py-2 text-sm bg-white"
												placeholder="https://example.com/media.jpg"
											/>
											<Button
												onClick={() => removeItem(index)}
												size="sm"
												variant="ghost"
												disabled={editingItems.length === 1}
											>
												<X className="h-4 w-4 text-red-500" />
											</Button>
										</div>

										{/* Превью в режиме редактирования */}
										{item.sourceUrl && (
											<div className="relative w-full h-32 rounded border overflow-hidden bg-gray-100 ml-[38px]">
												{fileType === "image" ? (
													// <Image
													// 	src={item.sourceUrl}
													// 	alt={`Edit preview ${index + 1}`}
													// 	fill
													// 	className="object-cover"
													// 	onError={(e) => {
													// 		console.error("Failed to load item:", item.sourceUrl);
													// 	}}
													// />
													<img
														src={item.sourceUrl}
														alt={`Story ${story.id} item ${index + 1}`}
														className="w-full h-32 object-cover"
														onError={(e) => {
															console.error("Failed to load item:", item.sourceUrl);
															e.currentTarget.src = "/assets/images/not-found.png";
														}}
													/>
												) : (
													<div className="w-full h-full flex items-center justify-center bg-gray-200">
														<span className="text-gray-500 text-sm">URL non valido</span>
													</div>
												)}
											</div>
										)}
									</div>
								);
							})
						: story.items.map((item, index) => {
								const fileType = getFileType(item.sourceUrl);
								return (
									<div key={item.id} className="flex items-start gap-3 p-3 border rounded bg-gray-50">
										<span className="text-sm font-medium text-gray-500 min-w-[30px] mt-1">
											{index + 1}.
										</span>
										<div className="flex-1 space-y-2">
											{/* Тип файла */}
											<div className="flex items-center gap-2">
												{fileType === "image" ? (
													<ImageIcon className="h-4 w-4 text-blue-500" />
												) : fileType === "video" ? (
													<Film className="h-4 w-4 text-purple-500" />
												) : (
													<Film className="h-4 w-4 text-gray-500" />
												)}
												<span className="text-sm font-medium capitalize">{fileType}</span>
											</div>

											{/* Превью медиа */}
											<div className="relative group w-full h-32 rounded border overflow-hidden bg-gray-100">
												{fileType === "image" ? (
													// <Image
													// 	src={item.sourceUrl}
													// 	alt={`Story item ${index + 1}`}
													// 	fill
													// 	className="object-cover"
													// 	onError={(e) => {
													// 		console.error("Failed to load item:", item.sourceUrl);
													// 	}}
													// />
													<img
														src={item.sourceUrl}
														alt={`Story ${story.id} preview`}
														className="w-full h-40 object-cover"
														onError={(e) => {
															console.error(
																"Failed to load preview:",
																story.previewImageUrl,
															);
															e.currentTarget.src = "/assets/images/not-found.png";
														}}
													/>
												) : fileType === "video" ? (
													<video
														src={item.sourceUrl}
														className="w-full h-full object-cover"
														controls
														preload="metadata"
														onError={(e) => {
															console.error("Failed to load video:", item.sourceUrl);
														}}
													>
														Il tuo browser non supporta il tag video.
													</video>
												) : (
													<div className="w-full h-full flex items-center justify-center bg-gray-200">
														<span className="text-gray-500 text-sm">
															Formato sconosciuto
														</span>
													</div>
												)}

												{/* Hover оверлей для открытия в новой вкладке */}
												{fileType === "image" && (
													<div className="absolute inset-0  group-hover:bg-neutral-600/70 cursor-pointer transition-all duration-300 flex items-center justify-center">
														<a
															href={item.sourceUrl}
															target="_blank"
															rel="noopener noreferrer"
															className="text-white opacity-0 group-hover:opacity-100  duration-300 text-sm underline font-medium"
														>
															Visualizza originale
														</a>
													</div>
												)}
											</div>

											{/* URL ссылка */}
											<a
												href={item.sourceUrl}
												target="_blank"
												rel="noopener noreferrer"
												className="text-xs text-blue-600 hover:underline break-all block"
											>
												{item.sourceUrl.length > 60
													? item.sourceUrl.substring(0, 60) + "..."
													: item.sourceUrl}
											</a>
										</div>
									</div>
								);
							})}
				</div>
			</div>
		</div>
	);
};
