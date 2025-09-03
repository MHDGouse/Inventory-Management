"use client"
import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

import type { Product } from "../../lib/types"
import axios from "axios"

interface InventoryItem {
  _id: string
  name: string
  category: string
  price: number
  stock: number
}
interface SalesTableProps {
  inventory: InventoryItem[]
  onAddItem: (item: InventoryItem) => void
}

export default function SalesTable({ inventory, onAddItem }: SalesTableProps) {
  const [inventorys, setInventory] = useState<InventoryItem[]>([])

  const API = process.env.NEXT_PUBLIC_API_URL
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API}/api/V1/products/all`)
        setInventory(response.data)
      } catch (error) {
        console.error("Error fetching inventory:", error)
      }
    }
    fetchData()
  }, [API])
  return (
    <div className="overflow-auto max-h-[600px]">
      <Table>
        <TableHeader className="sticky top-0 bg-background z-10">
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Price</TableHead>
            <TableHead className="w-[80px]">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {inventorys.map((item) => (
            <TableRow key={item._id}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell>{item.category}</TableCell>
              <TableCell>₹{item.price.toFixed(2)}</TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" onClick={() => onAddItem(item)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {inventorys.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                No items found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
