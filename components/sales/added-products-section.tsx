"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { TransactionManager } from "@/components/sales/transaction-manager"
import { Plus, Minus, Trash2, Save, ShoppingCart } from "lucide-react"
import type { CartItem, SaleType } from "@/lib/types"

interface AddedProductsSectionProps {
  cart: CartItem[]
  saleType: SaleType
  onSaleTypeChange: (type: SaleType) => void
  onUpdateQuantity: (productId: number, priceType: "retail" | "wholesale", quantity: number) => void
  onRemoveItem: (productId: number, priceType: "retail" | "wholesale") => void
  onClearCart: () => void
  onCheckout: () => void
  onSaveTransaction: () => void
  onNewTransaction: () => void
  onResumeTransaction: (cart: CartItem[], saleType: SaleType) => void
}

export function AddedProductsSection({
  cart,
  saleType,
  onSaleTypeChange,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout,
  onSaveTransaction,
  onNewTransaction,
  onResumeTransaction,
}: AddedProductsSectionProps) {
  const subtotal = cart.reduce((sum, item) => {
    const price = item.price_type === "retail" ? item.product.retail_price : item.product.wholesale_price
    return sum + price * item.quantity
  }, 0)

  const tax = subtotal * 0.08
  const total = subtotal + tax

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Added Products ({cart.length})
          </CardTitle>
          <div className="flex items-center gap-2">
            <TransactionManager onResumeTransaction={onResumeTransaction} />
            <Button onClick={onNewTransaction} variant="outline" size="sm" className="gap-1 bg-transparent">
              <Plus className="h-4 w-4" />
              New
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sale Type:</span>
          <div className="flex gap-1">
            <Button
              variant={saleType === "retail" ? "default" : "outline"}
              size="sm"
              onClick={() => onSaleTypeChange("retail")}
              className="text-xs"
            >
              Retail
            </Button>
            <Button
              variant={saleType === "wholesale" ? "default" : "outline"}
              size="sm"
              onClick={() => onSaleTypeChange("wholesale")}
              className="text-xs"
            >
              Wholesale
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {cart.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No products added yet</p>
            <p className="text-sm">Add products from the left section</p>
          </div>
        ) : (
          <>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {cart.map((item) => {
                const price = item.price_type === "retail" ? item.product.retail_price : item.product.wholesale_price
                return (
                  <div
                    key={`${item.product.id}-${item.price_type}`}
                    className="flex items-center gap-3 p-3 border rounded-lg"
                  >
                    <img
                      src={item.product.image_url || "/placeholder.svg?height=50&width=50"}
                      alt={item.product.name}
                      className="w-12 h-12 object-cover rounded"
                    />

                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{item.product.name}</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-primary">${price.toFixed(2)}</span>
                        <Badge variant={item.price_type === "retail" ? "default" : "secondary"} className="text-xs">
                          {item.price_type}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center border rounded">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => onUpdateQuantity(item.product.id, item.price_type, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            onUpdateQuantity(item.product.id, item.price_type, Number.parseInt(e.target.value) || 1)
                          }
                          className="h-7 w-12 text-center text-sm border-0 focus-visible:ring-0"
                          min="1"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => onUpdateQuantity(item.product.id, item.price_type, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                        onClick={() => onRemoveItem(item.product.id, item.price_type)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="text-right">
                      <div className="font-semibold text-sm">${(price * item.quantity).toFixed(2)}</div>
                    </div>
                  </div>
                )
              })}
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax (8%):</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total:</span>
                <span className="text-primary">${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={onSaveTransaction} variant="outline" className="flex-1 gap-1 bg-transparent">
                <Save className="h-4 w-4" />
                Save
              </Button>
              <Button onClick={onCheckout} className="flex-1 bg-primary hover:bg-primary/90">
                Checkout
              </Button>
            </div>

            <Button onClick={onClearCart} variant="ghost" className="w-full text-destructive hover:text-destructive">
              Clear All
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
