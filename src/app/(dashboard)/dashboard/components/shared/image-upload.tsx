"use client";

import { Button } from "@/components/ui/button";
import { Loader2, Upload } from "lucide-react";
import React, { useRef, useState } from "react";
import { uploadImage } from "../../lib/supabase";
interface Props {
	imageUrl: string;
	onImageChange: (url: string) => void;
	folder: string;
	label?: string;
	required?: boolean;
	disabled?: boolean;
	isUploading: boolean;
	setIsUploading: (isUploading: boolean) => void;
}

export const ImageUpload: React.FC<Props> = ({
	imageUrl,
	onImageChange,
	folder,
	label = "Изображение",
	required = false,
	disabled = false,
	isUploading,
	setIsUploading,
}) => {
	// const [isUploading, setIsUploading] = useState(false);
	const [previewUrl, setPreviewUrl] = useState(imageUrl);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		try {
			setIsUploading(true);

			const url = await uploadImage(file, folder);

			if (url) {
				setPreviewUrl(url);
				onImageChange(url);
			} else {
				alert("Ошибка загрузки изображения");
			}
		} catch (error) {
			console.error("[IMAGE_UPLOAD] Ошибка:", error);
			alert("Ошибка загрузки изображения");
		} finally {
			setIsUploading(false);
		}
	};

	// const handleRemove = () => {
	// 	setPreviewUrl("");
	// 	onImageChange("");
	// 	if (fileInputRef.current) {
	// 		fileInputRef.current.value = "";
	// 	}
	// };

	return (
		<div className="space-y-2">
			<label className="block text-sm font-medium text-gray-700">
				{label} {required && <span className="text-red-500">*</span>}
			</label>

			{/* Preview */}
			{/* {previewUrl 
			? (
				<div className="relative w-full h-40 border rounded overflow-hidden bg-gray-100">
					<img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
					<Button
						type="button"
						onClick={handleRemove}
						size="sm"
						variant="destructive"
						className="absolute top-2 right-2"
						disabled={disabled || isUploading}
					>
						<X className="h-4 w-4" />
					</Button>
				</div>
			) : 
			(
				<div className="border-2 border-dashed rounded p-8 text-center">
					<Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
					<p className="text-sm text-gray-500">Выберите изображение</p>
				</div>
			)} */}

			{/* File Input */}
			<input
				ref={fileInputRef}
				type="file"
				accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
				onChange={handleFileSelect}
				className="hidden"
				disabled={disabled || isUploading}
			/>

			{/* Upload Button */}
			<Button
				type="button"
				onClick={() => fileInputRef.current?.click()}
				variant="outline"
				className="w-full"
				disabled={disabled || isUploading}
			>
				{isUploading ? (
					<>
						<Loader2 className="h-4 w-4 mr-2 animate-spin" />
						Loading...
					</>
				) : (
					<>
						<Upload className="h-4 w-4 mr-2" />
						{previewUrl ? "Change image" : "Upload image"}
					</>
				)}
			</Button>

			<p className="text-xs text-gray-500">Format: JPG, PNG, WebP, GIF.</p>
		</div>
	);
};
