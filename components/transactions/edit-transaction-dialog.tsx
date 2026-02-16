"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus } from "lucide-react"
import type { Transaction, TransactionItem, Product } from "@/lib/types"

interface EditTransactionDialogProps {
  transaction: Transaction
  open: boolean
  onOpenChange: (open: boolean) => void
  onTransactionUpdated: () => void
}

export function EditTransactionDialog({
  transaction,
  open,
  onOpenChange,
  onTransactionUpdated,
}: EditTransactionDialogProps) {
  const [items, setItems] = useState<TransactionItem[]>(transaction.items || [])
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setItems(transaction.items || [])
      loadProducts()
    }
  }, [open, transaction])

  const loadProducts = async () => {
    try {
      const productList = await getProducts()
      setProducts(productList)
    } catch (error) {
      console.error("Failed to load products:", error)
    }
  }

  const updateItemQuantity = (itemId: number, quantity: number) => {
    setItems(
      items.map((item) => {
        if (item.id === itemId) {
          const lineTotal = item.unit_price * quantity
          return { ...item, quantity, line_total: lineTotal }
        }
        return item
      }),
    )
  }

  const removeItem = (itemId: number) => {
    setItems(items.filter((item) => item.id !== itemId))
  }

  const addProduct = (product: Product) => {
    const unitPrice = transaction.sale_type === "retail" ? product.retail_price : product.wholesale_price
    const newItem: TransactionItem = {
      id: Date.now(),
      transaction_id: transaction.id,
      product_id: product.id,
      product,
      quantity: 1,
      unit_price: unitPrice,
      line_total: unitPrice,
    }
    setItems([...items, newItem])
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await updateTransactionItems(transaction.id, items)
      onTransactionUpdated()
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to update transaction:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const subtotal = items.reduce((sum, item) => sum + item.line_total, 0)
  const taxAmount = subtotal * 0.08
  const total = subtotal + taxAmount

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Transaction</DialogTitle>
          <DialogDescription>Modify items in transaction {transaction.transaction_number}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Badge variant="outline">
              {transaction.sale_type.charAt(0).toUpperCase() + transaction.sale_type.slice(1)}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Created: {new Date(transaction.created_at).toLocaleString()}
            </span>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Current Items</h3>
            {items.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Line Total</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.product?.name}</p>
                          {item.product?.description && (
                            <p className="text-sm text-muted-foreground">{item.product.description}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItemQuantity(item.id, Number.parseInt(e.target.value) || 1)}
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell>{formatCurrency(item.unit_price)}</TableCell>
                      <TableCell>{formatCurrency(item.line_total)}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => removeItem(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground">No items in this transaction</p>
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Add Products</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-60 overflow-y-auto">
              {products.map((product) => (
                <div key={product.id} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">{product.name}</h4>
                      <p className="text-sm text-muted-foreground">{product.description}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => addProduct(product)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-sm">
                    <p>Retail: {formatCurrency(product.retail_price)}</p>
                    <p>Wholesale: {formatCurrency(product.wholesale_price)}</p>
                    <p>Stock: {product.stock_quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (8%):</span>
                <span>{formatCurrency(taxAmount)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg">
                <span>Total:</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
