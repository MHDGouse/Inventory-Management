export interface Product {
  _id: string
  name: string
  category: string
  price: number
  image: string
}

export interface SelectedItem extends Product {
  cans?: number
  quantity?: number
  totalPrice?: number
}

export interface SalesItem {
  _id: string
  serialNo: number
  name: string
  price: number
  quantity: number
  subtotal: number
}

export interface SalesTransaction {
  _id: string
  items: SalesItem[]
  status: "pending" | "completed"
  total: number
}
