"use client";
import { Button, Input } from "@/components/ui";
import { cn } from "@/lib/utils";
import { Check, ImageIcon, Pencil, Plus, Trash2, X } from "lucide-react";
import React, { JSX, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Api } from "../../../../../../services/api-client";

interface Props {
	className?: string;
}

type Category = {
	id: number;
	name: string;
};

type Product = {
	id: number;
	name: string;
	imageUrl: string;
	categoryId: number;
	category: {
		id: number;
		name: string;
	};
	items: Array<{
		id: number;
		price: number;
	}>;
};

export const ProductsAdminPanel: React.FC<Props> = ({ className }): JSX.Element => {
	//
	const [categories, setCategories] = useState<Category[]>([]);
	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

	// Состояние для редактирования
	const [editingId, setEditingId] = useState<number | null>(null);
	const [editingName, setEditingName] = useState("");
	const [editingImageUrl, setEditingImageUrl] = useState("");
	const [editingCategoryId, setEditingCategoryId] = useState<number>(0);

	// Состояние для создания
	const [isCreating, setIsCreating] = useState(false);
	const [newProductName, setNewProductName] = useState("");
	const [newProductImageUrl, setNewProductImageUrl] = useState("");
	const [newProductCategoryId, setNewProductCategoryId] = useState<number>(0);

	// Загрузка категорий при монтировании
	useEffect(() => {
		loadCategories();
	}, []);

	// Загрузка продуктов при изменении выбранной категории
	useEffect(() => {
		if (categories.length > 0) {
			loadProducts(selectedCategoryId);
		}
	}, [selectedCategoryId, categories]);

	const loadCategories = async () => {
		try {
			const data = await Api.categories.getCategories();
			setCategories(data);
			if (data.length > 0 && !newProductCategoryId) {
				setNewProductCategoryId(data[0].id);
			}
		} catch (error) {
			toast.error("Errore nel caricamento delle categorie");
			console.error(error);
		}
	};

	const loadProducts = async (categoryId: number | null) => {
		try {
			setLoading(true);
			const data = await Api.product_dashboard.getProducts(categoryId || undefined);
			setProducts(data);
		} catch (error) {
			toast.error("Errore nel caricamento dei prodotti");
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	// Создание продукта
	const handleCreate = async () => {
		if (!newProductName.trim()) {
			toast.error("Inserisci il nome del prodotto");
			return;
		}
		if (!newProductImageUrl.trim()) {
			toast.error("Inserisci l'URL dell'immagine");
			return;
		}
		if (!newProductCategoryId) {
			toast.error("Seleziona una categoria");
			return;
		}

		try {
			setIsCreating(true);
			const newProduct = await Api.product_dashboard.createProduct({
				name: newProductName.trim(),
				imageUrl: newProductImageUrl.trim(),
				categoryId: newProductCategoryId,
			});
			setProducts([newProduct, ...products]);
			setNewProductName("");
			setNewProductImageUrl("");
			toast.success("Prodotto creato con successo");
		} catch (error: any) {
			toast.error(error.response?.data?.message || "Errore nella creazione");
		} finally {
			setIsCreating(false);
		}
	};

	// Начало редактирования
	const startEditing = (product: Product) => {
		setEditingId(product.id);
		setEditingName(product.name);
		setEditingImageUrl(product.imageUrl);
		setEditingCategoryId(product.categoryId);
	};

	// Сохранение изменений
	const handleUpdate = async (id: number) => {
		if (!editingName.trim()) {
			toast.error("Il nome non può essere vuoto");
			return;
		}
		if (!editingImageUrl.trim()) {
			toast.error("L'URL dell'immagine non può essere vuoto");
			return;
		}

		try {
			const updated = await Api.product_dashboard.updateProduct(id, {
				name: editingName.trim(),
				imageUrl: editingImageUrl.trim(),
				categoryId: editingCategoryId,
			});
			setProducts(products.map((prod) => (prod.id === id ? updated : prod)));
			setEditingId(null);
			toast.success("Prodotto aggiornato");
		} catch (error: any) {
			toast.error(error.response?.data?.message || "Errore nell'aggiornamento");
		}
	};

	// Отмена редактирования
	const cancelEditing = () => {
		setEditingId(null);
		setEditingName("");
		setEditingImageUrl("");
		setEditingCategoryId(0);
	};

	// Удаление продукта
	const handleDelete = async (id: number, hasItems: boolean) => {
		if (hasItems) {
			toast.error("Impossibile eliminare. Il prodotto ha varianti");
			return;
		}

		if (!confirm("Sei sicuro di voler eliminare questo prodotto?")) {
			return;
		}

		try {
			await Api.product_dashboard.deleteProduct(id);
			setProducts(products.filter((prod) => prod.id !== id));
			toast.success("Prodotto eliminato");
		} catch (error: any) {
			toast.error(error.response?.data?.message || "Errore nell'eliminazione");
		}
	};

	if (loading && categories.length === 0) {
		return (
			<div className={cn("p-6", className)}>
				<div className="animate-pulse space-y-4">
					<div className="h-8 bg-gray-200 rounded w-1/4"></div>
					<div className="h-12 bg-gray-200 rounded"></div>
				</div>
			</div>
		);
	}
	//
	return (
		<div className={cn("space-y-6", className)}>
			{/* Заголовок и счетчик */}
			<div>
				<h2 className="text-2xl font-bold">Gestione Prodotti</h2>
				<p className="text-gray-500 text-sm mt-1">Totale: {products.length} prodotti</p>
			</div>

			{/* Фильтр по категориям */}
			<div className="flex flex-wrap gap-2">
				<Button
					variant={selectedCategoryId === null ? "default" : "outline"}
					onClick={() => setSelectedCategoryId(null)}
				>
					Tutti i prodotti
				</Button>
				{categories.map((category) => (
					<Button
						key={category.id}
						variant={selectedCategoryId === category.id ? "default" : "outline"}
						onClick={() => setSelectedCategoryId(category.id)}
					>
						{category.name}
					</Button>
				))}
			</div>

			{/* Форма создания нового продукта */}
			<div className="bg-white p-4 rounded-lg border space-y-3">
				<h3 className="font-semibold">Aggiungi nuovo prodotto</h3>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
					<Input
						placeholder="Nome prodotto..."
						value={newProductName}
						onChange={(e) => setNewProductName(e.target.value)}
						disabled={isCreating}
					/>
					<Input
						placeholder="URL immagine..."
						value={newProductImageUrl}
						onChange={(e) => setNewProductImageUrl(e.target.value)}
						disabled={isCreating}
					/>
				</div>
				<div className="flex gap-2">
					<select
						className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
						value={newProductCategoryId}
						onChange={(e) => setNewProductCategoryId(Number(e.target.value))}
						disabled={isCreating}
					>
						<option value={0}>Seleziona categoria...</option>
						{categories.map((cat) => (
							<option key={cat.id} value={cat.id}>
								{cat.name}
							</option>
						))}
					</select>
					<Button
						onClick={handleCreate}
						disabled={
							isCreating || !newProductName.trim() || !newProductImageUrl.trim() || !newProductCategoryId
						}
					>
						<Plus className="w-4 h-4 mr-2" />
						Aggiungi
					</Button>
				</div>
			</div>

			{/* Список продуктов */}
			<div className="grid grid-cols-1 gap-3">
				{loading ? (
					<div className="text-center py-8 text-gray-500">Caricamento...</div>
				) : products.length === 0 ? (
					<div className="text-center py-12 text-gray-500">
						<p>Nessun prodotto trovato</p>
						<p className="text-sm mt-2">
							{selectedCategoryId
								? "Questa categoria non contiene prodotti"
								: "Inizia creando il tuo primo prodotto"}
						</p>
					</div>
				) : (
					products.map((product) => (
						<div
							key={product.id}
							className="flex items-center gap-3 p-4 bg-white border rounded-lg hover:shadow-md transition"
						>
							{/* Изображение */}
							<div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
								{editingId === product.id && editingImageUrl ? (
									<img
										src={editingImageUrl}
										alt=""
										className="w-full h-full object-cover"
										onError={(e) => {
											e.currentTarget.style.display = "none";
										}}
									/>
								) : product.imageUrl ? (
									<img
										src={product.imageUrl}
										alt={product.name}
										className="w-full h-full object-cover"
										onError={(e) => {
											e.currentTarget.style.display = "none";
										}}
									/>
								) : (
									<ImageIcon className="w-8 h-8 text-gray-400" />
								)}
							</div>

							{editingId === product.id ? (
								<>
									<div className="flex-1 space-y-2">
										<Input
											value={editingName}
											onChange={(e) => setEditingName(e.target.value)}
											placeholder="Nome prodotto"
											autoFocus
										/>
										<Input
											value={editingImageUrl}
											onChange={(e) => setEditingImageUrl(e.target.value)}
											placeholder="URL immagine"
										/>
										<select
											className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
											value={editingCategoryId}
											onChange={(e) => setEditingCategoryId(Number(e.target.value))}
										>
											{categories.map((cat) => (
												<option key={cat.id} value={cat.id}>
													{cat.name}
												</option>
											))}
										</select>
									</div>
									<Button
										size="icon"
										variant="ghost"
										onClick={() => handleUpdate(product.id)}
										className="text-green-600 hover:text-green-700"
									>
										<Check className="w-4 h-4" />
									</Button>
									<Button
										size="icon"
										variant="ghost"
										onClick={cancelEditing}
										className="text-gray-600 hover:text-gray-700"
									>
										<X className="w-4 h-4" />
									</Button>
								</>
							) : (
								<>
									<div className="flex-1">
										<p className="font-medium">{product.name}</p>
										<p className="text-sm text-gray-500">{product.category.name}</p>
										<p className="text-xs text-gray-400">{product.items.length} varianti</p>
									</div>
									<Button
										size="icon"
										variant="ghost"
										onClick={() => startEditing(product)}
										className="text-blue-600 hover:text-blue-700"
									>
										<Pencil className="w-4 h-4" />
									</Button>
									<Button
										size="icon"
										variant="ghost"
										onClick={() => handleDelete(product.id, product.items.length > 0)}
										className="text-red-600 hover:text-red-700"
										disabled={product.items.length > 0}
									>
										<Trash2 className="w-4 h-4" />
									</Button>
								</>
							)}
						</div>
					))
				)}
			</div>
		</div>
	);
};
