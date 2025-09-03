"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"
import type { SalesItem } from "@/lib/types"
import { useState } from "react"
import { Label } from "@/components/ui/label"

interface SalesItemsTableProps {
  items: SalesItem[]
  onUpdateItem: (_id: string, field: string, value: number) => void
  onRemoveItem: (_id: string) => void
}

export default function SalesItemsTable({ items, onUpdateItem, onRemoveItem }: SalesItemsTableProps) {
  const [amountReceived, setAmountReceived] = useState<number | "">("")
  const totalprice = items.reduce((sum, item) => sum + item.subtotal, 0)
  const change = typeof amountReceived === "number" ? amountReceived - totalprice : 0

  return (
    <>
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
              <TableRow key={item._id}>
                <TableCell>{item.serialNo}</TableCell>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => onUpdateItem(item._id, "quantity", parseFloat(e.target.value) )}
                    className="h-8"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min="0"
                    value={item.totalprice}
                    onChange={(e) => onUpdateItem(item._id, "price", parseFloat(e.target.value))}
                    className="h-8"
                  />
                </TableCell>
                <TableCell>{item.subtotal.toFixed(2) ?? 0.00}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={() => onRemoveItem(item._id)}>
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
      <div className="mt-6 flex justify-end">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div>
        <Label htmlFor="amount-received">Amount Received</Label>
        <Input
          id="amount-received"
          type="number"
          min="0"
          value={amountReceived}
          onChange={e => setAmountReceived(e.target.value === "" ? "" : parseFloat(e.target.value))}
          className="w-40"
        />
          </div>
          <div>
        <Label className="block">Change to Return</Label>
        <div className="font-bold text-lg">
          ₹{change > 0 ? change.toFixed(2) : "0.00"}
        </div>
          </div>
        </div>
      </div>

    </>
  )
}
