"use client";

import { GroupVariants } from "@/components/shared/group-variants";
import { IngredientsList } from "@/components/shared/Ingredients-list";
import { ProductImage } from "@/components/shared/product-image";
import { cn } from "@/lib/utils";
import React, { useMemo, useState } from "react";
import { Button } from "../ui/button";
import { Title } from "./title";

import { useProductOptions } from "@/hooks/use-product-options";
import { BaseIngredient, OptimizedIngredient, OptimizedProductItem } from "../../../@types/prisma";

interface Props {
	imageUrl: string;
	name: string;
	ingredients: OptimizedIngredient[]; // добавляемые ингредиенты
	baseIngredients: BaseIngredient[]; // базовые ингредиенты
	loading: boolean;
	items: OptimizedProductItem[];
	onSubmit: (
		itemId: number,
		addedIngredients: number[],
		baseIngredientsSnapshot: BaseIngredient[], // ✅ ИЗМЕНЕНО - полный массив вместо ID
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
	baseIngredients,
	onSubmit,
	className,
	loading,
}) => {
	// ✅ Используем обновленный хук с новыми полями
	const {
		selectedSize,
		selectedType,
		selectedIngredients,
		baseIngredientsState, // ✅ ИЗМЕНЕНО - управляемый массив вместо Set
		availableSizes,
		availableTypes,
		currentItemId,
		setSize,
		setType,
		addIngredient,
		toggleBaseIngredientDisabled, // ✅ ИЗМЕНЕНО - новое имя функции
	} = useProductOptions(items, baseIngredients);

	const [ingredientView, setIngredientView] = useState<"addable" | "default">("addable");

	// ✅ НОВОЕ - подготавливаем данные базовых ингредиентов для UI
	const baseIngredientsForUI = useMemo(() => {
		if (!baseIngredientsState || baseIngredientsState.length === 0) {
			return [];
		}

		return baseIngredientsState.map((baseIng) => {
			// Находим полные данные ингредиента (для цены и изображения)
			const fullIngredient = ingredients.find((ing) => ing.id === baseIng.id);

			return {
				id: baseIng.id,
				name: baseIng.name, // ✅ из baseIngredientsState
				imageUrl: baseIng.imageUrl || fullIngredient?.imageUrl || "",
				price: fullIngredient ? Number(fullIngredient.price) : 0,
				removable: baseIng.removable,
				// ✅ ВАЖНО: не передаем isDisabled, он внутри компонента
			};
		});
	}, [baseIngredientsState, ingredients]);

	// ✅ Вычисляем цену - ТОЛЬКО добавленные ингредиенты влияют на цену
	const totalPrice = useMemo(() => {
		const currentItem = items.find((item) => item.id === currentItemId);
		if (!currentItem) return 0;

		const basePrice = currentItem.price;

		// Цена добавленных ингредиентов
		const addedIngredientsPrice = ingredients
			.filter((ing) => selectedIngredients.has(ing.id))
			.reduce((sum, ing) => sum + Number(ing.price), 0);

		// ✅ Удаленные базовые ингредиенты НЕ влияют на цену
		return basePrice + addedIngredientsPrice;
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

	// ✅ ИЗМЕНЕНО - обработчик добавления в корзину
	const handleClickAdd = async () => {
		if (currentItemId) {
			const selectedIngredientsData = ingredients
				.filter((ing) => selectedIngredients.has(ing.id))
				.map((ing) => ({
					id: ing.id,
					name: ing.name,
					price: Number(ing.price),
				}));

			// ✅ ИЗМЕНЕНО - передаем полный массив baseIngredientsState
			onSubmit(
				currentItemId,
				Array.from(selectedIngredients),
				baseIngredientsState, // ✅ полный snapshot с флагами isDisabled
				totalPrice,
				selectedSize,
				selectedType,
				selectedIngredientsData,
			);
		}
	};

	// console.log("ChoosePizzaForm ingredientView", ingredientView);
	// console.log("ChoosePizzaForm ingredients", ingredients);
	// console.log("ChoosePizzaForm baseIngredientsForUI", baseIngredientsForUI);

	return (
		<div className={cn(className, "flex flex-col justify-center lg:flex-row flex-1 max-h-[90vh] overflow-auto")}>
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

					{/* Выбор размера */}
					{uiConfig.showSizeSelector && (
						<div className="mb-5">
							<GroupVariants
								items={availableSizes}
								selectedValue={String(selectedSize)}
								onClick={(value) => setSize(Number(value))}
							/>
						</div>
					)}

					{/* Выбор типа или теста */}
					{uiConfig.showTypeSelector && (
						<div className="mb-5">
							<GroupVariants
								items={availableTypes}
								selectedValue={String(selectedType)}
								onClick={(value) => setType(Number(value))}
							/>
						</div>
					)}

					{/* ✅ Переключатель режима просмотра ингредиентов */}
					{/* Показываем только если есть ОБА типа ингредиентов */}
					{ingredients.length > 0 && baseIngredientsForUI.length > 0 && (
						<div className="mb-3">
							<GroupVariants
								items={[
									{ name: "Aggiungi", value: "addable" },
									{ name: "Base", value: "default" },
								]}
								selectedValue={ingredientView}
								onClick={(value) => setIngredientView(value as "addable" | "default")}
							/>
						</div>
					)}

					{/* ✅ Ингредиенты */}
					{ingredientView === "addable" ? (
						// Дополнительные ингредиенты (можно добавить)
						<IngredientsList
							ingredients={ingredients}
							onClickAdd={addIngredient}
							selectedIds={selectedIngredients}
						/>
					) : (
						// ✅ ИЗМЕНЕНО - Базовые ингредиенты (можно удалить)
						<IngredientsList
							ingredients={baseIngredientsForUI}
							onClickAdd={toggleBaseIngredientDisabled}
							// ✅ ИЗМЕНЕНО - показываем как active те, у которых isDisabled = false
							selectedIds={
								new Set(baseIngredientsState.filter((ing) => !ing.isDisabled).map((ing) => ing.id))
							}
						/>
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
