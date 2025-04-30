"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"
import type { SalesItem } from "@/lib/types"

interface SalesItemsTableProps {
  items: SalesItem[]
  onUpdateItem: (id: string, field: string, value: number) => void
  onRemoveItem: (id: string) => void
}

export default function SalesItemsTable({ items, onUpdateItem, onRemoveItem }: SalesItemsTableProps) {
  return (
    <div className="overflow-auto max-h-[400px]">
      <Table>
        <TableHeader className="sticky top-0 bg-background z-10">
          <TableRow>
            <TableHead className="w-[80px]">Serial No</TableHead>
            <TableHead>Item</TableHead>
            <TableHead className="w-[120px]">Quantity</TableHead>
            <TableHead className="w-[120px]">Price</TableHead>
            <TableHead className="w-[120px]">Subtotal</TableHead>
            <TableHead className="w-[80px]">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.serialNo}</TableCell>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell>
                <Input
                  type="text"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => onUpdateItem(item.id, "quantity", Number.parseInt(e.target.value) || 1)}
                  className="h-8"
                />
              </TableCell>
              <TableCell>
                <Input
                  type="text"
                  min="0"
                  step="0.01"
                  value={item.price}
                  onChange={(e) => onUpdateItem(item.id, "price", Number.parseFloat(e.target.value) || 0)}
                  className="h-8"
                />
              </TableCell>
              <TableCell>${item.subtotal.toFixed(2)}</TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" onClick={() => onRemoveItem(item.id)}>
                  <X className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {items.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                No items added. Add items from the available list.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
