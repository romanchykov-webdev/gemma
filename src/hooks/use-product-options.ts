import { Variant } from "@/components/shared/group-variants";
import { useEffect, useState } from "react";
import { useSet } from "react-use";
import { BaseIngredient, OptimizedProductItem } from "../../@types/prisma";

interface ReturnProps {
	selectedSize: number | null;
	selectedType: number | null;
	selectedIngredients: Set<number>;
	baseIngredientsState: BaseIngredient[]; // ✅ НОВОЕ - управляемый массив
	availableSizes: Variant[];
	availableTypes: Variant[];
	currentItemId?: number;
	setSize: (size: number) => void;
	setType: (type: number) => void;
	addIngredient: (id: number) => void;
	toggleBaseIngredientDisabled: (id: number) => void; // ✅ НОВОЕ - переименовано
}

/**
 * 🎯 Универсальный хук для выбора опций продукта
 * Работает с любыми размерами и типами из справочников
 * Управляет состоянием базовых ингредиентов с флагом isDisabled
 */
export const useProductOptions = (
	items: OptimizedProductItem[],
	initialBaseIngredients?: BaseIngredient[],
): ReturnProps => {
	// Получаем первый доступный вариант для инициализации
	const firstItem = items[0];
	const initialSize = firstItem?.size?.value ?? null;
	const initialType = firstItem?.type?.value ?? null;

	const [selectedSize, setSelectedSize] = useState<number | null>(initialSize);
	const [selectedType, setSelectedType] = useState<number | null>(initialType);
	const [selectedIngredients, { toggle: addIngredient }] = useSet(new Set<number>([]));

	// ✅ НОВОЕ - состояние базовых ингредиентов с флагами isDisabled
	const [baseIngredientsState, setBaseIngredientsState] = useState<BaseIngredient[]>(initialBaseIngredients || []);

	// ✅ НОВОЕ - функция переключения флага isDisabled для базового ингредиента
	const toggleBaseIngredientDisabled = (id: number) => {
		setBaseIngredientsState((prev) =>
			prev.map((ing) => (ing.id === id ? { ...ing, isDisabled: !ing.isDisabled } : ing)),
		);
	};

	// ✅ Динамически определяем доступные размеры
	const availableSizes: Variant[] = (() => {
		// Получаем уникальные размеры из items
		const uniqueSizes = Array.from(
			new Map(
				items
					.filter((item) => item.size)
					.map((item) => [
						item.size!.value,
						{
							name: item.size!.name || `Size ${item.size!.value}`,
							value: String(item.size!.value),
						},
					]),
			).values(),
		);

		// Если выбран тип, фильтруем размеры по этому типу
		if (selectedType !== null) {
			const availableForType = items
				.filter((item) => item.type?.value === selectedType)
				.map((item) => item.size?.value);

			return uniqueSizes.map((size) => ({
				...size,
				disabled: !availableForType.includes(Number(size.value)),
			}));
		}

		return uniqueSizes;
	})();

	// ✅ Динамически определяем доступные типы
	const availableTypes: Variant[] = (() => {
		// Получаем уникальные типы из items
		const uniqueTypes = Array.from(
			new Map(
				items
					.filter((item) => item.type)
					.map((item) => [
						item.type!.value,
						{
							name: item.type!.name || `Type ${item.type!.value}`,
							value: String(item.type!.value),
						},
					]),
			).values(),
		);

		// Если выбран размер, фильтруем типы по этому размеру
		if (selectedSize !== null) {
			const availableForSize = items
				.filter((item) => item.size?.value === selectedSize)
				.map((item) => item.type?.value);

			return uniqueTypes.map((type) => ({
				...type,
				disabled: !availableForSize.includes(Number(type.value)),
			}));
		}

		return uniqueTypes;
	})();

	// ✅ Находим ID текущего выбранного варианта
	const currentItemId = items.find(
		(item) => item.type?.value === selectedType && item.size?.value === selectedSize,
	)?.id;

	// ✅ Автоматически выбираем доступный размер если текущий недоступен
	useEffect(() => {
		if (selectedSize !== null) {
			const isAvailableSize = availableSizes.find(
				(item) => Number(item.value) === selectedSize && !item.disabled,
			);
			const firstAvailableSize = availableSizes.find((item) => !item.disabled);

			if (!isAvailableSize && firstAvailableSize) {
				setSelectedSize(Number(firstAvailableSize.value));
			}
		}
	}, [selectedType, availableSizes, selectedSize]);

	// ✅ Автоматически выбираем доступный тип если текущий недоступен
	useEffect(() => {
		if (selectedType !== null) {
			const isAvailableType = availableTypes.find(
				(item) => Number(item.value) === selectedType && !item.disabled,
			);
			const firstAvailableType = availableTypes.find((item) => !item.disabled);

			if (!isAvailableType && firstAvailableType) {
				setSelectedType(Number(firstAvailableType.value));
			}
		}
	}, [selectedSize, availableTypes, selectedType]);

	return {
		selectedSize,
		selectedType,
		selectedIngredients,
		baseIngredientsState,
		availableSizes,
		availableTypes,
		currentItemId,
		setSize: setSelectedSize,
		setType: setSelectedType,
		addIngredient,
		toggleBaseIngredientDisabled,
	};
};
