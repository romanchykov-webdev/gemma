import { z } from 'zod';

export const checkoutFormSchema = z.object({
  firstname: z.string().min(2, { message: 'Il nome deve contenere almeno 2 caratteri' }),
  // lastname: z.string().min(2, { message: "Il cognome deve contenere almeno 2 caratteri" }),
  lastname: z.string().optional(),
  // email: z.string().email({ message: "Inserisci un'email valida" }),
  email: z.string().optional(),
  phone: z.string().min(5, { message: 'Il telefono deve contenere almeno 5 caratteri' }),
  address: z.string().min(5, { message: "L'indirizzo deve contenere almeno 5 caratteri" }),
  comment: z.string().optional(),
});

export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;
