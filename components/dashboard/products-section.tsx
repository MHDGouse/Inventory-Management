"use client"

import type React from "react"
import type { Product } from "../../lib/types" // Create this type or adjust as needed

import { useState, useEffect } from "react"
import Image from "next/image"
import { Plus, Search, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
import { dairyInventory } from "@/lib/data"
import axios from "axios"

const ProductsSection = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [productsList, setProductsList] = useState<Product[]>([])
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    price: "",
    unites:"",
    sellingPrice: "",
    sellingPriceShopkeeper: "",
    image: "",
  })

  const API = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${API}/api/V1/products/all`)
        setProductsList(response.data)
      } catch (error) {
        console.error("Error fetching products:", error)
      }
    }
    fetchProducts()
  }, [API])

  // Get unique categories from productsList
  const uniqueCategories = Array.from(
    new Set(productsList.map((product) => product.category))
  ).filter(Boolean)

  // Filtering logic
  const filteredProducts = productsList.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory =
      categoryFilter === "all" || product.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewProduct((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (value: string) => {
    setNewProduct((prev) => ({ ...prev, category: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const payload = {
        ...newProduct,
        price: Number.parseFloat(newProduct.price),
        sellingPrice: Number.parseFloat(newProduct.sellingPrice),
        unites: newProduct.unites,
        image: newProduct.image,
      }
     const post = await axios.post(`${API}/api/V1/products/register`, payload)
      console.log("Product registered successfully:", post.data)
      // Refresh product list after successful registration
      const response = await axios.get(`${API}/api/V1/products/all`)
      setProductsList(response.data)
      setIsDialogOpen(false)
      setNewProduct({
        name: "",
        category: "",
        price: "",
        unites: "",
        sellingPrice: "",
        sellingPriceShopkeeper: "",
        image: "",
      })
    } catch (error) {
      console.error("Error registering product:", error)
      // Optionally show an error message to the user
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog.</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Register Product
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search products..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select
          value={categoryFilter}
          onValueChange={setCategoryFilter}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {uniqueCategories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredProducts.map((product) => (
          <Card key={product._id} className="overflow-hidden">
            <div className="relative aspect-square">
              <Image
                src={product.image || "/placeholder.svg?height=300&width=300"}
                alt={product.name}
                fill
                className="object-cover"
              />
              <div className="absolute top-2 right-2 flex gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8 bg-white/80 backdrop-blur-sm rounded-full">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 bg-white/80 backdrop-blur-sm rounded-full">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold truncate">{product.name}</h3>
                <Badge variant="outline">{product.category}</Badge>
              </div>
              {/* <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p> */}
            </CardContent>
            <CardFooter className="p-4 pt-0 flex justify-between items-center">
              <span className="font-bold">₹{product.price}</span>
        
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No products found. Try a different search term.</p>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Register New Product</DialogTitle>
            <DialogDescription>Fill in the details to add a new product to your catalog.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Product Name</Label>
                <Input id="name" name="name" value={newProduct.name} onChange={handleInputChange} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select value={newProduct.category} onValueChange={handleSelectChange} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="milk">Milk</SelectItem>
                    <SelectItem value="curd">Curd</SelectItem>
                    <SelectItem value="Ice-Crem">Ice-Cream</SelectItem>
                    <SelectItem value="Juice">Juice</SelectItem>
                    <SelectItem value="Paneer">Paneer</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="1"
                  min="0"
                  value={newProduct.price}
                  onChange={handleInputChange}
                  required
                />
                 <Label htmlFor="price">SellingPrice</Label>
                <Input
                  id="sellingPrice"
                  name="sellingPrice"
                  type="number"
                  step="1"
                  min="0"
                  value={newProduct.sellingPrice}
                  onChange={handleInputChange}
                  required
                />
                <Label htmlFor="price">sellingPriceShopkeeper</Label>
                <Input
                  id="sellingPriceShopkeeper"
                  name="sellingPriceShopkeeper"
                  type="text"
                  placeholder="e.g. 1L, 500g"
                  value={newProduct.sellingPriceShopkeeper}
                  onChange={handleInputChange}
                  required
                />
                 <Label htmlFor="price">Unites</Label>
                <Input
                  id="unites"
                  name="unites"
                  type="text"
                  placeholder="e.g. 1L, 500g"
                  value={newProduct.unites}
                  onChange={handleInputChange}
                  required
                />
                
                <Label htmlFor="price">Image</Label>
                <Input
                  id="image"
                  name="image"
                  type="text"
                  placeholder="image url"
                  value={newProduct.image}
                  onChange={handleInputChange}
                />
              </div>
              
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Product</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ProductsSection;