// Роли пользователей
export enum UserRole {
	USER = "USER",
	ADMIN = "ADMIN",
	CONTENT_MAKER = "CONTENT_MAKER",
	OWNER = "OWNER",
}

// Основной тип пользователя
export type User = {
	id: string;
	fullName: string;
	email: string;
	phone: string | null;
	address: string | null;
	role: UserRole;
	provider: string | null;
	verified: Date | null;
	createdAt: Date;
	updatedAt: Date;
	_count?: {
		orders: number;
	};
};

// Тип для создания пользователя
export type CreateUserData = {
	fullName: string;
	email: string;
	password: string;
	phone?: string;
	address?: string;
	role: UserRole;
};

// Тип для обновления пользователя
export type UpdateUserData = {
	fullName?: string;
	email?: string;
	phone?: string;
	address?: string;
	role?: UserRole;
};

// Тип для изменения роли
export type UpdateUserRoleData = {
	role: UserRole;
};
