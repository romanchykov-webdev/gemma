import { z } from "zod";

export const passwordSchema = z.string().min(4, { message: "Введите корректный пароль" });

export const formLoginSchema = z.object({
	email: z.string().email({ message: "Введите корректную почту" }),
	password: passwordSchema,
});

export const formRegisterSchema = formLoginSchema
	.merge(
		z.object({
			fullName: z.string().min(2, { message: "Введите имя и фамилию" }),
			confirmPassword: passwordSchema,
		}),
	)
	.refine((data) => data.password === data.confirmPassword, {
		message: "Пароли не совпадают",
		path: ["confirmPassword"],
	});

// Для обновления данных пользователя пороль опционален
const optionalPassword = z.union([z.literal(""), passwordSchema]).optional();

export const profileUpdateSchema = z
	.object({
		email: z.string().email({ message: "Введите корректную почту" }),
		fullName: z.string().min(2, { message: "Введите имя и фамилию" }),
		phone: z.string().optional(),
		address: z.string().optional(),
		password: optionalPassword,
		confirmPassword: optionalPassword,
	})
	.refine((data) => !data.password || data.password.length === 0 || data.password === data.confirmPassword, {
		message: "Пароли не совпадают",
		path: ["confirmPassword"],
	});

export type TFormLoginValues = z.infer<typeof formLoginSchema>;
export type TFormRegisterValues = z.infer<typeof formRegisterSchema>;
export type TProfileUpdateValues = z.infer<typeof profileUpdateSchema>;
