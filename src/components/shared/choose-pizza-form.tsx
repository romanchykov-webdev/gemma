"use client";

import { GroupVariants } from "@/components/shared/group-variants";
import { IngredientsList } from "@/components/shared/Ingredients-list";
import { ProductImage } from "@/components/shared/product-image";
import { cn } from "@/lib/utils";
import React, { useMemo } from "react";
import { Button } from "../ui/button";
import { Title } from "./title";

// ✅ НОВЫЙ импорт универсального хука
import { useProductOptions } from "@/hooks/use-product-options";
import { OptimizedIngredient, OptimizedProductItem } from "../../../@types/prisma";

interface Props {
	imageUrl: string;
	name: string;
	ingredients: OptimizedIngredient[];
	loading: boolean;
	items: OptimizedProductItem[];
	onSubmit: (
		itemId: number,
		ingredients: number[],
		totalPrice?: number,
		pizzaSize?: number | null,
		pizzaType?: number | null,
		ingredientsData?: Array<{ id: number; name: string; price: number }>,
	) => void;
	className?: string;
}

export const ChoosePizzaForm: React.FC<Props> = ({
	name,
	items,
	imageUrl,
	ingredients,
	onSubmit,
	className,
	loading,
}) => {
	// ✅ Используем новый универсальный хук
	const {
		selectedSize,
		selectedType,
		selectedIngredients,
		availableSizes,
		availableTypes,
		currentItemId,
		setSize,
		setType,
		addIngredient,
	} = useProductOptions(items);

	// ✅ Вычисляем цену
	const totalPrice = useMemo(() => {
		const currentItem = items.find((item) => item.id === currentItemId);
		if (!currentItem) return 0;

		const basePrice = currentItem.price;
		const ingredientsPrice = ingredients
			.filter((ing) => selectedIngredients.has(ing.id))
			.reduce((sum, ing) => sum + Number(ing.price), 0);

		return basePrice + ingredientsPrice;
	}, [currentItemId, items, ingredients, selectedIngredients]);

	// ✅ Определяем какие элементы UI показывать
	const uiConfig = useMemo(() => {
		const showSizeSelector = availableSizes.length > 1;
		const showTypeSelector = availableTypes.length > 1;
		const showIngredients = ingredients.length > 0;

		return {
			showSizeSelector,
			showTypeSelector,
			showIngredients,
		};
	}, [availableSizes, availableTypes, ingredients]);

	const handleClickAdd = async () => {
		if (currentItemId) {
			const selectedIngredientsData = ingredients
				.filter((ing) => selectedIngredients.has(ing.id))
				.map((ing) => ({
					id: ing.id,
					name: ing.name,
					price: Number(ing.price),
				}));

			onSubmit(
				currentItemId,
				Array.from(selectedIngredients),
				totalPrice,
				selectedSize,
				selectedType,
				selectedIngredientsData,
			);
		}
	};

	return (
		<div className={cn(className, "flex flex-col lg:flex-row flex-1 max-h-[90vh] overflow-auto")}>
			{/* Левая часть - изображение */}
			<div className="w-full lg:w-[60%] h-auto min-h-[250px] sm:min-h-[300px] md:min-h-[400px] p-4 sm:p-6 flex justify-center items-center">
				<ProductImage
					imageUrl={imageUrl}
					size={selectedSize ?? 20}
					className="w-full h-auto max-h-[250px] sm:max-h-[300px] md:max-h-[400px] object-contain"
				/>
			</div>

			{/* Правая часть - настройки */}
			<div
				className={cn(
					"w-full lg:w-[490px] bg-surface-off-white p-4 lg:p-7 overflow-auto flex flex-col",
					loading && "opacity-40 pointer-events-none",
				)}
			>
				<div className="flex-1">
					<Title text={name} size="md" className="font-extrabold mb-3" />

					{/* ✅ Выбор размера - показываем только если есть варианты */}
					{uiConfig.showSizeSelector && (
						<div className="mb-5">
							{/* <p className="text-sm text-gray-600 mb-2 font-medium">Размер:</p> */}
							<GroupVariants
								items={availableSizes}
								selectedValue={String(selectedSize)}
								onClick={(value) => setSize(Number(value))}
							/>
						</div>
					)}

					{/* ✅ Выбор типа - показываем только если есть варианты */}
					{uiConfig.showTypeSelector && (
						<div className="mb-5">
							{/* <p className="text-sm text-gray-600 mb-2 font-medium">Тип:</p> */}
							<GroupVariants
								items={availableTypes}
								selectedValue={String(selectedType)}
								onClick={(value) => setType(Number(value))}
							/>
						</div>
					)}

					{/* ✅ Ингредиенты - показываем только если есть */}
					{uiConfig.showIngredients && (
						<div className="mt-5">
							{/* <p className="text-sm text-gray-600 mb-2 font-medium">Добавить ингредиенты:</p> */}
							<div className="bg-gray-50 p-5 pb-8 rounded-md max-h-[350px] overflow-auto scrollbar">
								<IngredientsList
									ingredients={ingredients}
									onClickAdd={addIngredient}
									selectedIds={selectedIngredients}
								/>
							</div>
						</div>
					)}
				</div>

				{/* Кнопка добавления в корзину */}
				<Button
					loading={loading}
					onClick={handleClickAdd}
					disabled={!currentItemId}
					className="h-[55px] px-10 text-base rounded-[18px] w-full mt-5"
				>
					Aggiungi al carrello per {totalPrice.toFixed(2)} €
				</Button>
			</div>
		</div>
	);
};
