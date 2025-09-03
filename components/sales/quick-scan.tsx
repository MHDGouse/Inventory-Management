"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScanLine, Zap } from "lucide-react"
import type { Product } from "@/lib/types"
import { getProductByBarcode } from "@/lib/database"

interface QuickScanProps {
  onProductFound: (product: Product) => void
  onError: (message: string) => void
}

export function QuickScan({ onProductFound, onError }: QuickScanProps) {
  const [barcodeInput, setBarcodeInput] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!barcodeInput.trim() || isProcessing) return

    setIsProcessing(true)
    try {
      const product = await getProductByBarcode(barcodeInput.trim())
      if (product) {
        onProductFound(product)
        setBarcodeInput("")
      } else {
        onError(`Product not found for barcode: ${barcodeInput}`)
      }
    } catch (error) {
      console.error("Barcode lookup failed:", error)
      onError("Failed to lookup product")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <div className="relative">
        <ScanLine className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Quick scan barcode"
          value={barcodeInput}
          onChange={(e) => setBarcodeInput(e.target.value)}
          className="pl-10 w-48"
          disabled={isProcessing}
        />
      </div>
      <Button
        type="submit"
        variant="outline"
        disabled={!barcodeInput.trim() || isProcessing}
        className="gap-2 bg-transparent"
      >
        {isProcessing ? <Zap className="h-4 w-4 animate-spin" /> : <ScanLine className="h-4 w-4" />}
        {isProcessing ? "Adding..." : "Add"}
      </Button>
    </form>
  )
}
