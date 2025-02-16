// write zod schema: email and amount of money
import { z } from 'zod';

export const sheetSchema2 = z.object({
  items: z.array(z.object({
    email: z.string().email(),
    amount: z.number().min(1),
  })).default([{
    email: '',
    amount: 0,
  }]),
})

export const sheetSchema = z.object({
  items: z.array(z.object({
    email: z.string().email(),
    amount: z.number().min(1),
  })),
})