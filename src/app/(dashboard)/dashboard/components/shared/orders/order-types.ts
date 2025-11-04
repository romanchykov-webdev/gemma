// Типы для структуры заказа
export type OrderItemIngredient = {
	id: number;
	name: string;
	price: number;
	imageUrl: string;
};

export type OrderItem = {
	id: string;
	quantity: number;
	productItem: {
		id: number;
		price: number;
		product: {
			id: number;
			name: string;
			imageUrl: string;
		};
		size?: {
			id: number;
			name: string;
			value: number;
		} | null;
		doughType?: {
			id: number;
			name: string;
			value: number;
		} | null;
	};
	ingredients: OrderItemIngredient[];
};

export type Order = {
	id: string;
	fullName: string;
	email: string;
	phone: string;
	address: string;
	totalAmount: number;
	status: "PENDING" | "SUCCEEDED" | "CANCELLED";
	paymentId: string | null;
	items: OrderItem[] | unknown;
	comment: string | null;
	createdAt: Date;
	updatedAt: Date;
	userId: string | null;
};

export type OrderStatus = "PENDING" | "SUCCEEDED" | "CANCELLED";
