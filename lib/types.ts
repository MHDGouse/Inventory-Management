export interface Product {
  _id?: string
  id?: string
  name: string
  description?: string
  category: string
  costPrice?: number
  retailPrice?: number
  wholeSalePrice?: number
  retail_price?: number
  wholesale_price?: number
  units?: string
  image?: string
  image_url?: string
  barcode?: string
  stock_quantity?: number
}


export interface Transaction {
  id: number
  transaction_number: string
  status: "pending" | "completed" | "cancelled"
  sale_type: "retail" | "wholesale"
  subtotal: number
  total_amount: number
  created_at: string
  completed_at?: string
  items?: TransactionItem[]
}

export interface TransactionItem {
  id: number
  transaction_id: number
  product_id: number
  product?: Product
  quantity: number
  unit_price: number
  line_total: number
  created_at?: string
}

export interface CartItem {
  product: Product
  quantity: number
  price_type: "retail" | "wholesale"
}
export type SaleType = "retail" | "wholesale"