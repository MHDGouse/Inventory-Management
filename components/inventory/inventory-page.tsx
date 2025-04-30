"use client"

import { useState, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Save } from "lucide-react"
import { useRouter } from "next/navigation"
import InventoryTable from "./inventory-table"
import SelectedItemsGrid from "./selected-items-grid"
import { dairyInventory } from "@/lib/data"
import type { InventoryItem, SelectedItem } from "@/lib/types"

export default function InventoryPage() {
  const router = useRouter()
  const [inventory, setInventory] = useState<InventoryItem[]>(dairyInventory)
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  const tableRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  // Filter inventory based on search query
  const filteredInventory =
    searchQuery.trim() === ""
      ? inventory
      : inventory.filter(
          (item) =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase()),
        )

  // Handle item selection
  const handleSelectItem = (item: InventoryItem) => {
    // Check if item is already selected
    if (!selectedItems.some((selected) => selected.id === item.id)) {
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
        if (item.id === id) {
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
    setSelectedItems((prev) => prev.filter((item) => item.id !== id))
  }

  // Calculate grand total
  const grandTotal = selectedItems.reduce((total, item) => total + (item.totalPrice || 0), 0)

  // Save inventory to database and redirect
  const handleSaveInventory = () => {
    // Simulate saving to database
    console.log("Saving inventory:", selectedItems)

    // In a real app, you would make an API call here
    // For now, we'll just store in localStorage for demo purposes
    localStorage.setItem("inventoryItems", JSON.stringify(selectedItems))

    // Redirect to inventory items page
    router.push("/inventory-items")
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Inventory Management</h1>
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
          <InventoryTable inventory={filteredInventory} onSelectItem={handleSelectItem} />
        </div>

        {/* Right Panel - Selected Items Grid */}
        <div className="flex flex-col">
          <div ref={gridRef} className="border rounded-lg overflow-hidden flex-grow">
            <div className="bg-muted p-3 font-medium flex justify-between items-center">
              <span>Selected Items</span>
              <span>Total: ${grandTotal.toFixed(2)}</span>
            </div>
            <SelectedItemsGrid
              selectedItems={selectedItems}
              onUpdateItem={handleUpdateSelectedItem}
              onRemoveItem={handleRemoveItem}
            />
          </div>

          <Button className="mt-4 w-full" size="lg" onClick={handleSaveInventory} disabled={selectedItems.length === 0}>
            <Save className="mr-2 h-4 w-4" /> Save Inventory
          </Button>
        </div>
      </div>
    </div>
  )
}

