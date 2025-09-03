"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CreditCard, DollarSign, Receipt, CheckCircle, Loader2 } from "lucide-react"
import type { CartItem, Transaction } from "@/lib/types"
import { saveTransactionFromCart, completeTransaction } from "@/lib/database"

interface CheckoutDialogProps {
  cart: CartItem[]
  saleType: "retail" | "wholesale"
  isOpen: boolean
  onClose: () => void
  onSuccess: (transaction: Transaction) => void
}

export function CheckoutDialog({ cart, saleType, isOpen, onClose, onSuccess }: CheckoutDialogProps) {
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "check">("cash")
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [notes, setNotes] = useState("")
  const [cashReceived, setCashReceived] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const subtotal = cart.reduce((sum, item) => {
    const price = item.price_type === "retail" ? item.product.retail_price : item.product.wholesale_price
    return sum + price * item.quantity
  }, 0)

  const taxRate = 0.08
  const taxAmount = subtotal * taxRate
  const total = subtotal + taxAmount
  const cashReceivedAmount = Number.parseFloat(cashReceived) || 0
  const change = cashReceivedAmount - total

  const handleCheckout = async () => {
    if (cart.length === 0) return

    // Validate payment
    if (paymentMethod === "cash" && cashReceivedAmount < total) {
      alert("Insufficient cash received")
      return
    }

    setIsProcessing(true)

    try {
      // Create and save transaction
      const transaction = await saveTransactionFromCart(cart, saleType)

      // Add customer info and payment details
      const updatedTransaction: Transaction = {
        ...transaction,
        // In a real app, you'd store customer info and payment details
      }

      // Complete the transaction
      const completedTransaction = await completeTransaction(transaction.id)

      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      onSuccess(completedTransaction)
    } catch (error) {
      console.error("Checkout failed:", error)
      alert("Checkout failed. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const resetForm = () => {
    setPaymentMethod("cash")
    setCustomerName("")
    setCustomerPhone("")
    setNotes("")
    setCashReceived("")
  }

  const handleClose = () => {
    if (!isProcessing) {
      resetForm()
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Checkout
          </DialogTitle>
          <DialogDescription>Complete the sale and process payment</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Order Summary */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Order Summary</CardTitle>
                <Badge variant={saleType === "retail" ? "default" : "secondary"}>{saleType} Sale</Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {cart.map((item, index) => {
                    const price =
                      item.price_type === "retail" ? item.product.retail_price : item.product.wholesale_price
                    const lineTotal = price * item.quantity
                    return (
                      <div key={index} className="flex justify-between text-sm">
                        <div className="flex-1">
                          <div className="font-medium">{item.product.name}</div>
                          <div className="text-muted-foreground">
                            ${price.toFixed(2)} × {item.quantity}
                          </div>
                        </div>
                        <div className="font-semibold">${lineTotal.toFixed(2)}</div>
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
                    <span>${taxAmount.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span className="text-primary">${total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Details */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Payment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Payment Method */}
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Select
                    value={paymentMethod}
                    onValueChange={(value: "cash" | "card" | "check") => setPaymentMethod(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Cash
                        </div>
                      </SelectItem>
                      <SelectItem value="card">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          Credit/Debit Card
                        </div>
                      </SelectItem>
                      <SelectItem value="check">
                        <div className="flex items-center gap-2">
                          <Receipt className="h-4 w-4" />
                          Check
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Cash Payment Details */}
                {paymentMethod === "cash" && (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="cashReceived">Cash Received</Label>
                      <Input
                        id="cashReceived"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={cashReceived}
                        onChange={(e) => setCashReceived(e.target.value)}
                      />
                    </div>
                    {cashReceivedAmount > 0 && (
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Change Due:</span>
                          <span className={`font-bold text-lg ${change >= 0 ? "text-green-600" : "text-red-600"}`}>
                            ${Math.abs(change).toFixed(2)}
                          </span>
                        </div>
                        {change < 0 && <div className="text-sm text-red-600 mt-1">Insufficient payment</div>}
                      </div>
                    )}
                  </div>
                )}

                {/* Customer Information */}
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="customerName">Customer Name (Optional)</Label>
                    <Input
                      id="customerName"
                      placeholder="Enter customer name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerPhone">Phone Number (Optional)</Label>
                    <Input
                      id="customerPhone"
                      placeholder="Enter phone number"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                    />
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any notes about this sale"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose} disabled={isProcessing} className="flex-1 bg-transparent">
                Cancel
              </Button>
              <Button
                onClick={handleCheckout}
                disabled={isProcessing || (paymentMethod === "cash" && change < 0)}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Complete Sale
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
