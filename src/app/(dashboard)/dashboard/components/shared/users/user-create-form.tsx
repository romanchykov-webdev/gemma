"use client";

import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { CreateUserData, UserRole } from "./users-types";
import { allRoles, roleLabels } from "./users-utils";

interface Props {
	isCreating: boolean;
	onSubmit: (data: CreateUserData) => Promise<void>;
}

export const UserCreateForm: React.FC<Props> = ({ isCreating, onSubmit }) => {
	const [isOpen, setIsOpen] = useState(false);
	const [fullName, setFullName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [phone, setPhone] = useState("");
	const [address, setAddress] = useState("");
	const [role, setRole] = useState<UserRole>(UserRole.USER);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const data: CreateUserData = {
			fullName: fullName.trim(),
			email: email.trim(),
			password,
			phone: phone.trim() || undefined,
			address: address.trim() || undefined,
			role,
		};

		await onSubmit(data);

		// Сброс формы
		setFullName("");
		setEmail("");
		setPassword("");
		setPhone("");
		setAddress("");
		setRole(UserRole.USER);
		setIsOpen(false);
	};

	if (!isOpen) {
		return (
			<Button onClick={() => setIsOpen(true)} className="w-full">
				+ Aggiungi Nuovo Utente
			</Button>
		);
	}

	return (
		<form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
			<h3 className="text-lg font-semibold">Nuovo Utente</h3>

			{/* Имя */}
			<div>
				<label className="block text-sm font-medium text-gray-700 mb-1">
					Nome Completo <span className="text-red-500">*</span>
				</label>
				<input
					type="text"
					value={fullName}
					onChange={(e) => setFullName(e.target.value)}
					className="w-full border rounded px-3 py-2"
					placeholder="Mario Rossi"
					required
					disabled={isCreating}
				/>
			</div>

			{/* Email */}
			<div>
				<label className="block text-sm font-medium text-gray-700 mb-1">
					Email <span className="text-red-500">*</span>
				</label>
				<input
					type="email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					className="w-full border rounded px-3 py-2"
					placeholder="mario@example.com"
					required
					disabled={isCreating}
				/>
			</div>

			{/* Пароль */}
			<div>
				<label className="block text-sm font-medium text-gray-700 mb-1">
					Password <span className="text-red-500">*</span>
				</label>
				<input
					type="password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					className="w-full border rounded px-3 py-2"
					placeholder="Minimo 6 caratteri"
					required
					minLength={6}
					disabled={isCreating}
				/>
			</div>

			{/* Телефон */}
			<div>
				<label className="block text-sm font-medium text-gray-700 mb-1">Telefono (opzionale)</label>
				<input
					type="tel"
					value={phone}
					onChange={(e) => setPhone(e.target.value)}
					className="w-full border rounded px-3 py-2"
					placeholder="+39 123 456 7890"
					disabled={isCreating}
				/>
			</div>

			{/* Адрес */}
			<div>
				<label className="block text-sm font-medium text-gray-700 mb-1">Indirizzo (opzionale)</label>
				<input
					type="text"
					value={address}
					onChange={(e) => setAddress(e.target.value)}
					className="w-full border rounded px-3 py-2"
					placeholder="Via Roma, 123, Milano"
					disabled={isCreating}
				/>
			</div>

			{/* Роль */}
			<div>
				<label className="block text-sm font-medium text-gray-700 mb-1">
					Ruolo <span className="text-red-500">*</span>
				</label>
				<select
					value={role}
					onChange={(e) => setRole(e.target.value as UserRole)}
					className="w-full border rounded px-3 py-2"
					required
					disabled={isCreating}
				>
					{allRoles.map((r) => (
						<option key={r} value={r}>
							{roleLabels[r]}
						</option>
					))}
				</select>
			</div>

			{/* Кнопки */}
			<div className="flex gap-2 pt-2">
				<Button type="submit" disabled={isCreating} className="flex-1">
					{isCreating ? "Creazione..." : "Crea Utente"}
				</Button>
				<Button type="button" onClick={() => setIsOpen(false)} variant="outline" disabled={isCreating}>
					Annulla
				</Button>
			</div>
		</form>
	);
};
