"use client"
import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import type { Product } from "../../lib/types"
import axios from "axios"
import  Loader  from "@/components/ui/loader" // Adjust the path if needed

interface InventoryItem {
  _id: string
  name: string
  category: string
  price: number
  image: string
}
interface InventoryTableProps {
  onSelectItem: (item: Product) => void
}

export default function InventoryTable({ onSelectItem }: InventoryTableProps) {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)

  const API = process.env.NEXT_PUBLIC_API_URL
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`${API}/api/V1/products/all`)
        setInventory(response.data)
      } catch (error) {
        console.error("Error fetching inventory:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [API])

  return (
    <div className="overflow-auto max-h-[600px] text-xl">
      {loading ? (
        <div className="flex justify-center items-center py-10">
          <Loader />
        </div>
      ) : (
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10 text-lg">
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              {/* <TableHead>Stock</TableHead> */}
              <TableHead className="w-[80px]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventory.map((item) => (
              <TableRow key={item._id} className="text-lg">
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>₹{item.price}</TableCell>
                {/* <TableCell>{item.stock}</TableCell> */}
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={() => onSelectItem(item)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {inventory.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                  No items found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
