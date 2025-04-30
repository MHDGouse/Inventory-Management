"use client"

import Image from "next/image"
import type { SelectedItem } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface SelectedItemsGridProps {
  selectedItems: SelectedItem[]
  onUpdateItem: (id: string, field: string, value: number) => void
  onRemoveItem: (id: string) => void
}

export default function SelectedItemsGrid({ selectedItems, onUpdateItem, onRemoveItem }: SelectedItemsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 overflow-auto max-h-[600px] p-4">
      {selectedItems.map((item) => (
        <Card key={item.id} className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 h-8 w-8 p-0"
            onClick={() => onRemoveItem(item.id)}
          >
            <X className="h-4 w-4" />
          </Button>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative w-full md:w-1/4 aspect-square">
                <Image
                  src={item.image || "/placeholder.svg"}
                  alt={item.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw"
                  className="object-cover rounded-md"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{item.category}</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor={`cans-${item.id}`}>Cans</Label>
                    <Input
                      id={`cans-${item.id}`}
                      type="text"
                      min="0"
                      value={item.cans || 0}
                      onChange={(e) => onUpdateItem(item.id, "cans", Number.parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`quantity-${item.id}`}>Quantity</Label>
                    <Input
                      id={`quantity-${item.id}`}
                      type="text"
                      min="0"
                      value={item.quantity || 0}
                      onChange={(e) => onUpdateItem(item.id, "quantity", Number.parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`price-${item.id}`}>Price ($)</Label>
                    <Input
                      id={`price-${item.id}`}
                      type="text"
                      min="0"
                      step="0.01"
                      value={item.price}
                      onChange={(e) => onUpdateItem(item.id, "price", Number.parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="mt-4 text-right">
                  <p className="font-medium">Total: ${item.totalPrice?.toFixed(2) || "0.00"}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      {selectedItems.length === 0 && (
        <div className="flex items-center justify-center h-40 text-muted-foreground">
          No items selected. Add items from the inventory list.
        </div>
      )}
    </div>
  )
}
