"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import ProductTable from "./product-table"
import ProductGrid from "./product-grid"
import { dairyProducts } from "@/lib/data"

export default function DairyProductsPage() {
  const [products, setProducts] = useState(dairyProducts)
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const tableRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  // Filter products based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setProducts(dairyProducts)
    } else {
      const filtered = dairyProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setProducts(filtered)
    }
  }, [searchQuery])

  // Handle product selection
  const handleSelectProduct = (id: string) => {
    setSelectedProduct(id)
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold mb-6">Dairy Products</h1>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search products..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Split Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel - Product Table */}
        <div ref={tableRef} className="border rounded-lg overflow-hidden">
          <ProductTable products={products} selectedProduct={selectedProduct} onSelectProduct={handleSelectProduct} />
        </div>

        {/* Right Panel - Product Grid */}
        <div ref={gridRef} className="border rounded-lg p-4">
          <ProductGrid products={products} selectedProduct={selectedProduct} onSelectProduct={handleSelectProduct} />
        </div>
      </div>
    </div>
  )
}
