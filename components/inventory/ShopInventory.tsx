"use client"
import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Save } from "lucide-react"
import { format } from "date-fns"
import axios from "axios"
import Loader from "@/components/ui/loader"
import { toast } from "react-toastify"

interface InventoryItem {
  _id: string
  name: string
  category: string
  price: number
  units: string
  quantity: number
}

interface ShopInventoryProps {
  selectedDate: Date
}

export default function ShopInventory({ selectedDate }: ShopInventoryProps) {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [focusedInput, setFocusedInput] = useState<string | null>(null)

  const API = process.env.NEXT_PUBLIC_API_URL

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const formattedDate = format(selectedDate, "yyyy-MM-dd")
        const response = await axios.get(`${API}/api/V1/products/all`)
        // console.log(response.data)
        
        // Map API data directly to inventory items
        const mappedInventory = response.data.map((apiItem: any) => ({
          _id: apiItem._id,
          name: apiItem.name,
          units: apiItem.units,
          category: apiItem.category,
          price: apiItem.costPrice || 0,
          quantity: 0
        }))
        // console.log( "mappedInventory", mappedInventory[0])
        setInventory(mappedInventory)
      } catch (error) {
        console.error("Error fetching shop inventory:", error)
        // If API fails, set empty inventory
        setInventory([])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [API, selectedDate])

  // Update quantity for Shop
  const handleCansChange = (id: string, quantity: number) => {
    setInventory(prev => 
      prev.map(item => {
        if (item._id === id) {
          return { ...item, quantity }
        }
        return item
      })
    )
  }

  // Calculate category totals
  const getMilkTotal = () => {
    return inventory
      .filter(item => item.category === "milk")
      .reduce((sum, item) => sum + item.quantity, 0)
  }

  const getCurdTotal = () => {
    return inventory
      .filter(item => item.category === "curd")
      .reduce((sum, item) => sum + item.quantity, 0)
  }

  const getGrandTotal = () => {
    return inventory.reduce((sum, item) => sum + item.quantity, 0)
  }

  // Save data to API
  const handleSave = async () => {
    setSaving(true)
    try {
      const formattedDate = format(selectedDate, "yyyy-MM-dd")
      
      const payload = inventory
        .filter(item => item.quantity > 0)
        .map(item => ({
          productId: item._id,
          name: item.name,
          units: item.units,
          quantity: item.quantity,
          date: formattedDate,
          type: "shop"
        }))

     const response = await axios.post(`${API}/api/V1/inventory/add`, payload, {
        headers: { "Content-Type": "application/json" }
      })
      console.log("Save response:", response.data);
      toast.success("Shop inventory saved successfully!")
    } catch (error) {
      toast.error("Error saving shop inventory!")
      console.error("Error saving shop inventory:", error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
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
                      <Input
                        type="number"
                        step="any"
                        min="0"
                        value={focusedInput === item._id && item.quantity === 0 ? "" : item.quantity}
                        onChange={(e) => handleCansChange(item._id, parseFloat(e.target.value) || 0)}
                        onFocus={() => setFocusedInput(item._id)}
                        onBlur={() => setFocusedInput(null)}
                        className="w-20"
                      />
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
                .filter(item => item.category === "curd")
                .map((item) => (
                  <TableRow key={item._id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.units}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="any"
                        min="0"
                        value={focusedInput === item._id && item.quantity === 0 ? "" : item.quantity}
                        onChange={(e) => handleCansChange(item._id, parseInt(e.target.value) || 0)}
                        onFocus={() => setFocusedInput(item._id)}
                        onBlur={() => setFocusedInput(null)}
                        className="w-20"
                      />
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

      {/* Save Button */}
      <div className="mt-6 flex justify-center">
        <Button
          onClick={handleSave}
          disabled={saving || getGrandTotal() === 0}
          className="px-8 py-2"
          size="lg"
        >
          {saving ? (
            <span className="flex items-center">
              <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
              Saving...
            </span>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Shop Inventory
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
