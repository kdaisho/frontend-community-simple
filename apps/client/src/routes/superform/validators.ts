import { z } from 'zod'

export const schema = z.object({
    name: z.string().min(3),
    address: z.string().nonempty(),
    age: z.number().int().positive(),
})

export const outerSchema = z.object({
    phone: z.string().min(2),
})
