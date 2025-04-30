"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus, X, Save, ArrowLeft } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { dairyInventory } from "@/lib/data"
import type { InventoryItem, SalesTransaction, SalesItem } from "@/lib/types"
import SalesTable from "./sales-table"
import SalesItemsTable from "./sales-items-table"

export default function SalesPage() {
  const router = useRouter()
  const [inventory, setInventory] = useState<InventoryItem[]>(dairyInventory)
  const [searchQuery, setSearchQuery] = useState("")
  const [transactions, setTransactions] = useState<SalesTransaction[]>([
    { id: "1", items: [], status: "pending", total: 0 },
  ])
  const [activeTab, setActiveTab] = useState("1")

  // Filter inventory based on search query
  const filteredInventory =
    searchQuery.trim() === ""
      ? inventory
      : inventory.filter(
          (item) =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.category.toLowerCase().includes(searchQuery.toLowerCase()),
        )

  // Add a new transaction tab
  const handleAddTransaction = () => {
    const newId = (transactions.length + 1).toString()
    setTransactions([...transactions, { id: newId, items: [], status: "pending", total: 0 }])
    setActiveTab(newId)
  }

  // Close a transaction tab
  const handleCloseTransaction = (id: string) => {
    if (transactions.length === 1) return // Don't remove the last tab

    const newTransactions = transactions.filter((t) => t.id !== id)
    setTransactions(newTransactions)

    // Set active tab to the first one if we're closing the active tab
    if (activeTab === id) {
      setActiveTab(newTransactions[0].id)
    }
  }

  // Add item to transaction
  const handleAddItem = (transactionId: string, item: InventoryItem) => {
    setTransactions((prev) =>
      prev.map((transaction) => {
        if (transaction.id === transactionId) {
          // Check if item already exists in transaction
          const existingItemIndex = transaction.items.findIndex((i) => i.id === item.id)

          if (existingItemIndex >= 0) {
            // Update quantity if item exists
            const updatedItems = [...transaction.items]
            updatedItems[existingItemIndex] = {
              ...updatedItems[existingItemIndex],
              quantity: updatedItems[existingItemIndex].quantity + 1,
            }

            // Recalculate total
            const total = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

            return {
              ...transaction,
              items: updatedItems,
              total,
            }
          } else {
            // Add new item
            const newItem: SalesItem = {
              id: item.id,
              serialNo: transaction.items.length + 1,
              name: item.name,
              price: item.price,
              quantity: 1,
              subtotal: item.price,
            }

            const updatedItems = [...transaction.items, newItem]
            const total = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

            return {
              ...transaction,
              items: updatedItems,
              total,
            }
          }
        }
        return transaction
      }),
    )
  }

  // Update item quantity or price
  const handleUpdateItem = (transactionId: string, itemId: string, field: string, value: number) => {
    setTransactions((prev) =>
      prev.map((transaction) => {
        if (transaction.id === transactionId) {
          const updatedItems = transaction.items.map((item) => {
            if (item.id === itemId) {
              const updatedItem = { ...item, [field]: value }

              // Recalculate subtotal
              updatedItem.subtotal = updatedItem.price * updatedItem.quantity

              return updatedItem
            }
            return item
          })

          // Recalculate total
          const total = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

          return {
            ...transaction,
            items: updatedItems,
            total,
          }
        }
        return transaction
      }),
    )
  }

  // Remove item from transaction
  const handleRemoveItem = (transactionId: string, itemId: string) => {
    setTransactions((prev) =>
      prev.map((transaction) => {
        if (transaction.id === transactionId) {
          const updatedItems = transaction.items
            .filter((item) => item.id !== itemId)
            // Renumber serial numbers
            .map((item, index) => ({
              ...item,
              serialNo: index + 1,
            }))

          // Recalculate total
          const total = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

          return {
            ...transaction,
            items: updatedItems,
            total,
          }
        }
        return transaction
      }),
    )
  }

  // Save transaction
  const handleSaveTransaction = (transactionId: string) => {
    setTransactions((prev) =>
      prev.map((transaction) => {
        if (transaction.id === transactionId) {
          return {
            ...transaction,
            status: "completed",
          }
        }
        return transaction
      }),
    )

    // In a real app, you would save to database here
    console.log(
      "Transaction saved:",
      transactions.find((t) => t.id === transactionId),
    )
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => router.push("/")} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <h1 className="text-3xl font-bold">Sales</h1>
        </div>
        <Button variant="outline" onClick={() => router.push("/inventory-items")}>
          View Inventory
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search items..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Split Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel - Inventory Table */}
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-muted p-3 font-medium">Available Items</div>
          <SalesTable inventory={filteredInventory} onAddItem={(item) => handleAddItem(activeTab, item)} />
        </div>

        {/* Right Panel - Sales Transactions */}
        <div className="border rounded-lg overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex items-center bg-muted p-2">
              <TabsList className="flex-1">
                {transactions.map((transaction) => (
                  <TabsTrigger key={transaction.id} value={transaction.id} className="flex items-center">
                    Sale #{transaction.id}
                    {transactions.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-2 h-5 w-5 p-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCloseTransaction(transaction.id)
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
              <Button variant="ghost" size="sm" onClick={handleAddTransaction} className="ml-2">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {transactions.map((transaction) => (
              <TabsContent key={transaction.id} value={transaction.id} className="m-0">
                <div className="p-3 bg-muted border-t flex justify-between items-center">
                  <span>
                    Status: <span className="font-medium capitalize">{transaction.status}</span>
                  </span>
                  <span className="font-medium">Total: ${transaction.total.toFixed(2)}</span>
                </div>
                <SalesItemsTable
                  items={transaction.items}
                  onUpdateItem={(itemId, field, value) => handleUpdateItem(transaction.id, itemId, field, value)}
                  onRemoveItem={(itemId) => handleRemoveItem(transaction.id, itemId)}
                />
                <div className="p-4 border-t">
                  <Button
                    className="w-full"
                    onClick={() => handleSaveTransaction(transaction.id)}
                    disabled={transaction.items.length === 0 || transaction.status === "completed"}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {transaction.status === "completed" ? "Saved" : "Save Transaction"}
                  </Button>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  )
}
