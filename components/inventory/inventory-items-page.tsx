"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { ArrowLeft, Edit, Save } from "lucide-react"
import type { SelectedItem } from "@/lib/types"

export default function InventoryItemsPage() {
  const router = useRouter()
  const [inventoryItems, setInventoryItems] = useState<SelectedItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editItem, setEditItem] = useState<SelectedItem | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    // Load inventory items from localStorage
    const storedItems = localStorage.getItem("inventoryItems")
    if (storedItems) {
      setInventoryItems(JSON.parse(storedItems))
    }
    setIsLoading(false)
  }, [])

  const handleEditItem = (item: SelectedItem) => {
    setEditItem({ ...item })
    setIsDialogOpen(true)
  }

  const handleUpdateField = (field: string, value: number) => {
    if (editItem) {
      const updatedItem = { ...editItem, [field]: value }

      // Recalculate total price if quantity or price changes
      if (field === "quantity" || field === "price") {
        updatedItem.totalPrice = updatedItem.price * (updatedItem.quantity || 0)
      }

      setEditItem(updatedItem)
    }
  }

  const handleSaveEdit = () => {
    if (editItem) {
      const updatedItems = inventoryItems.map((item) => (item.id === editItem.id ? editItem : item))
      setInventoryItems(updatedItems)
      localStorage.setItem("inventoryItems", JSON.stringify(updatedItems))
      setIsDialogOpen(false)
      setEditItem(null)
    }
  }

  // Calculate grand total
  const grandTotal = inventoryItems.reduce((total, item) => total + (item.totalPrice || 0), 0)

  if (isLoading) {
    return <div className="container mx-auto py-6 px-4">Loading...</div>
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => router.push("/")} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <h1 className="text-3xl font-bold">Inventory Items</h1>
        </div>
        <Button variant="outline" onClick={() => router.push("/sales")}>
          Go to Sales
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="bg-muted p-3 font-medium flex justify-between items-center">
          <span>Saved Inventory Items</span>
          <span>Total Value: ${grandTotal.toFixed(2)}</span>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Cans</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Total</TableHead>
              <TableHead className="w-[80px]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventoryItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>{item.cans}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>${item.price.toFixed(2)}</TableCell>
                <TableCell>${item.totalPrice?.toFixed(2) || "0.00"}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={() => handleEditItem(item)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {inventoryItems.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                  No inventory items found. Add items from the inventory page.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Inventory Item</DialogTitle>
          </DialogHeader>
          {editItem && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="item-name" className="text-right">
                  Item
                </Label>
                <div className="col-span-3 font-medium">{editItem.name}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-cans" className="text-right">
                  Cans
                </Label>
                <Input
                  id="edit-cans"
                  type="number"
                  min="0"
                  value={editItem.cans || 0}
                  onChange={(e) => handleUpdateField("cans", Number.parseInt(e.target.value) || 0)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-quantity" className="text-right">
                  Quantity
                </Label>
                <Input
                  id="edit-quantity"
                  type="number"
                  min="0"
                  value={editItem.quantity || 0}
                  onChange={(e) => handleUpdateField("quantity", Number.parseInt(e.target.value) || 0)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-price" className="text-right">
                  Price ($)
                </Label>
                <Input
                  id="edit-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={editItem.price}
                  onChange={(e) => handleUpdateField("price", Number.parseFloat(e.target.value) || 0)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Total</Label>
                <div className="col-span-3 font-medium">${editItem.totalPrice?.toFixed(2) || "0.00"}</div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleSaveEdit}>
              <Save className="mr-2 h-4 w-4" /> Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
