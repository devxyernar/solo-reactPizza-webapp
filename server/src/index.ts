import express from 'express'
import { type Order, CreateOrderRequestSchema, OrderSchema } from './types.js'

const app = express()
const PORT = 3000

app.use(express.json())

const orders: Order[] = []

app.get('/', (req, res) => {
  res.send(`Server Created on port ${PORT}!`)
})

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.post('/api/checkout/test', (req, res) => {
  res.json(req.body)
})

app.post('/api/orders', (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: 'Request Body is required' })
  }

  const result = CreateOrderRequestSchema.safeParse(req.body)

  if (!result.success) {
    return res
      .status(400)
      .json({ success: false, error: 'Validation failed', details: result.error.format() })
  }

  const { customer, items } = result.data
  try {
    const newOrder: Order = OrderSchema.parse({
      id: crypto.randomUUID(),
      customer: {
        name: customer.name,
        phone: customer.phone,
        address: customer.address,
      },
      items: items,
    })

    orders.push(newOrder)

    return res.status(201).json({
      success: true,
      message: 'Order created successfully!',
      order: newOrder,
    })
  } catch (error) {
    console.error('Ошибка при создании заказа:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
    })
  }
})
app.get('/api/orders', (req, res) => {
  res.json(orders)
})

app.listen(PORT, () => {
  console.log(`Server Created on port ${PORT}!`)
})
