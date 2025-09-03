"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Save } from "lucide-react"
import { useRouter } from "next/navigation"
import InventoryTable from "./inventory-table"
import SelectedItemsGrid from "./selected-items-grid"
import { dairyInventory } from "@/lib/data"
import type { Product, SelectedItem } from "@/lib/types"
import axios from "axios"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

export default function InventoryPage() {
  const router = useRouter()
  const [inventory, setInventory] = useState<Product[]>(dairyInventory)
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)

  const tableRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  const API = process.env.NEXT_PUBLIC_API_URL 
  // Filter inventory based on search query
  const filteredInventory =
    searchQuery.trim() === ""
      ? inventory
      : inventory.filter(
          (item) =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.category.toLowerCase().includes(searchQuery.toLowerCase())
        )

  // Handle item selection
  const handleSelectItem = (item: Product) => {
    // Check if item is already selected
    if (!selectedItems.some((selected) => selected._id === item._id)) {
      setSelectedItems([
        ...selectedItems,
        {
          ...item,
          cans: 0,
          quantity: 0,
          totalPrice: 0,
          
        },
      ])
    }
  }

  // Handle quantity and price updates
  const handleUpdateSelectedItem = (id: string, field: string, value: number) => {
    setSelectedItems((prev) =>
      prev.map((item) => {
        if (item._id === id) {
          const updatedItem = { ...item, [field]: value }

          // Calculate total price
          updatedItem.totalPrice = updatedItem.price * (updatedItem.quantity || 0)

          return updatedItem
        }
        return item
      }),
    )
  }

  // Remove item from selection
  const handleRemoveItem = (id: string) => {
    setSelectedItems((prev) => prev.filter((item) => item._id !== id))
  }

  // Calculate grand total
  const grandTotal = selectedItems.reduce((total, item) => total + (item.totalPrice || 0), 0)

  // Save inventory to database and redirect
  const handleSaveInventory = async () => {
    setLoading(true)
    try {
      const payload = selectedItems.map(item => ({
        id: item._id,
        name: item.name,
        cans: item.cans,
        quantity: item.quantity,
        totalPrice: item.totalPrice,
      }))
      console.log("Payload to save:", payload)
      const response = await axios.post(
        `${API}/api/V1/inventory/add`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      toast.success("Inventory saved successfully!")
    } catch (error) {
      toast.error("Error saving inventory!")
      console.error("Error saving inventory:", error)
    } finally {
      setLoading(false)
    }
  }

  // Disable if any item has price 0 or if no items are selected
  const isSaveDisabled =
    selectedItems.length === 0 || selectedItems.some(item => !item.totalPrice || item.totalPrice === 0)

  return (
    <div className=" text-xl"> {/* <-- Added text-lg here */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold tracking-tight">Inventory Management</h1>
        <Button variant="outline" onClick={() => router.push("/sales")}>
          Go to Sales
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search inventory..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Split Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel - Inventory Table */}
        <div ref={tableRef} className="border rounded-lg overflow-hidden">
          <div className="bg-muted p-3 font-medium">Available Inventory</div>
          <InventoryTable  onSelectItem={handleSelectItem} />
        </div>

        {/* Right Panel - Selected Items Grid */}
        <div className="flex flex-col">
          <div ref={gridRef} className="border rounded-lg overflow-hidden flex-grow">
            <div className="bg-muted p-3 font-medium flex justify-between items-center">
              <span>Selected Items</span>
              <span>Total: ₹{grandTotal.toFixed(2)}</span>
            </div>
            <SelectedItemsGrid
              selectedItems={selectedItems}
              onUpdateItem={handleUpdateSelectedItem}
              onRemoveItem={handleRemoveItem}
            />
          </div>

          <Button
            className="mt-4 w-full"
            size="lg"
            onClick={handleSaveInventory}
            disabled={isSaveDisabled || loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
                Saving...
              </span>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Save Inventory
              </>
            )}
          </Button>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
 
  )}