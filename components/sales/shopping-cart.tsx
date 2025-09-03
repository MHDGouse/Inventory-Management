"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ShoppingCartIcon, X } from "lucide-react"
import { CartItemComponent } from "./cart-item"
import type { CartItem, SaleType } from "@/lib/types"
import { useEffect, useState } from "react"

interface ShoppingCartProps {
  cart: CartItem[]
  saleType: SaleType
  isOpen: boolean
  onToggle: () => void
  onUpdateQuantity: (productId: number, priceType: "retail" | "wholesale", quantity: number) => void
  onRemoveItem: (productId: number, priceType: "retail" | "wholesale") => void
  onClearCart: () => void
  onCheckout: () => void
}

export function ShoppingCart({
  cart,
  saleType,
  isOpen,
  onToggle,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout,
}: ShoppingCartProps) {
  const [isMobile, setIsMobile] = useState(false)

  // Check if we're on a mobile device
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    // Initial check
    checkIfMobile()
    
    // Add event listener
    window.addEventListener('resize', checkIfMobile)
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile)
  }, [])

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = cart.reduce((sum, item) => {
    const price = item.price_type === "retail" 
      ? (item.product.retail_price ?? 0) 
      : (item.product.wholesale_price ?? 0)
    return sum + price * item.quantity
  }, 0)

  const taxRate = 0.08 // 8% tax rate
  const taxAmount = subtotal * taxRate
  const total = subtotal + taxAmount

  return (
    <>
      {/* Cart Toggle Button - Only visible on mobile when cart is not open */}
      {!isOpen && (
        <Button
          onClick={onToggle}
          className="fixed bottom-4 right-4 z-50 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg md:top-4 md:bottom-auto rounded-full md:rounded-md"
          size="icon"
          aria-label="Open shopping cart"
        >
          <ShoppingCartIcon className="h-5 w-5" />
          <Badge className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center p-0 text-xs">
            {totalItems}
          </Badge>
        </Button>
      )}

      {/* Cart Sidebar/Modal */}
      <div
        className={`fixed inset-0 z-40 md:inset-y-0 md:right-0 md:left-auto md:w-96 bg-background border-l border-border transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <Card className="h-full rounded-none border-0 flex flex-col">
          <CardHeader className="flex-shrink-0 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ShoppingCartIcon className="h-5 w-5" />
                Shopping Cart
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={onToggle} className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={saleType === "retail" ? "default" : "secondary"}>{saleType} Prices</Badge>
              <span className="text-sm text-muted-foreground">{totalItems} items</span>
            </div>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0">
            {cart.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <ShoppingCartIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Your cart is empty</p>
                  <p className="text-sm">Add some products to get started</p>
                </div>
              </div>
            ) : (
              <>
                {/* Cart Items */}
                <ScrollArea className="flex-1 px-4">
                  <div className="space-y-0">
                    {cart.map((item) => (
                      <CartItemComponent
                        key={`${item.product.id}-${item.price_type}`}
                        item={item}
                        onUpdateQuantity={onUpdateQuantity}
                        onRemoveItem={onRemoveItem}
                      />
                    ))}
                  </div>
                </ScrollArea>

                {/* Cart Summary */}
                <div className="flex-shrink-0 p-4 border-t border-border bg-muted/30">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax (8%):</span>
                      <span>${taxAmount.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Total:</span>
                      <span className="text-primary">${total.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" onClick={onClearCart} className="flex-1 bg-transparent">
                      Clear Cart
                    </Button>
                    <Button 
                      onClick={onCheckout} 
                      className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                      disabled={cart.length === 0}
                    >
                      Checkout
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Backdrop - Only on mobile */}
      {isOpen && <div className="fixed inset-0 bg-black/20 z-30 md:hidden" onClick={onToggle} />}
    </>
  )
}
