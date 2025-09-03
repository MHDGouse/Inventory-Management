"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Plus, Minus } from "lucide-react"
import type { Product, SaleType } from "@/lib/types"

interface ProductCardProps {
  product: Product
  saleType: SaleType
  onAddToCart: (product: Product, quantity: number) => void
}

export function ProductCard({ product, saleType, onAddToCart }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1)

  const currentPrice = saleType === "retail" 
    ? (product.retail_price || product.retailPrice || 0)
    : (product.wholesale_price || product.wholeSalePrice || 0)
  const otherPrice = saleType === "retail" 
    ? (product.wholesale_price || product.wholeSalePrice || 0)
    : (product.retail_price || product.retailPrice || 0)
  const stockQuantity = product.stock_quantity || 100 // Default stock if not provided

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= stockQuantity) {
      setQuantity(newQuantity)
    }
  }

  const handleAddToCart = () => {
    onAddToCart(product, quantity)
    setQuantity(1) // Reset quantity after adding
  }

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200 bg-card border-border h-full flex flex-col">
      <CardContent className="p-3 flex flex-col h-full">
        <div className="aspect-square relative mb-2 overflow-hidden rounded-md bg-muted flex-shrink-0">
          <img
            src={product.image_url || product.image || "/placeholder.svg?height=150&width=150"}
            alt={product.name}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-200"
            onError={(e) => {
              // Fallback for image loading errors
              e.currentTarget.src = "/placeholder.svg?height=150&width=150";
            }}
          />
          {stockQuantity <= 5 && (
            <Badge variant="destructive" className="absolute top-1 right-1 text-xs">
              Low Stock
            </Badge>
          )}
        </div>

        <div className="space-y-2 flex-1 flex flex-col">
          <div className="flex-1">
            <h3 className="font-semibold text-sm text-card-foreground text-balance leading-tight">{product.name}</h3>
            {product.description && (
              <p className="text-xs text-muted-foreground text-pretty line-clamp-2 mt-1">{product.description}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <span className="text-base font-bold text-primary">${currentPrice.toFixed(2)}</span>
                <Badge variant={saleType === "retail" ? "default" : "secondary"} className="text-xs px-1">
                  {saleType}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                {saleType === "retail" ? "W" : "R"}: ${otherPrice.toFixed(2)}
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs text-muted-foreground">Stock</div>
              <div className="text-sm font-medium">{stockQuantity}</div>
            </div>
          </div>

          <div className="flex flex-col xs:flex-row items-stretch gap-2 pt-2 w-full mt-auto">
            <div className="flex items-center border rounded-md bg-background px-1 py-1 h-8 flex-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => handleQuantityChange(Number.parseInt(e.target.value) || 1)}
                className="h-7 flex-1 min-w-0 text-center text-sm border-0 focus-visible:ring-0 px-0"
                min="1"
                max={product.stock_quantity}
              />
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={quantity >= stockQuantity}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>

            <Button
              onClick={handleAddToCart}
              className="h-8 text-xs bg-primary hover:bg-primary/90 text-primary-foreground flex-1 xs:flex-none xs:px-3"
              disabled={stockQuantity === 0}
            >
              Add
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
