import express from 'express'
import type { Order } from './types.ts'

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
  const { customer, items } = req.body
  if (!customer || !customer.name || !customer.phone || !customer.address) {
    return res.status(400).json({
      success: false,
      message: 'Заполните все данные клиента!',
    })
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Корзина не может быть пустой!',
    })
  }
  const newOrder = {
    id: `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    customer: {
      name: customer.name,
      phone: customer.phone,
      address: customer.address,
    },
    items: items,
  }

  orders.push(newOrder)
  res.status(201).json({
    success: true,
    message: 'Order created successfully!',
    order: newOrder,
  })
})

app.get('/api/orders', (req, res) => {
  res.json(orders)
})

app.listen(PORT, () => {
  console.log(`Server Created on port ${PORT}!`)
})
