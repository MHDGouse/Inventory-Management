"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Receipt, Clock, Trash2, Eye, Play } from "lucide-react"
import type { Transaction, CartItem } from "@/lib/types"
import { getPendingTransactions, deleteTransaction, convertTransactionToCart } from "@/lib/database"

interface TransactionManagerProps {
  onResumeTransaction: (cart: CartItem[], saleType: "retail" | "wholesale") => void
}

export function TransactionManager({ onResumeTransaction }: TransactionManagerProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTransactions()
  }, [])

  const loadTransactions = async () => {
    try {
      const data = await getPendingTransactions()
      setTransactions(data)
      setLoading(false)
    } catch (error) {
      console.error("Failed to load transactions:", error)
      setLoading(false)
    }
  }

  const handleResumeTransaction = async (transaction: Transaction) => {
    try {
      const cart = await convertTransactionToCart(transaction)
      onResumeTransaction(cart, transaction.sale_type)

      // Delete the transaction since we're resuming it
      await deleteTransaction(transaction.id)
      await loadTransactions()
    } catch (error) {
      console.error("Failed to resume transaction:", error)
      alert("Failed to resume transaction")
    }
  }

  const handleDeleteTransaction = async (transactionId: number) => {
    try {
      await deleteTransaction(transactionId)
      await loadTransactions()
      setSelectedTransaction(null)
    } catch (error) {
      console.error("Failed to delete transaction:", error)
      alert("Failed to delete transaction")
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading transactions...</div>
      </div>
    )
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 bg-transparent">
          <Receipt className="h-4 w-4" />
          Pending Transactions ({transactions.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Transaction Manager</DialogTitle>
          <DialogDescription>
            Manage your pending transactions. Resume, view details, or delete saved transactions.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[60vh]">
          {/* Transaction List */}
          <div className="space-y-4">
            <h3 className="font-semibold">Pending Transactions</h3>
            {transactions.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No pending transactions</p>
              </div>
            ) : (
              <ScrollArea className="h-full">
                <div className="space-y-2">
                  {transactions.map((transaction) => (
                    <Card
                      key={transaction.id}
                      className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                        selectedTransaction?.id === transaction.id ? "ring-2 ring-primary" : ""
                      }`}
                      onClick={() => setSelectedTransaction(transaction)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-sm">{transaction.transaction_number}</div>
                          <Badge variant={transaction.sale_type === "retail" ? "default" : "secondary"}>
                            {transaction.sale_type}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(transaction.created_at)}
                          </div>
                          <div className="font-semibold text-primary">${transaction.total_amount.toFixed(2)}</div>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">{transaction.items?.length || 0} items</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>

          {/* Transaction Details */}
          <div className="space-y-4">
            <h3 className="font-semibold">Transaction Details</h3>
            {selectedTransaction ? (
              <Card className="h-full">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{selectedTransaction.transaction_number}</CardTitle>
                    <Badge variant={selectedTransaction.sale_type === "retail" ? "default" : "secondary"}>
                      {selectedTransaction.sale_type}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Created: {formatDate(selectedTransaction.created_at)}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Items */}
                  <div>
                    <h4 className="font-medium mb-2">Items ({selectedTransaction.items?.length || 0})</h4>
                    <ScrollArea className="h-32">
                      <div className="space-y-2">
                        {selectedTransaction.items?.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between text-sm p-2 bg-muted/30 rounded"
                          >
                            <div className="flex-1">
                              <div className="font-medium">{item.product?.name}</div>
                              <div className="text-muted-foreground">
                                ${item.unit_price.toFixed(2)} × {item.quantity}
                              </div>
                            </div>
                            <div className="font-semibold">${item.line_total.toFixed(2)}</div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>

                  {/* Totals */}
                  <div className="space-y-2">
                    <Separator />
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>${selectedTransaction.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax:</span>
                      <span>${selectedTransaction.tax_amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span>Total:</span>
                      <span className="text-primary">${selectedTransaction.total_amount.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4">
                    <Button onClick={() => handleResumeTransaction(selectedTransaction)} className="flex-1 gap-2">
                      <Play className="h-4 w-4" />
                      Resume
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" className="gap-2">
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this transaction? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteTransaction(selectedTransaction.id)}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a transaction to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
