"use client"
import { useState } from "react"
import Image from "next/image"
import type { SelectedItem } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

import { Calendar } from 'primereact/calendar';
        
// import { Calendar } from "@/components/ui/calendar"

interface SelectedItemsGridProps {
  selectedItems: SelectedItem[]
  onUpdateItem: (_id: string, field: string, value: number | Date) => void
  onRemoveItem: (_id: string) => void
}

export default function SelectedItemsGrid({ selectedItems, onUpdateItem, onRemoveItem }: SelectedItemsGridProps) {
  const [date, setDate] = useState(null);
  return (
    <div className="grid grid-cols-1 gap-4 overflow-auto max-h-[600px] p-4">
      {selectedItems.map((item) => (
        <Card key={item._id} className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 h-8 w-8 p-0"
            onClick={() => onRemoveItem(item._id)}
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

              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor={`cans-${item._id}`}>Cans</Label>
                    <Input
                      id={`cans-${item._id}`}
                      type="text"
                      min="0"
                      value={item.cans || 0}
                      onChange={(e) => onUpdateItem(item._id, "cans", Number.parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`quantity-${item._id}`}>Quantity</Label>
                    <Input
                      id={`quantity-${item._id}`}
                      type="text"
                      min="0"
                      value={item.quantity || 0}
                      onChange={(e) => onUpdateItem(item._id, "quantity", Number.parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`price-${item._id}`}>Price ($)</Label>
                    <Input
                      id={`price-${item._id}`}
                      type="text"
                      min="0"
                      step="0.01"
                      value={item.price}
                      onChange={(e) => onUpdateItem(item._id, "price", Number.parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
                  <div>
                    <Label htmlFor={`expiry-${item._id}`} className="pr-2">Expiry Date</Label>
                    <Calendar
                      id={`expiry-${item._id}`}
                      value={item.expiryDate ? new Date(item.expiryDate) : null}
                      onChange={(e: any) => onUpdateItem(item._id, "expiryDate", e.value)}
                      dateFormat="dd/mm/yy"
                      className="rounded-lg border-2 border-solid border-black bg-white"
                    />
                  </div>
                </div>
                <div className="mt-4 text-right">
                  <p className="font-medium">Total: ₹{item.totalPrice?.toFixed(2) || "0.00"}</p>
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
