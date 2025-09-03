"use client"
import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Save, Edit2, Check, X } from "lucide-react"
import { format } from "date-fns"
import axios from "axios"
import Loader from "@/components/ui/loader"
import { toast } from "react-toastify"

interface ShopItem {
  _id: string
  name: string
  category: string
  units: string
  price: number
  quantity: number
  totalAmount: number
}

interface ShopInventoryTabProps {
  selectedDate: Date
}

export default function ShopInventoryTab({ selectedDate }: ShopInventoryTabProps) {
  const [inventory, setInventory] = useState<ShopItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [focusedInput, setFocusedInput] = useState<string | null>(null)
  const API = process.env.NEXT_PUBLIC_API_URL

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`${API}/api/V1/inventory/date/${format(selectedDate, "yyyy-MM-dd")}`)
                // const response = await axios.get(`${API}/api/V1/inventory/date/2025-08-27`)

        console.log("Shop API response:", response.data.shop)
        
     
        const shop = response.data.shop || []
        // Map API data for Shop inventory
        const mappedInventory = shop.map((apiItem: any) => ({
          _id: apiItem._id,
          name: apiItem.name,
        //   product: apiItem.product.category,
          units: apiItem.units,
          category: apiItem.category,
          quantity: apiItem.quantity || 0,
        }))
        console.log( "mappedInventory", mappedInventory)
        setInventory(mappedInventory)
      } catch (error) {
        console.error("Error fetching shop inventory:", error)
        toast.error("Error fetching products from API!")
        setInventory([])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [API, selectedDate])

  // Edit functions
  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSaveEdit = async () => {
    setSaving(true)
    try {
      // Save all items that have been modified
      const updatePromises = inventory.map(async (item) => {
        try {
          await axios.put(`${API}/api/V1/inventory/edit/${item._id}`, {
            quantity: item.quantity
          })
        } catch (error) {
          console.error(`Error updating item ${item._id}:`, error)
          throw error
        }
      })

      await Promise.all(updatePromises)
      toast.success("All quantities updated successfully!")
      setIsEditing(false)
    } catch (error) {
      console.error("Error updating quantities:", error)
      toast.error("Error updating some quantities!")
    } finally {
      setSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    // Optionally reload data to reset any changes
    // You might want to store original data to reset to
  }


  const handleShopItemChange = (id: string, quantity: string, value:number) => {
    setInventory(prev => 
        prev.map(item => {
        if (item._id === id) {
          return { ...item, quantity: value }
        }
        return item
      })
    )
  }

  // Calculate category totals
  const getMilkTotal = () => {
    return inventory
      .filter(item => item.category === "MILK" || item.category === "milk")
      .reduce((sum, item) => sum + item.quantity, 0)
  }

  const getMilkTotalAmount = () => {
    return inventory
      .filter(item => item.category === "MILK" || item.category === "milk")
      .reduce((sum, item) => sum + item.totalAmount, 0)
  }

  const getCurdTotal = () => {
    return inventory
      .filter(item => item.category === "CURD" || item.category === "curd")
      .reduce((sum, item) => sum + item.quantity, 0)
  }

  const getCurdTotalAmount = () => {
    return inventory
      .filter(item => item.category === "CURD" || item.category === "curd")
      .reduce((sum, item) => sum + item.totalAmount, 0)
  }

  const getGrandTotal = () => {
    return inventory.reduce((sum, item) => sum + item.quantity, 0)
  }

  const getGrandTotalAmount = () => {
    return inventory.reduce((sum, item) => sum + item.totalAmount, 0)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        {isEditing ? (
          <div className="flex space-x-2">
            <Button
              onClick={handleSaveEdit}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Check className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : "Save All Changes"}
            </Button>
            <Button
              variant="outline"
              onClick={handleCancelEdit}
              disabled={saving}
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            onClick={handleEdit}
          >
            <Edit2 className="mr-2 h-4 w-4" />
            Edit Quantities
          </Button>
        )}
      </div>
      <div className="overflow-auto max-h-[600px] text-lg">
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Loader />
          </div>
        ) : (
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead className="font-bold">Product</TableHead>
                <TableHead className="font-bold">Units</TableHead>
                <TableHead className="font-bold">Quantity</TableHead>

              </TableRow>
            </TableHeader>
            <TableBody>
              {/* MILK Products */}
              {inventory
                .filter(item => item.category === "milk")
                .map((item) => (
                  <TableRow key={item._id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.units}</TableCell>
                 <TableCell>
                      {isEditing ? (
                        <Input
                        type="number"
                        min="0"
                        value={focusedInput === item._id && item.quantity === 0 ? "" : item.quantity}
                        onChange={(e) => handleShopItemChange(item._id, 'quantity', parseInt(e.target.value) || 0)}
                        onFocus={() => setFocusedInput(item._id)}
                        onBlur={() => setFocusedInput(null)}
                        className="w-20"
                      />
                      ) : (
                        item.quantity
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              
              {/* MILK TOTAL Row */}
              <TableRow className="bg-gray-100 font-bold">
                <TableCell>MILK TOTAL</TableCell>
                <TableCell>--</TableCell>
                <TableCell>{getMilkTotal()}</TableCell>
              </TableRow>

              {/* CURD Products */}
              {inventory
                .filter(item =>  item.category === "curd")
                .map((item) => (
                  <TableRow key={item._id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.units}</TableCell>
                          <TableCell>
                      {isEditing ? (
                        <Input
                          type="number"
                          min="0"
                          value={item.quantity}
                          onChange={(e) => handleShopItemChange(item._id, 'quantity', parseInt(e.target.value) || 0)}
                          className="w-20"
                        />
                      ) : (
                        item.quantity
                      )}
                    </TableCell>
                  </TableRow>
                ))}

              {/* CURD TOTAL Row */}
              <TableRow className="bg-gray-100 font-bold">
                <TableCell>CURD TOTAL</TableCell>
                <TableCell>--</TableCell>
                <TableCell>{getCurdTotal()}</TableCell>
              </TableRow>

              {/* GRAND TOTAL Row */}
              <TableRow className="bg-blue-100 font-bold text-lg">
                <TableCell>TOTAL</TableCell>
                <TableCell>---</TableCell>
                <TableCell>{getGrandTotal()}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}
