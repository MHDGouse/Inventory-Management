"use client"

import { useEffect, useRef } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Product } from "@/lib/types"

interface ProductTableProps {
  products: Product[]
  selectedProduct: string | null
  onSelectProduct: (id: string) => void
}

export default function ProductTable({ products, selectedProduct, onSelectProduct }: ProductTableProps) {
  const selectedRowRef = useRef<HTMLTableRowElement>(null)

  // Scroll to selected product
  useEffect(() => {
    if (selectedProduct && selectedRowRef.current) {
      selectedRowRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      })
    }
  }, [selectedProduct])

  return (
    <div className="overflow-auto max-h-[600px]">
      <Table>
        <TableHeader className="sticky top-0 bg-background z-10">
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Stock</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow
              key={product.id}
              ref={product.id === selectedProduct ? selectedRowRef : null}
              className={`cursor-pointer transition-colors hover:bg-muted ${
                product.id === selectedProduct ? "bg-primary/10" : ""
              }`}
              onClick={() => onSelectProduct(product.id)}
            >
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell>{product.category}</TableCell>
              <TableCell>${product.price.toFixed(2)}</TableCell>
              <TableCell>{product.stock}</TableCell>
            </TableRow>
          ))}
          {products.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                No products found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
