"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Minus, X } from "lucide-react"
import type { CartItem } from "@/lib/types"

interface CartItemProps {
  item: CartItem
  onUpdateQuantity: (productId: number, priceType: "retail" | "wholesale", quantity: number) => void
  onRemoveItem: (productId: number, priceType: "retail" | "wholesale") => void
}

export function CartItemComponent({ item, onUpdateQuantity, onRemoveItem }: CartItemProps) {
  const currentPrice =
    item.price_type === "retail"
      ? (item.product.retail_price ?? 0)
      : (item.product.wholesale_price ?? 0)
  const lineTotal = currentPrice * item.quantity

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= (item.product.stock_quantity ?? 0)) {
      onUpdateQuantity(Number(item.product.id) || 0, item.price_type, newQuantity)
    }
  }

  const handleRemove = () => {
    onRemoveItem(Number(item.product.id) || 0, item.price_type)
  }

  return (
    <div className="flex items-start gap-3 p-3 border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors">
      <div className="w-12 h-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
        <img
          src={item.product.image_url || item.product.image || "/placeholder.svg?height=48&width=48"}
          alt={item.product.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback for image loading errors
            e.currentTarget.src = "/placeholder.svg?height=48&width=48";
          }}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm text-card-foreground line-clamp-1">{item.product.name}</h4>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="text-sm font-semibold text-primary">${currentPrice.toFixed(2)}</span>
              <Badge variant={item.price_type === "retail" ? "default" : "secondary"} className="text-xs px-1.5 py-0">
                {item.price_type}
              </Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
            onClick={handleRemove}
            aria-label={`Remove ${item.product.name} from cart`}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>

        <div className="flex items-center justify-between mt-2 gap-2">
          <div className="flex items-center border rounded-md bg-background h-7">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-6 p-0"
              onClick={() => handleQuantityChange(item.quantity - 1)}
              disabled={item.quantity <= 1}
              aria-label="Decrease quantity"
            >
              <Minus className="h-2.5 w-2.5" />
            </Button>
            <Input
              type="number"
              value={item.quantity}
              onChange={(e) => handleQuantityChange(Number.parseInt(e.target.value) || 1)}
              className="h-7 w-10 text-xs text-center border-0 focus-visible:ring-0 p-0"
              min="1"
              max={item.product.stock_quantity}
              aria-label="Quantity"
            />
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-6 p-0"
              onClick={() => handleQuantityChange(item.quantity + 1)}
              disabled={item.quantity >= (item.product.stock_quantity ?? 0)}
              aria-label="Increase quantity"
            >
              <Plus className="h-2.5 w-2.5" />
            </Button>
          </div>
          <span className="text-sm font-semibold">${lineTotal.toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}
