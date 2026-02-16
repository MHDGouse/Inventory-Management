import type { Product, Transaction, TransactionItem, CartItem } from "./types"

// Mock database functions - replace with actual database calls
export const mockProducts: Product[] = [
  {
    _id: "1",
    name: "Whole Milk 1L",

    barcode: "1234567890123",
    retail_price: 3.99,
    wholesale_price: 2.99,
    stock_quantity: 50,
    category: "Milk",
  },
  {
    _id: "2",
    name: "Cheddar Cheese 200g",

    image_url: "/placeholder.svg?height=200&width=200",
    barcode: "2234567890123",
    retail_price: 6.99,
    wholesale_price: 5.49,
    stock_quantity: 25,
    category: "Cheese",
  },
  {
    id: 3,
    name: "Greek Yogurt 500g",
    description: "Thick and creamy Greek yogurt",
    image_url: "/placeholder.svg?height=200&width=200",
    barcode: "3234567890123",
    retail_price: 5.49,
    wholesale_price: 4.19,
    stock_quantity: 30,
    category: "Yogurt",
  },
  {
    id: 4,
    name: "Salted Butter 250g",
    description: "Premium salted butter",
    image_url: "/placeholder.svg?height=200&width=200",
    barcode: "4234567890123",
    retail_price: 4.99,
    wholesale_price: 3.79,
    stock_quantity: 40,
    category: "Butter",
  },
]

// Mock storage for pending transactions
let mockTransactions: Transaction[] = []
let transactionCounter = 1

export async function getProducts(): Promise<Product[]> {
  // In a real app, this would fetch from your database
  return mockProducts
}

export async function getProductByBarcode(barcode: string): Promise<Product | null> {
  // In a real app, this would query the database
  return mockProducts.find((p) => p.barcode === barcode) || null
}

export async function createTransaction(saleType: "retail" | "wholesale"): Promise<Transaction> {
  const transactionNumber = `TXN-${Date.now()}`
  const newTransaction: Transaction = {
    id: transactionCounter++,
    transaction_number: transactionNumber,
    status: "pending",
    sale_type: saleType,
    subtotal: 0,
    tax_amount: 0,
    total_amount: 0,
    created_at: new Date().toISOString(),
    items: [],
  }

  mockTransactions.push(newTransaction)
  return newTransaction
}

export async function saveTransactionFromCart(
  cart: CartItem[],
  saleType: "retail" | "wholesale",
): Promise<Transaction> {
  const transaction = await createTransaction(saleType)

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => {
    const price = item.price_type === "retail" ? item.product.retail_price : item.product.wholesale_price
    return sum + price * item.quantity
  }, 0)

  const taxRate = 0.08
  const taxAmount = subtotal * taxRate
  const totalAmount = subtotal + taxAmount

  // Create transaction items
  const items: TransactionItem[] = cart.map((cartItem, index) => ({
    id: Date.now() + index,
    transaction_id: transaction.id,
    product_id: cartItem.product.id,
    product: cartItem.product,
    quantity: cartItem.quantity,
    unit_price: cartItem.price_type === "retail" ? cartItem.product.retail_price : cartItem.product.wholesale_price,
    line_total:
      (cartItem.price_type === "retail" ? cartItem.product.retail_price : cartItem.product.wholesale_price) *
      cartItem.quantity,
  }))

  // Update transaction
  const updatedTransaction: Transaction = {
    ...transaction,
    subtotal,
    tax_amount: taxAmount,
    total_amount: totalAmount,
    items,
  }

  // Update in mock storage
  const index = mockTransactions.findIndex((t) => t.id === transaction.id)
  if (index >= 0) {
    mockTransactions[index] = updatedTransaction
  }

  return updatedTransaction
}

export async function updateTransaction(transaction: Transaction): Promise<Transaction> {
  const index = mockTransactions.findIndex((t) => t.id === transaction.id)
  if (index >= 0) {
    mockTransactions[index] = transaction
  }
  return transaction
}

export async function getPendingTransactions(): Promise<Transaction[]> {
  return mockTransactions.filter((t) => t.status === "pending")
}

export async function getTransactionById(id: number): Promise<Transaction | null> {
  return mockTransactions.find((t) => t.id === id) || null
}

export async function completeTransaction(transactionId: number): Promise<Transaction> {
  const transaction = await getTransactionById(transactionId)
  if (!transaction) {
    throw new Error("Transaction not found")
  }

  if (transaction.items) {
    for (const item of transaction.items) {
      const productIndex = mockProducts.findIndex((p) => p.id === item.product_id)
      if (productIndex >= 0) {
        mockProducts[productIndex].stock_quantity = Math.max(
          0,
          mockProducts[productIndex].stock_quantity - item.quantity,
        )
      }
    }
  }

  const completedTransaction: Transaction = {
    ...transaction,
    status: "completed",
    completed_at: new Date().toISOString(),
  }

  await updateTransaction(completedTransaction)
  return completedTransaction
}

export async function deleteTransaction(transactionId: number): Promise<void> {
  mockTransactions = mockTransactions.filter((t) => t.id !== transactionId)
}

export async function convertTransactionToCart(transaction: Transaction): Promise<CartItem[]> {
  if (!transaction.items) return []

  return transaction.items.map((item) => ({
    product: item.product!,
    quantity: item.quantity,
    price_type: transaction.sale_type,
  }))
}
