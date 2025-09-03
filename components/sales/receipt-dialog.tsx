"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Printer, Download, CheckCircle } from "lucide-react"
import type { Transaction } from "@/lib/types"

interface ReceiptDialogProps {
  transaction: Transaction | null
  isOpen: boolean
  onClose: () => void
}

export function ReceiptDialog({ transaction, isOpen, onClose }: ReceiptDialogProps) {
  if (!transaction) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    // In a real app, you'd generate a PDF receipt
    alert("Receipt download functionality would be implemented here")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            Sale Completed
          </DialogTitle>
          <DialogDescription>Transaction has been processed successfully</DialogDescription>
        </DialogHeader>

        <Card className="print:shadow-none">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-lg">Dairy Sales System</CardTitle>
            <div className="text-sm text-muted-foreground">Receipt</div>
            <div className="flex items-center justify-center gap-2">
              <Badge variant={transaction.sale_type === "retail" ? "default" : "secondary"}>
                {transaction.sale_type} Sale
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Transaction Info */}
            <div className="text-center space-y-1">
              <div className="font-mono text-sm">{transaction.transaction_number}</div>
              <div className="text-xs text-muted-foreground">
                {transaction.completed_at ? formatDate(transaction.completed_at) : formatDate(transaction.created_at)}
              </div>
            </div>

            <Separator />

            {/* Items */}
            <div className="space-y-2">
              {transaction.items?.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <div className="flex-1">
                    <div className="font-medium">{item.product?.name || "Unknown Product"}</div>
                    <div className="text-muted-foreground">
                      ${(item.unit_price || 0).toFixed(2)} × {item.quantity || 0}
                    </div>
                  </div>
                  <div className="font-semibold">${(item.line_total || 0).toFixed(2)}</div>
                </div>
              ))}
            </div>

            <Separator />

            {/* Totals */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>${(transaction.subtotal || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax:</span>
                <span>${(transaction.tax_amount || 0).toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span className="text-primary">${(transaction.total_amount || 0).toFixed(2)}</span>
              </div>
            </div>

            <Separator />

            <div className="text-center text-xs text-muted-foreground">
              <div>Thank you for your business!</div>
              <div className="mt-1">Items: {transaction.items?.length || 0}</div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint} className="flex-1 gap-2 bg-transparent">
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" onClick={handleDownload} className="flex-1 gap-2 bg-transparent">
            <Download className="h-4 w-4" />
            Download
          </Button>
          <Button onClick={onClose} className="flex-1 bg-primary hover:bg-primary/90">
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
