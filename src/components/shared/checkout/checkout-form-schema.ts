import { z } from 'zod';

export const checkoutFormSchema = z.object({
  firstname: z.string().min(2, { message: 'Имя должно быть не менее 2-x символов' }),
  // lastname: z.string().min(2, { message: "Фамилия должно быть не менее 2-x символов" }),
  lastname: z.string().optional(),
  // email: z.string().email({ message: "Введите корректный email" }),
  email: z.string().optional(),
  phone: z.string().min(5, { message: 'Телефон должен быть не менее 5 символа' }),
  address: z.string().min(5, { message: 'Адрес должен быть не менее 5 символа' }),
  comment: z.string().optional(),
});

export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;
