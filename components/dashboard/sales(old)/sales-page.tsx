"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus, X, Save, ArrowLeft } from "lucide-react"
import axios from "axios"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

import type { Product, SalesTransaction, SalesItem } from "@/lib/types"
import SalesTable from "./sales-table"
import SalesItemsTable from "./sales-items-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs"

const API = process.env.NEXT_PUBLIC_API_URL

export default function SalesPage() {
  const router = useRouter()
  const [inventory, setInventory] = useState<Product[]>()
  const [searchQuery, setSearchQuery] = useState("")
  const [transactions, setTransactions] = useState<SalesTransaction[]>([
    {_id: "1", items: [], status: "pending", total: 0 },
  ])
  const [activeTab, setActiveTab] = useState("1")
  const [customerTypes, setCustomerTypes] = useState<{ [key: string]: string }>({})


  // Filter inventory based on search query
  const filteredInventory =
    searchQuery.trim() === ""
      ? inventory
      : (inventory ?? []).filter(
          (item) =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.category.toLowerCase().includes(searchQuery.toLowerCase()),
        )

  // Add a new transaction tab
  const handleAddTransaction = () => {
    const newId = (transactions.length + 1).toString()
    setTransactions([...transactions, { _id: newId, items: [], status: "pending", total: 0 }])
    setActiveTab(newId)
  }

  // Close a transaction tab
  const handleCloseTransaction = (_id: string) => {
    if (transactions.length === 1) return // Don't remove the last tab

    const newTransactions = transactions.filter((t) => t._id !== _id)
    setTransactions(newTransactions)

    // Set active tab to the first one if we're closing the active tab
    if (activeTab === _id) {
      setActiveTab(newTransactions[0]._id)
    }
  }

  // Add item to transaction
  const handleAddItem = (transactionId: string, item: InventoryItem) => {
    setTransactions((prev) =>
      prev.map((transaction) => {
        if (transaction._id === transactionId) {
          // Check if item already exists in transaction
          const existingItemIndex = transaction.items.findIndex((i) => i._id === item._id)

          if (existingItemIndex >= 0) {
            // Update quantity if item exists
            const updatedItems = [...transaction.items]
            updatedItems[existingItemIndex] = {
              ...updatedItems[existingItemIndex],
              quantity: updatedItems[existingItemIndex].quantity + 1,
            }

            // Recalculate total
            const total = updatedItems.reduce((sum, item) => sum + item.totalprice * item.quantity, 0)

            return {
              ...transaction,
              items: updatedItems,
              total,
            }
          } else {
            // Add new item
            const newItem: SalesItem = {
              _id: item._id,
              serialNo: transaction.items.length + 1,
              name: item.name,
              totalprice: item.price,
              quantity: 1,
              subtotal: item.price,
            }

            const updatedItems = [...transaction.items, newItem]
            const total = updatedItems.reduce((sum, item) => sum + item.totalprice * item.quantity, 0)

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
        if (transaction._id === transactionId) {
          const updatedItems = transaction.items.map((item) => {
            if (item._id === itemId) {
              const updatedItem = { ...item, [field]: value }

              // Recalculate subtotal
              updatedItem.subtotal = updatedItem.totalprice * updatedItem.quantity

              return updatedItem
            }
            return item
          })

          // Recalculate total
          const total = updatedItems.reduce((sum, item) => sum + item.totalprice * item.quantity, 0)

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
        if (transaction._id === transactionId) {
          const updatedItems = transaction.items
            .filter((item) => item._id !== itemId)
            // Renumber serial numbers
            .map((item, index) => ({
              ...item,
              serialNo: index + 1,
            }))

          // Recalculate total
          const total = updatedItems.reduce((sum, item) => sum + item.totalprice * item.quantity, 0)

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
  const handleSaveTransaction = async (transactionId: string) => {
    const transaction = transactions.find((t) => t._id === transactionId)
    if (!transaction) return

    const customerType = customerTypes[transactionId] || "normal"

    // Prepare array payload
    const payload = transaction.items.map(item => ({
      productId: item._id,
      name: item.name,
      quantity: item.quantity,
      customerType,
      totalPrice: item.totalprice,
    }))

    try {
      console.log("Saving transaction:", payload)
      await axios.post(`${API}/api/V1/sales/add`, payload, {
        headers: { "Content-Type": "application/json" },
      })
      toast.success("Sale saved successfully!")
      setTransactions((prev) =>
        prev.map((t) =>
          t._id === transactionId
            ? { ...t, status: "completed", items: [], total: 0 }
            : t
        )
      )
    } catch (error) {
      toast.error("Error saving sale!")
      console.error("Error saving sale:", error)
    }
  }

  // Update customer type for a transaction
  const handleCustomerTypeChange = (transactionId: string, value: string) => {
    setCustomerTypes((prev) => ({
      ...prev,
      [transactionId]: value,
    }));
  };

  return (
    <div className="container mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex justify-center mb-6">
        <div className="bg-white rounded-lg shadow p-6 w-full max-w-xl flex flex-col items-center">
          <h1 className="text-3xl font-bold text-center">Sales</h1>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center justify-center">
          <Button variant="ghost" onClick={() => router.push("/")} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
        </div>
        <Button variant="outline" onClick={() => router.push("/dashboard/inventory/inventory-items")}>
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
          <SalesTable onAddItem={(item) => handleAddItem(activeTab, item)} />
        </div>

        {/* Right Panel - Sales Transactions */}
        <div className="border rounded-lg overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex items-center bg-muted p-2">
              <TabsList className="flex-1">
                {transactions.map((transaction) => (
                  <TabsTrigger key={transaction._id} value={transaction._id} className="flex items-center">
                    Sale #{transaction._id}
                    {transactions.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-2 h-5 w-5 p-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCloseTransaction(transaction._id)
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
              <TabsContent key={transaction._id} value={transaction._id} className="m-0">
                <div className="p-3 bg-muted border-t flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                  <span>
                   Status:{" "}
                    <span
                      className={`font-medium capitalize px-2 py-1 rounded
                        ${transaction.status === "pending" ? "bg-yellow-300 text-yellow-900" : ""}
                        ${transaction.status === "completed" ? "bg-green-500 text-white" : ""}
                      `}

                    >
                      {transaction.status}
                    </span>
                  </span>
                  <span className="font-medium">Total: ₹{transaction.total}</span>
                  <div>
                    <label htmlFor={`customer-type-${transaction._id}`} className="mr-2 font-medium">Customer Type:</label>
                    <select
                      id={`customer-type-${transaction._id}`}
                      value={customerTypes[transaction._id] || "normal"}
                      onChange={e => handleCustomerTypeChange(transaction._id, e.target.value)}
                      className="border rounded px-2 py-1"
                    >
                      <option value="normal">Normal</option>
                      <option value="shopkeeper">Shopkeeper</option>
                    </select>
                  </div>
                </div>
                <SalesItemsTable
                  items={transaction.items}
                  onUpdateItem={(itemId, field, value) => handleUpdateItem(transaction._id, itemId, field, value)}
                  onRemoveItem={(itemId) => handleRemoveItem(transaction._id, itemId)}
                />
                <div className="p-4 border-t">
                  <Button
                    className="w-full"
                    onClick={() => handleSaveTransaction(transaction._id)}
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

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  )
}
