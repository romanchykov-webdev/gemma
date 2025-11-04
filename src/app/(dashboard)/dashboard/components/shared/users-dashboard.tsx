"use client";

import { cn } from "@/lib/utils";
import React, { JSX } from "react";
import { useUsers } from "../../hooks/use-users";
import { UserCard } from "./users/user-card";
import { UserCreateForm } from "./users/user-create-form";

interface Props {
	className?: string;
}

export const UsersDashboard: React.FC<Props> = ({ className }): JSX.Element => {
	const { users, loading, isCreating, loadingUserIds, handleCreate, handleUpdate, handleDelete } = useUsers();

	if (loading) {
		return (
			<div className={cn("p-6", className)}>
				<h2 className="text-2xl font-bold mb-6">Gestione Utenti</h2>
				<div className="flex items-center justify-center h-64">
					<div className="text-center">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
						<p className="text-gray-600">Caricamento utenti...</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className={cn("p-6 space-y-6", className)}>
			{/* Заголовок */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold">Gestione Utenti</h2>
					<p className="text-gray-600 mt-1">
						Totale: {users.length} {users.length === 1 ? "utente" : "utenti"}
					</p>
				</div>
			</div>

			{/* Форма создания */}
			<UserCreateForm isCreating={isCreating} onSubmit={handleCreate} />

			{/* Список пользователей */}
			{users.length === 0 ? (
				<div className="bg-white rounded-lg shadow p-12 text-center">
					<p className="text-gray-500 text-lg">Nessun utente trovato</p>
				</div>
			) : (
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{users.map((user) => (
						<UserCard
							key={user.id}
							user={user}
							isLoading={loadingUserIds.has(user.id)}
							onUpdate={handleUpdate}
							onDelete={handleDelete}
						/>
					))}
				</div>
			)}
		</div>
	);
};
