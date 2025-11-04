import {
	CreateUserData,
	UpdateUserData,
	User,
} from "../../src/app/(dashboard)/dashboard/components/shared/users/users-types";
import { axiosInstance } from "../instance";

export const getUsers = async (): Promise<User[]> => {
	const { data } = await axiosInstance.get<User[]>("/dashboaed/users");
	return data;
};

export const createUser = async (userData: CreateUserData): Promise<User> => {
	const { data } = await axiosInstance.post<User>("/dashboaed/users", userData);
	return data;
};

export const updateUser = async (id: string, userData: UpdateUserData): Promise<User> => {
	const { data } = await axiosInstance.patch<User>(`/dashboaed/users/${id}`, userData);
	return data;
};

export const deleteUser = async (id: string): Promise<void> => {
	await axiosInstance.delete(`/dashboaed/users/${id}`);
};
