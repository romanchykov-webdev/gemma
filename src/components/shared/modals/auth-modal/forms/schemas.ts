import { z } from 'zod';

export const passwordSchema = z.string().min(4, { message: 'Inserisci una password valida' });

export const formLoginSchema = z.object({
  email: z.string().email({ message: "Inserisci un'email valida" }),
  password: passwordSchema,
});

export const formRegisterSchema = formLoginSchema
  .merge(
    z.object({
      fullName: z.string().min(2, { message: 'Inserisci nome e cognome' }),
      confirmPassword: passwordSchema,
    }),
  )
  .refine(data => data.password === data.confirmPassword, {
    message: 'Le password non corrispondono',
    path: ['confirmPassword'],
  });

// Для обновления данных пользователя пороль опционален
const optionalPassword = z.union([z.literal(''), passwordSchema]).optional();

export const profileUpdateSchema = z
  .object({
    email: z.string().email({ message: "Inserisci un'email valida" }),
    fullName: z.string().min(2, { message: 'Inserisci nome e cognome' }),
    phone: z.string().optional(),
    address: z.string().optional(),
    password: optionalPassword,
    confirmPassword: optionalPassword,
  })
  .refine(
    data => !data.password || data.password.length === 0 || data.password === data.confirmPassword,
    {
      message: 'Le password non corrispondono',
      path: ['confirmPassword'],
    },
  );

export type TFormLoginValues = z.infer<typeof formLoginSchema>;
export type TFormRegisterValues = z.infer<typeof formRegisterSchema>;
export type TProfileUpdateValues = z.infer<typeof profileUpdateSchema>;
