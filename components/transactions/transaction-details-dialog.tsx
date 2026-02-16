import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import axios from "axios"
import type { Transaction } from "@/lib/types"

interface TransactionDetailsDialogProps {
  transaction: Transaction
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TransactionDetailsDialog({ transaction, open, onOpenChange }: TransactionDetailsDialogProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: "default",
      pending: "secondary",
      cancelled: "destructive",
    } as const

    return (
      <Badge variant={variants[status as keyof typeof variants] || "outline"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Transaction Details</DialogTitle>
          <DialogDescription>Complete information for transaction {transaction.transaction_number}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Transaction #</label>
              <p className="font-mono">{transaction.transaction_number}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <div className="mt-1">{getStatusBadge(transaction.status)}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Sale Type</label>
              <div className="mt-1">
                <Badge variant="outline">
                  {transaction.sale_type.charAt(0).toUpperCase() + transaction.sale_type.slice(1)}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Created</label>
              <p>{new Date(transaction.created_at).toLocaleString()}</p>
            </div>
          </div>

          {transaction.completed_at && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Completed</label>
              <p>{new Date(transaction.completed_at).toLocaleString()}</p>
            </div>
          )}

          <div>
            <h3 className="text-lg font-semibold mb-3">Items ({transaction.items?.length || 0})</h3>
            {transaction.items && transaction.items.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Line Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transaction.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.product?.name}</p>
                          {item.product?.description && (
                            <p className="text-sm text-muted-foreground">{item.product.description}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{formatCurrency(item.unit_price)}</TableCell>
                      <TableCell>{formatCurrency(item.line_total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground">No items in this transaction</p>
            )}
          </div>

          <div className="border-t pt-4">
            <div className="space-y-2">
              <div className="flex justify-between font-semibold text-lg">
                <span>Total:</span>
                <span>{formatCurrency(transaction.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
