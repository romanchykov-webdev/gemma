"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2, Mail, MapPin, Phone, ShoppingBag, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { UpdateUserData, User, UserRole } from "./users-types";
import { allRoles, formatDate, getProviderLabel, roleColors, roleLabels } from "./users-utils";

interface Props {
	user: User;
	isLoading?: boolean;
	onUpdate: (id: string, data: UpdateUserData) => Promise<void>;
	onDelete: (id: string, ordersCount: number) => Promise<void>;
}

export const UserCard: React.FC<Props> = ({ user, isLoading, onUpdate, onDelete }) => {
	const [isEditing, setIsEditing] = useState(false);
	const [editingFullName, setEditingFullName] = useState(user.fullName);
	const [editingEmail, setEditingEmail] = useState(user.email);
	const [editingPhone, setEditingPhone] = useState(user.phone || "");
	const [editingAddress, setEditingAddress] = useState(user.address || "");
	const [editingRole, setEditingRole] = useState<UserRole>(user.role);

	const handleSave = async () => {
		const updateData: UpdateUserData = {};

		if (editingFullName !== user.fullName) updateData.fullName = editingFullName;
		if (editingEmail !== user.email) updateData.email = editingEmail;
		if (editingPhone !== user.phone) updateData.phone = editingPhone || undefined;
		if (editingAddress !== user.address) updateData.address = editingAddress || undefined;
		if (editingRole !== user.role) updateData.role = editingRole;

		if (Object.keys(updateData).length === 0) {
			setIsEditing(false);
			return;
		}

		await onUpdate(user.id, updateData);
		setIsEditing(false);
	};

	const handleCancel = () => {
		setEditingFullName(user.fullName);
		setEditingEmail(user.email);
		setEditingPhone(user.phone || "");
		setEditingAddress(user.address || "");
		setEditingRole(user.role);
		setIsEditing(false);
	};

	return (
		<div
			className={cn(
				"bg-white rounded-lg shadow p-6 space-y-4 border-l-4 transition-opacity relative overflow-hidden",
				roleColors[user.role].includes("gray") && "border-l-gray-400",
				roleColors[user.role].includes("blue") && "border-l-blue-400",
				roleColors[user.role].includes("purple") && "border-l-purple-400",
				roleColors[user.role].includes("red") && "border-l-red-400",
				// isLoading && "opacity-50 pointer-events-none",
			)}
		>
			{/* Заголовок с именем и ролью */}

			{isLoading && (
				<div className="absolute top-0 left-0 w-full h-full bg-gray-500 opacity-50 flex items-center justify-center">
					<Loader2 className="animate-spin" size={50} />
				</div>
			)}
			<div className="flex items-start justify-between">
				<div className="flex-1 space-y-2">
					{isEditing ? (
						<input
							type="text"
							value={editingFullName}
							onChange={(e) => setEditingFullName(e.target.value)}
							className="w-full text-xl font-semibold border rounded px-2 py-1"
							placeholder="Nome completo"
						/>
					) : (
						<h3 className="text-xl font-semibold text-gray-800">{user.fullName}</h3>
					)}

					{/* Роль */}
					{isEditing ? (
						<select
							value={editingRole}
							onChange={(e) => setEditingRole(e.target.value as UserRole)}
							className={cn("px-3 py-1 rounded-full text-sm font-medium border", roleColors[editingRole])}
						>
							{allRoles.map((role) => (
								<option key={role} value={role}>
									{roleLabels[role]}
								</option>
							))}
						</select>
					) : (
						<span
							className={cn(
								"inline-block px-3 py-1 rounded-full text-sm font-medium border",
								roleColors[user.role],
							)}
						>
							{roleLabels[user.role]}
						</span>
					)}
				</div>

				{/* Кнопки управления */}
				<div className="flex gap-2">
					{isEditing ? (
						<>
							<Button onClick={handleSave} size="sm" disabled={isLoading}>
								Salva
							</Button>
							<Button onClick={handleCancel} size="sm" variant="outline" disabled={isLoading}>
								Annulla
							</Button>
						</>
					) : (
						<>
							<Button onClick={() => setIsEditing(true)} size="sm" variant="outline" disabled={isLoading}>
								Modifica
							</Button>
							<Button
								onClick={() => onDelete(user.id, user._count?.orders || 0)}
								size="sm"
								variant="destructive"
								disabled={isLoading}
							>
								<Trash2 className="h-4 w-4" />
							</Button>
						</>
					)}
				</div>
			</div>
			{/* Информация о пользователе */}
			<div className="space-y-3 pt-2 border-t">
				{/* Email */}
				<div className="flex items-center gap-2 text-gray-700">
					<Mail className="h-4 w-4 text-gray-400" />
					{isEditing ? (
						<input
							type="email"
							value={editingEmail}
							onChange={(e) => setEditingEmail(e.target.value)}
							className="flex-1 border rounded px-2 py-1 text-sm"
							placeholder="Email"
						/>
					) : (
						<span className="text-sm">{user.email}</span>
					)}
				</div>

				{/* Телефон */}
				<div className="flex items-center gap-2 text-gray-700">
					<Phone className="h-4 w-4 text-gray-400" />
					{isEditing ? (
						<input
							type="tel"
							value={editingPhone}
							onChange={(e) => setEditingPhone(e.target.value)}
							className="flex-1 border rounded px-2 py-1 text-sm"
							placeholder="Telefono (opzionale)"
						/>
					) : (
						<span className="text-sm">{user.phone || "Non specificato"}</span>
					)}
				</div>

				{/* Адрес */}
				<div className="flex items-center gap-2 text-gray-700">
					<MapPin className="h-4 w-4 text-gray-400" />
					{isEditing ? (
						<input
							type="text"
							value={editingAddress}
							onChange={(e) => setEditingAddress(e.target.value)}
							className="flex-1 border rounded px-2 py-1 text-sm"
							placeholder="Indirizzo (opzionale)"
						/>
					) : (
						<span className="text-sm">{user.address || "Non specificato"}</span>
					)}
				</div>

				{/* Количество заказов */}
				<div className="flex items-center gap-2 text-gray-700">
					<ShoppingBag className="h-4 w-4 text-gray-400" />
					<span className="text-sm font-medium">{user._count?.orders || 0} ordini</span>
				</div>
			</div>
			{/* Дополнительная информация */}
			<div className="flex items-center justify-between pt-2 border-t text-xs text-gray-500">
				<div className="space-y-1">
					<div>
						Provider: <span className="font-medium">{getProviderLabel(user.provider)}</span>
					</div>
					<div>
						Verificato: <span className="font-medium">{formatDate(user.verified)}</span>
					</div>
				</div>
				<div className="text-right space-y-1">
					<div>Creato: {formatDate(user.createdAt)}</div>
					<div>Aggiornato: {formatDate(user.updatedAt)}</div>
				</div>
			</div>
		</div>
	);
};
