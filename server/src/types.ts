import { z } from 'zod'

export const CustomerSchema = z.object({
  name: z.string().min(1, 'Имя обязательно'),
  phone: z.string().min(1, 'Неккоретный номер'),
  address: z.string().min(3, 'Неправильный адресс'),
})

export type OrderKeys = keyof z.infer<typeof CustomerSchema>


export const OrderItemRequestSchema = z.object({
  pizzaId: z.number().int().positive(),
  size: z.string().min(1, 'Выберите размер!'),
  type: z.string().min(1, 'Выберите тип!'),
  quantity: z.number().int().positive(),
})

export type Order = z.infer<typeof OrderSchema>

export const CreateOrderRequestSchema = z.object({
  customer: CustomerSchema,
  items: z.array(OrderItemRequestSchema).min(1, 'Добавьте хотя бы одну пиццу!'),
})

export const OrderSchema = CreateOrderRequestSchema.extend({
  id: z.string().uuid(),
  createdAt: z.date().default(() => new Date()),
  status: z.enum(['pending', 'cooking', 'delivered']).default('pending'),
})


export type CreateOrderRequest = z.infer<typeof CreateOrderRequestSchema>
