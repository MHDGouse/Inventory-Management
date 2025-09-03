"use client"

import { useState, useRef, useEffect } from "react"
import { ProductGrid } from "@/components/sales/product-grid"
import { TransactionTabs } from "@/components/sales/transaction-tabs"
import type { SaleType, Product } from "@/lib/types"
import axios from "axios"
import Loader from "@/components/ui/loader"
import { toast } from "react-toastify"

export default function HomePage() {
  const [saleType, setSaleType] = useState<SaleType>("retail")
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const transactionTabsRef = useRef<{
    addToCurrentTab: (productId: string, quantity: number, priceType: "retail" | "wholesale") => void
  }>(null)

  const API = process.env.NEXT_PUBLIC_API_URL

  // Load products when component mounts
  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await axios.get(`${API}/api/V1/products/all`)
      console.log("Sales API response:", response.data)
      
      // Assuming the API returns products in response.data
      const data = response.data
      console.log("Fetched products:", data)
      
      // Standardize the product data to ensure consistent field naming
      const standardizedProducts = data.map((product: Product) => {
        // Make a copy of the product to avoid mutating the original
        const standardized = { ...product };
        
        // Convert naming conventions for price fields
        if (standardized.retailPrice !== undefined && standardized.retail_price === undefined) {
          standardized.retail_price = standardized.retailPrice;
        }
        if (standardized.wholeSalePrice !== undefined && standardized.wholesale_price === undefined) {
          standardized.wholesale_price = standardized.wholeSalePrice;
        }
        
        return standardized;
      });
      
      setProducts(standardizedProducts)
    } catch (error) {
      console.error("Failed to load products from API:", error)
      setError("Failed to load products")
      toast.error("Error fetching products from API!")
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const handleSaleTypeChange = (type: SaleType) => {
    setSaleType(type)
  }


  const handleAddToCart = (productId: string, quantity: number, priceType: "retail" | "wholesale") => {
    console.log("Add to cart:", { productId, quantity, priceType })
    if (transactionTabsRef.current) {
      transactionTabsRef.current.addToCurrentTab(productId, quantity, priceType)
    }
  }

  const handleUpdateQuantity = (productId: string, priceType: "retail" | "wholesale", quantity: number) => {
    // This will be handled by TransactionTabs component
    console.log("Update quantity:", { productId, priceType, quantity })
  }

  const handleRemoveItem = (productId: string, priceType: "retail" | "wholesale") => {
    // This will be handled by TransactionTabs component
    console.log("Remove item:", { productId, priceType })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader />
          <div className="mt-4 text-muted-foreground">Loading products...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-destructive mb-4">Error: {error}</div>
          <button 
            onClick={loadProducts}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
        <div className="grid grid-cols-1 xl:grid-cols-5 lg:grid-cols-3 gap-4 sm:gap-6 h-[calc(100vh-120px)]">
          {/* Products Section - Takes more space on larger screens */}
          <div className="xl:col-span-3 lg:col-span-2 order-2 lg:order-1">
            <div className="h-full">
              <ProductGrid 
                products={products}
                saleType={saleType} 
                onSaleTypeChange={handleSaleTypeChange} 
                onAddToCart={handleAddToCart} 
              />
            </div>
          </div>

          {/* Transaction Tabs Section - Fixed width on larger screens */}
          <div className="xl:col-span-2 lg:col-span-1 order-1 lg:order-2">
            <div className="h-full">
              <TransactionTabs
                products={products}
                ref={transactionTabsRef}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
                onAddToCart={handleAddToCart}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
