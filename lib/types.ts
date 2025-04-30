export interface InventoryItem {
  id: string
  name: string
  category: string
  price: number
  stock: number
  image: string
  description: string
  origin: string
  allergens?: string
}

export interface SelectedItem extends InventoryItem {
  cans?: number
  quantity?: number
  totalPrice?: number
}

export interface SalesItem {
  id: string
  serialNo: number
  name: string
  price: number
  quantity: number
  subtotal: number
}

export interface SalesTransaction {
  id: string
  items: SalesItem[]
  status: "pending" | "completed"
  total: number
}
