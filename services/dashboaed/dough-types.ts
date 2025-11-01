import { axiosInstance } from "../instance";

export type DoughType = {
	id: number;
	name: string;
	value: number;
	sortOrder: number;
	_count?: {
		productItems: number;
	};
};

export const getDoughTypes = async (): Promise<DoughType[]> => {
	const { data } = await axiosInstance.get<DoughType[]>("/dashboaed/dough-types");
	return data;
};

// 🔥 ОБНОВЛЕНО: без value
export const createDoughType = async (typeData: { name: string; sortOrder?: number }): Promise<DoughType> => {
	const { data } = await axiosInstance.post<DoughType>("/dashboaed/dough-types", typeData);
	return data;
};

// 🔥 ОБНОВЛЕНО: без value
export const updateDoughType = async (
	id: number,
	typeData: {
		name?: string;
		sortOrder?: number;
	},
): Promise<DoughType> => {
	const { data } = await axiosInstance.patch<DoughType>(`/dashboaed/dough-types/${id}`, typeData);
	return data;
};

export const deleteDoughType = async (id: number): Promise<void> => {
	await axiosInstance.delete(`/dashboaed/dough-types/${id}`);
};
