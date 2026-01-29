import { z } from 'zod';

export const checkoutFormSchema = z
  .object({
    firstname: z.string().min(2, { message: 'Il nome deve contenere almeno 2 caratteri' }),
    // lastname: z.string().min(2, { message: "Il cognome deve contenere almeno 2 caratteri" }),
    lastname: z.string().optional(),
    // email: z.string().email({ message: "Inserisci un'email valida" }),
    email: z.string().optional(),
    phone: z.string().min(5, { message: 'Il telefono deve contenere almeno 5 caratteri' }),
    deliveryType: z.enum(['delivery', 'pickup']),
    address: z.string(),
    comment: z.string().optional(),
  })
  .refine(
    data => {
      // Адрес обязателен только при доставке на дом
      if (data.deliveryType === 'delivery') {
        return data.address && data.address.length >= 5;
      }
      return true;
    },
    {
      message: "L'indirizzo deve contenere almeno 5 caratteri",
      path: ['address'],
    },
  );

export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;
