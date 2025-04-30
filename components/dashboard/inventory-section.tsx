"use client"

import type React from "react"

import { useState } from "react"
import { Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { products } from "@/lib/data"

interface InventoryItem {
  id: string
  productId: string
  productName: string
  category: string
  quantity: number
  location: string
  lastUpdated: string
}

const inventoryData: InventoryItem[] = [
  {
    id: "1",
    productId: "1",
    productName: "Organic Whole Milk",
    category: "Dairy",
    quantity: 45,
    location: "Warehouse A",
    lastUpdated: "2023-04-15",
  },
  {
    id: "2",
    productId: "2",
    productName: "Aged Cheddar Cheese",
    category: "Dairy",
    quantity: 30,
    location: "Warehouse B",
    lastUpdated: "2023-04-14",
  },
  {
    id: "3",
    productId: "3",
    productName: "Greek Yogurt",
    category: "Dairy",
    quantity: 50,
    location: "Warehouse A",
    lastUpdated: "2023-04-16",
  },
  {
    id: "4",
    productId: "4",
    productName: "Salted Butter",
    category: "Dairy",
    quantity: 40,
    location: "Warehouse C",
    lastUpdated: "2023-04-13",
  },
  {
    id: "5",
    productId: "5",
    productName: "Brie Cheese",
    category: "Dairy",
    quantity: 25,
    location: "Warehouse B",
    lastUpdated: "2023-04-12",
  },
]

export default function InventorySection() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [inventory, setInventory] = useState(inventoryData)
  const [newInventoryItem, setNewInventoryItem] = useState({
    productId: "",
    quantity: "",
    location: "Warehouse A",
  })

  const filteredInventory = inventory.filter(
    (item) =>
      item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewInventoryItem((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (field: string, value: string) => {
    setNewInventoryItem((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const selectedProduct = products.find((p) => p.id === newInventoryItem.productId)

    if (selectedProduct) {
      const newItem: InventoryItem = {
        id: (inventory.length + 1).toString(),
        productId: newInventoryItem.productId,
        productName: selectedProduct.name,
        category: selectedProduct.category,
        quantity: Number.parseInt(newInventoryItem.quantity),
        location: newInventoryItem.location,
        lastUpdated: new Date().toISOString().split("T")[0],
      }

      setInventory([...inventory, newItem])
      setIsDialogOpen(false)
      setNewInventoryItem({
        productId: "",
        quantity: "",
        location: "Warehouse A",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground">Manage your inventory and stock levels.</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Inventory
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search inventory..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            <SelectItem value="warehouse-a">Warehouse A</SelectItem>
            <SelectItem value="warehouse-b">Warehouse B</SelectItem>
            <SelectItem value="warehouse-c">Warehouse C</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader className="p-4">
          <CardTitle>Inventory Items</CardTitle>
          <CardDescription>Manage and track your inventory across different locations.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.productId}</TableCell>
                    <TableCell>{item.productName}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell>{item.location}</TableCell>
                    <TableCell>{item.lastUpdated}</TableCell>
                  </TableRow>
                ))}
                {filteredInventory.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                      No inventory items found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Inventory Item</DialogTitle>
            <DialogDescription>Add a new item to your inventory.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="productId">Product</Label>
                <Select
                  value={newInventoryItem.productId}
                  onValueChange={(value) => handleSelectChange("productId", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="1"
                  value={newInventoryItem.quantity}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Select
                  value={newInventoryItem.location}
                  onValueChange={(value) => handleSelectChange("location", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Warehouse A">Warehouse A</SelectItem>
                    <SelectItem value="Warehouse B">Warehouse B</SelectItem>
                    <SelectItem value="Warehouse C">Warehouse C</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Item</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
