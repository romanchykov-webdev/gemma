import { Button } from "@/components/ui";
import { X } from "lucide-react";
import { Ingredient } from "../product-types";

interface Props {
	availableIngredients: Ingredient[];
	selectedIngredientIds: number[];
	toggleIngredient: (id: number) => void;
	showIngredients: boolean;
	setShowIngredients: (show: boolean) => void;
	isCreating: boolean;
}

export const ProductIngredientsDashboard: React.FC<Props> = ({
	availableIngredients,
	selectedIngredientIds,
	toggleIngredient,
	showIngredients,
	setShowIngredients,
	isCreating,
}) => {
	return (
		<div className="border-t pt-3">
			<div className="flex items-center justify-between mb-2">
				<span className="text-sm font-medium">
					Ingredienti {selectedIngredientIds.length > 0 && `(${selectedIngredientIds.length})`}
				</span>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={() => setShowIngredients(!showIngredients)}
					disabled={isCreating}
				>
					{showIngredients ? "Nascondi" : "Mostra"}
				</Button>
			</div>

			<div className="flex flex-wrap gap-2 mb-3">
				{selectedIngredientIds.map((id) => {
					const ingredient = availableIngredients.find((ing) => ing.id === id);
					return (
						<div
							key={id}
							className="flex items-center gap-1 bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs"
						>
							<span>{ingredient?.name}</span>
							<button type="button" onClick={() => toggleIngredient(id)} disabled={isCreating}>
								<X className="w-3 h-3" />
							</button>
						</div>
					);
				})}
			</div>

			{showIngredients && (
				<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-60 overflow-y-auto border rounded-lg p-3 bg-gray-50">
					{availableIngredients.map((ingredient) => (
						<label
							key={ingredient.id}
							className="flex items-center gap-2 p-2 hover:bg-white rounded cursor-pointer"
						>
							<input
								type="checkbox"
								checked={selectedIngredientIds.includes(ingredient.id)}
								onChange={() => toggleIngredient(ingredient.id)}
								disabled={isCreating}
							/>
							<span className="text-sm">{ingredient.name}</span>
						</label>
					))}
				</div>
			)}
		</div>
	);
};
