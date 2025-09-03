"use client"

import { useState, useEffect } from "react"
import { ProductCard } from "./product-card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import type { Product, SaleType } from "@/lib/types"

interface ProductGridProps {
  products: Product[]
  saleType: SaleType
  onSaleTypeChange: (type: SaleType) => void
  onAddToCart: (productId: string, quantity: number, priceType: "retail" | "wholesale") => void
}

export function ProductGrid({ products, saleType, onSaleTypeChange, onAddToCart }: ProductGridProps) {
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  useEffect(() => {
    filterProducts()
  }, [products, searchQuery, selectedCategory])

  const filterProducts = () => {
    let filtered = products

    if (searchQuery) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((product) => product.category === selectedCategory)
    }

    setFilteredProducts(filtered)
  }

  const handleAddToCart = (product: Product, quantity: number) => {
    console.log("Product being added to cart:", product);
    // Ensure productId is a string and not undefined
    const productId = product._id ? String(product._id) : "";
    console.log("Converted productId:", productId);
    onAddToCart(productId, quantity, saleType);
  }

  const handleProductFound = (product: Product) => {
     const productId = product._id ? String(product._id) : "";
    onAddToCart(productId, 1, saleType)
  }

  const handleScanError = (message: string) => {
    alert(message)
  }

  const categories = ["all", ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))]

  return (
    <div className="space-y-3 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between flex-shrink-0">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-foreground">Products</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">Select products to add to your cart</p>
        </div>
        
        {/* Sale Type Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">Sale Type:</span>
          <div className="flex space-x-1">
            <Badge
              variant={saleType === "retail" ? "default" : "outline"}
              className="cursor-pointer text-xs px-2 py-1"
              onClick={() => onSaleTypeChange("retail")}
            >
              Retail
            </Badge>
            <Badge
              variant={saleType === "wholesale" ? "default" : "outline"}
              className="cursor-pointer text-xs px-2 py-1"
              onClick={() => onSaleTypeChange("wholesale")}
            >
              Wholesale
            </Badge>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center flex-shrink-0">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-9"
          />
        </div>

        <div className="flex items-center gap-2 flex-nowrap overflow-x-auto py-1 scrollbar-thin">
          <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">Category:</span>
          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-thin">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className="cursor-pointer text-xs h-6 whitespace-nowrap flex-shrink-0"
                onClick={() => setSelectedCategory(category)}
              >
                {category === "all" ? "All" : category}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="flex-1 overflow-y-auto pb-4 pr-1 scrollbar-thin">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-muted-foreground text-sm">No products found</div>
          </div>
        ) : (
          <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
            {filteredProducts.map((product) => (
              <ProductCard 
                key={product._id} 
                product={product} 
                saleType={saleType} 
                onAddToCart={handleAddToCart} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
