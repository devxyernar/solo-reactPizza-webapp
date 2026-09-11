type OrderKeys = 'name' | 'phone' | 'address'

interface Order {
  id: string
  customer: {
    [K in OrderKeys]: string
  }
  items: {
    pizzaId: string
    title: string
    type: number
    quantity: number
  }[]
}

export type { Order }
