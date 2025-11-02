import { Ingredient } from "@prisma/client";
import { useEffect, useState } from "react";
import { Api } from "../../../services/api-client";

export const useProductOptionsDashboard = () => {
	const [loading, setLoading] = useState(true);
	const [ingredients, setIngredients] = useState<Ingredient[]>([]);
	const [sizes, setSizes] = useState<Array<{ id: number; name: string; value: number }>>([]);
	const [doughTypes, setDoughTypes] = useState<Array<{ id: number; name: string; value: number }>>([]);

	useEffect(() => {
		let mounted = true;

		const loadAll = async () => {
			setLoading(true);
			try {
				const [ing, sz, dt] = await Promise.all([
					Api.ingredients.getAll(),
					Api.product_sizes_dashboard.getProductSizes(),
					Api.dough_types_dashboard.getDoughTypes(),
				]);

				if (!mounted) return;

				setIngredients(ing as Ingredient[]);
				setSizes(sz.map((s) => ({ id: s.id, name: s.name, value: s.value })));
				setDoughTypes(dt.map((d) => ({ id: d.id, name: d.name, value: d.value })));
			} catch (err) {
				console.error(err);
			} finally {
				if (mounted) {
					setLoading(false);
				}
			}
		};

		loadAll();
		return () => {
			mounted = false;
		};
	}, []);

	return { loading, ingredients, sizes, doughTypes };
};
