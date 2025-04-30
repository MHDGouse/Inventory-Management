"use client"

import type React from "react"

import { useState } from "react"
import { Plus, Search, Save, Printer, Download, X } from "lucide-react"
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
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { dairyInventory } from "@/lib/data"

interface SalesItem {
  id: string
  productId: string
  productName: string
  quantity: number
  price: number
  total: number
}

interface Sale {
  id: string
  customer: string
  date: string
  items: SalesItem[]
  total: number
  status: "pending" | "completed" | "cancelled"
}

const salesData: Sale[] = [
  {
    id: "S001",
    customer: "John Doe",
    date: "2023-04-15",
    items: [
      {
        id: "1",
        productId: "1",
        productName: "Organic Whole Milk",
        quantity: 2,
        price: 4.99,
        total: 9.98,
      },
      {
        id: "2",
        productId: "3",
        productName: "Greek Yogurt",
        quantity: 3,
        price: 3.49,
        total: 10.47,
      },
    ],
    total: 20.45,
    status: "completed",
  },
  {
    id: "S002",
    customer: "Jane Smith",
    date: "2023-04-16",
    items: [
      {
        id: "1",
        productId: "2",
        productName: "Aged Cheddar Cheese",
        quantity: 1,
        price: 6.99,
        total: 6.99,
      },
    ],
    total: 6.99,
    status: "completed",
  },
  {
    id: "S003",
    customer: "Bob Johnson",
    date: "2023-04-17",
    items: [
      {
        id: "1",
        productId: "4",
        productName: "Salted Butter",
        quantity: 2,
        price: 5.29,
        total: 10.58,
      },
      {
        id: "2",
        productId: "5",
        productName: "Brie Cheese",
        quantity: 1,
        price: 8.99,
        total: 8.99,
      },
    ],
    total: 19.57,
    status: "pending",
  },
]

export default function SalesSection() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isViewSaleDialogOpen, setIsViewSaleDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [sales, setSales] = useState(salesData)
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  const [newSale, setNewSale] = useState({
    customer: "",
    items: [] as SalesItem[],
  })
  const [selectedProduct, setSelectedProduct] = useState("")
  const [productQuantity, setProductQuantity] = useState("1")

  const filteredSales = sales.filter(
    (sale) =>
      sale.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.id.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewSale((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddItem = () => {
    if (!selectedProduct || Number.parseInt(productQuantity) < 1) return

    const product = dairyInventory.find((p) => p.id === selectedProduct)

    if (product) {
      const newItem: SalesItem = {
        id: (newSale.items.length + 1).toString(),
        productId: product.id,
        productName: product.name,
        quantity: Number.parseInt(productQuantity),
        price: product.price,
        total: product.price * Number.parseInt(productQuantity),
      }

      setNewSale((prev) => ({
        ...prev,
        items: [...prev.items, newItem],
      }))

      setSelectedProduct("")
      setProductQuantity("1")
    }
  }

  const handleRemoveItem = (itemId: string) => {
    setNewSale((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== itemId),
    }))
  }

  const calculateTotal = () => {
    return newSale.items.reduce((sum, item) => sum + item.total, 0)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newSaleItem: Sale = {
      id: `S${(sales.length + 1).toString().padStart(3, "0")}`,
      customer: newSale.customer,
      date: new Date().toISOString().split("T")[0],
      items: newSale.items,
      total: calculateTotal(),
      status: "pending",
    }

    setSales([...sales, newSaleItem])
    setIsDialogOpen(false)
    setNewSale({
      customer: "",
      items: [],
    })
  }

  const handleViewSale = (sale: Sale) => {
    setSelectedSale(sale)
    setIsViewSaleDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales</h1>
          <p className="text-muted-foreground">Manage your sales transactions.</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Sale
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search sales..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Sales</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader className="p-4">
              <CardTitle>Sales Transactions</CardTitle>
              <CardDescription>View and manage all your sales transactions.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSales.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell className="font-medium">{sale.id}</TableCell>
                        <TableCell>{sale.customer}</TableCell>
                        <TableCell>{sale.date}</TableCell>
                        <TableCell className="text-right">${sale.total.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              sale.status === "completed"
                                ? "default"
                                : sale.status === "pending"
                                  ? "outline"
                                  : "destructive"
                            }
                          >
                            {sale.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => handleViewSale(sale)}>
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredSales.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                          No sales found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader className="p-4">
              <CardTitle>Pending Sales</CardTitle>
              <CardDescription>View and manage pending sales transactions.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSales
                      .filter((sale) => sale.status === "pending")
                      .map((sale) => (
                        <TableRow key={sale.id}>
                          <TableCell className="font-medium">{sale.id}</TableCell>
                          <TableCell>{sale.customer}</TableCell>
                          <TableCell>{sale.date}</TableCell>
                          <TableCell className="text-right">${sale.total.toFixed(2)}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" onClick={() => handleViewSale(sale)}>
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    {filteredSales.filter((sale) => sale.status === "pending").length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                          No pending sales found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardHeader className="p-4">
              <CardTitle>Completed Sales</CardTitle>
              <CardDescription>View and manage completed sales transactions.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSales
                      .filter((sale) => sale.status === "completed")
                      .map((sale) => (
                        <TableRow key={sale.id}>
                          <TableCell className="font-medium">{sale.id}</TableCell>
                          <TableCell>{sale.customer}</TableCell>
                          <TableCell>{sale.date}</TableCell>
                          <TableCell className="text-right">${sale.total.toFixed(2)}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" onClick={() => handleViewSale(sale)}>
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    {filteredSales.filter((sale) => sale.status === "completed").length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                          No completed sales found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* New Sale Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Sale</DialogTitle>
            <DialogDescription>Add a new sales transaction.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="customer">Customer Name</Label>
                <Input id="customer" name="customer" value={newSale.customer} onChange={handleInputChange} required />
              </div>

              <div className="grid gap-2">
                <Label>Add Products</Label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {dairyInventory.map((dairyInventory:any) => (
                        <SelectItem key={dairyInventory.id} value={dairyInventory.id}>
                          {dairyInventory.name} - ${dairyInventory.price.toFixed(2)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      min="1"
                      value={productQuantity}
                      onChange={(e) => setProductQuantity(e.target.value)}
                      className="w-20"
                      placeholder="Qty"
                    />
                    <Button type="button" onClick={handleAddItem}>
                      Add
                    </Button>
                  </div>
                </div>
              </div>

              {newSale.items.length > 0 && (
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {newSale.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.productName}</TableCell>
                          <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">${item.total.toFixed(2)}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" onClick={() => handleRemoveItem(item.id)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={3} className="text-right font-medium">
                          Total:
                        </TableCell>
                        <TableCell className="text-right font-bold">${calculateTotal().toFixed(2)}</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={newSale.items.length === 0}>
                Create Sale
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Sale Dialog */}
      <Dialog open={isViewSaleDialogOpen} onOpenChange={setIsViewSaleDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Sale Details</DialogTitle>
            <DialogDescription>View details for sale {selectedSale?.id}.</DialogDescription>
          </DialogHeader>
          {selectedSale && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p className="font-medium">{selectedSale.customer}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">{selectedSale.date}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge
                    variant={
                      selectedSale.status === "completed"
                        ? "default"
                        : selectedSale.status === "pending"
                          ? "outline"
                          : "destructive"
                    }
                  >
                    {selectedSale.status}
                  </Badge>
                </div>
              </div>

              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedSale.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.productName}</TableCell>
                        <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">${item.total.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={3} className="text-right font-medium">
                        Total:
                      </TableCell>
                      <TableCell className="text-right font-bold">${selectedSale.total.toFixed(2)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm">
                  <Printer className="mr-2 h-4 w-4" />
                  Print
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
                {selectedSale.status === "pending" && (
                  <Button size="sm">
                    <Save className="mr-2 h-4 w-4" />
                    Complete Sale
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
