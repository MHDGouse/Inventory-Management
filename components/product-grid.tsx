"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import type { Product } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"

interface ProductGridProps {
  products: Product[]
  selectedProduct: string | null
  onSelectProduct: (id: string) => void
}

export default function ProductGrid({ products, selectedProduct, onSelectProduct }: ProductGridProps) {
  const selectedCardRef = useRef<HTMLDivElement>(null)

  // Scroll to selected product
  useEffect(() => {
    if (selectedProduct && selectedCardRef.current) {
      selectedCardRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      })
    }
  }, [selectedProduct])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 overflow-auto max-h-[600px] p-2">
      {products.map((product) => (
        <div
          key={product.id}
          ref={product.id === selectedProduct ? selectedCardRef : null}
          onClick={() => onSelectProduct(product.id)}
        >
          <Card
            className={`cursor-pointer transition-all hover:shadow-md ${
              product.id === selectedProduct ? "ring-2 ring-primary shadow-md" : ""
            }`}
          >
            <div className="relative group">
              <div className="aspect-square relative overflow-hidden rounded-t-lg">
                <Image
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white p-4 rounded-t-lg">
                <div className="text-center">
                  <p className="font-medium">{product.description}</p>
                  <p className="mt-2">Origin: {product.origin}</p>
                  {product.allergens && <p className="mt-1 text-yellow-300">Allergens: {product.allergens}</p>}
                </div>
              </div>
            </div>
            <CardContent className="p-3">
              <h3 className="font-semibold truncate">{product.name}</h3>
              <div className="flex justify-between items-center mt-1">
                <span className="text-sm text-muted-foreground">{product.category}</span>
                <span className="font-medium">${product.price.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
      {products.length === 0 && (
        <div className="col-span-full flex items-center justify-center h-40 text-muted-foreground">
          No products found
        </div>
      )}
    </div>
  )
}
