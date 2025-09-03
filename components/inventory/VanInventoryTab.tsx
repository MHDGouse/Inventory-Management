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

interface VanItem {
  _id: string
  name: string
  category: string
  units: string
  quantity: number
  quantityPrice: number
  returnQuantity: number
  returnAmount: number
  totalPrice: number
  wholeSalePrice: number
  retailPrice: number
}

interface VanInventoryTabProps {
  selectedDate: Date
}

export default function VanInventoryTab({ selectedDate }: VanInventoryTabProps) {
  const [vanItems, setVanItems] = useState<VanItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [focusedInput, setFocusedInput] = useState<string | null>(null)
  // Constants for calculations
  const a = 12
  const b = 60
  const c = 84
  const d = 2

  const API = process.env.NEXT_PUBLIC_API_URL

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`${API}/api/V1/inventory/date/${format(selectedDate, "yyyy-MM-dd")}`)
        console.log("Van API response:", response.data)
    
        
        // Map API data directly to van items
        const van = response.data.van || []
        const mappedVanItems = van.map((apiItem: any) => ({
          _id: apiItem._id,
          name: apiItem.name,
          units: apiItem.units,
          category: apiItem.category,
          quantity: apiItem.quantity || 0,
          quantityPrice: apiItem.quantityPrice || 0, // Initialize quantity
          returnQuantity: apiItem.returnQuantity || 0,
          returnAmount: apiItem.returnAmount || 0,
          totalPrice: apiItem.totalPrice || 0,
          wholeSalePrice: apiItem.wholeSalePrice || 0,
          retailPrice: apiItem.retailPrice || 0,
        }))
        console.log("Mapped Van Items:", mappedVanItems)
        setVanItems(mappedVanItems)
      } catch (error) {
        console.error("Error fetching van inventory:", error)
        toast.error("Error fetching products from API!")
        setVanItems([])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [API, selectedDate])

  // Update van items
  const handleVanItemChange = (id: string, field: 'quantity' | 'returnQuantity' | 'returnAmount', value: number) => {
    setVanItems(prev => 
      prev.map(item => {
        if (item._id === id) {
          return { ...item, [field]: value }
        }
        return item
      })
    )
  }

  // Edit functions
  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSaveEdit = async () => {
    setSaving(true)
    try {
      // Save all items that have been modified
      const updatePromises = vanItems.map(async (item) => {
        try {
          await axios.put(`${API}/api/V1/inventory/edit/${item._id}`, {
            quantity: item.quantity,
            returnQuantity: item.returnQuantity
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

  // Van calculations
  const getVanMilkQuantity = () => {
    return vanItems
      .filter(item => item.category === "milk")
      .reduce((sum, item) => sum + item.quantity, 0)
  }

  const getVanMilkReturnQuantity = () => {
    return vanItems
      .filter(item => item.category === "milk")
      .reduce((sum, item) => sum + item.returnQuantity, 0)
  }

  const getVanMilkReturnAmount = () => {
    return vanItems
      .filter(item => item.category === "milk")
      .reduce((sum, item) => sum + calculateReturnAmount(item), 0)
  }

  const getVanCurdQuantity = () => {
    return vanItems
      .filter(item => item.category === "curd")
      .reduce((sum, item) => sum + item.quantity, 0)
  }

  const getVanCurdReturnQuantity = () => {
    return vanItems
      .filter(item => item.category === "curd")
      .reduce((sum, item) => sum + item.returnQuantity, 0)
  }

  const getVanCurdReturnAmount = () => {
    return vanItems
      .filter(item => item.category === "curd")
      .reduce((sum, item) => sum + calculateReturnAmount(item), 0)
  }

  const getVanGrandQuantity = () => {
    return vanItems.reduce((sum, item) => sum + item.quantity, 0)
  }

  const getVanGrandReturnQuantity = () => {
    return vanItems.reduce((sum, item) => sum + item.returnQuantity, 0)
  }

  const getVanGrandReturnAmount = () => {
    return vanItems.reduce((sum, item) => sum + calculateReturnAmount(item), 0)
  }

  // Calculate totals for quantity amounts
  const getVanMilkQuantityAmount = () => {
    return vanItems
      .filter(item => item.category === "milk")
      .reduce((sum, item) => sum + item.quantityPrice, 0)
  }

  const getVanCurdQuantityAmount = () => {
    return vanItems
      .filter(item => item.category === "curd")
      .reduce((sum, item) => sum + item.quantityPrice, 0)
  }

  const getVanGrandQuantityAmount = () => {
    return vanItems.reduce((sum, item) => sum + calculateQuantityAmount(item), 0)
  }

  // Calculate totals for total amounts
  const getVanMilkTotalAmount = () => {
    return vanItems
      .filter(item => item.category === "milk")
      .reduce((sum, item) => sum + calculateTotalAmount(item), 0)
  }

  const getVanCurdTotalAmount = () => {
    return vanItems
      .filter(item => item.category === "curd")
      .reduce((sum, item) => sum + calculateTotalAmount(item), 0)
  }

  const getVanGrandTotalAmount = () => {
    return vanItems.reduce((sum, item) => sum + calculateTotalAmount(item), 0)
  }

  // Calculate amounts based on product type and formula
  const calculateQuantityAmount = (item: VanItem) => {
    const wholesale = item.wholeSalePrice || 0
    const retailPrice = item.retailPrice || 0
    const quantity = item.quantity || 0
    const productKey = `${item.name} ${item.units}`
    
    let result = 0
    if (productKey.includes("FCM") && productKey.includes("500ML")) {
      result = quantity * wholesale * d
    } else if (productKey.includes("FCM") && productKey.includes("1000ML")) {
      result = quantity * 72
    } else if (productKey.includes("SM") && productKey.includes("500ML")) {
      result = a * quantity * wholesale * d
    } else if (productKey.includes("TM") && productKey.includes("500ML") && !productKey.includes("MINI")) {
      result = a * quantity * wholesale * d
    } else if (productKey.includes("DTM") && productKey.includes("500ML")) {
      result = a * quantity * wholesale * d
    } else if (productKey.includes("TM MINI") && productKey.includes("160ML")) {
      result = b * quantity * wholesale
    } else if (productKey.includes("CURD") && productKey.includes("500ML") && !productKey.includes("MINI")) {
      result = a * quantity * retailPrice * d
    } else if (productKey.includes("CURD MINI") && productKey.includes("110ML")) {
      result = c * quantity * wholesale
    } else {
      result = quantity * wholesale // default calculation
    }
    
    return result
  }

  const calculateReturnAmount = (item: VanItem) => {
    const wholesale = item.wholeSalePrice || 0
    const retailPrice = item.retailPrice || 0
    const returnQuantity = item.returnQuantity || 0
    const productKey = `${item.name} ${item.units}`
    
    let result = 0
    if (productKey.includes("FCM") && productKey.includes("500ML")) {
      result = returnQuantity * wholesale * d
    } else if (productKey.includes("FCM") && productKey.includes("1000ML")) {
      result = returnQuantity * 72
    } else if (productKey.includes("SM") && productKey.includes("500ML")) {
      result = returnQuantity * wholesale * d
    } else if (productKey.includes("TM") && productKey.includes("500ML") && !productKey.includes("MINI")) {
      result = returnQuantity * wholesale * d
    } else if (productKey.includes("DTM") && productKey.includes("500ML")) {
      result = returnQuantity * wholesale * d
    } else if (productKey.includes("TM MINI") && productKey.includes("160ML")) {
      result = returnQuantity * wholesale
    } else if (productKey.includes("CURD") && productKey.includes("500ML") && !productKey.includes("MINI")) {
      result = returnQuantity * retailPrice * d
    } else if (productKey.includes("CURD MINI") && productKey.includes("110ML")) {
      result = returnQuantity * wholesale
    } else {
      result = returnQuantity * wholesale // default calculation
    }
    
    return result
  }

  const calculateActualSold = (item: VanItem) => {
    const quantity = item.quantity || 0
    const returnQuantity = item.returnQuantity || 0
    const productKey = `${item.name} ${item.units}`
    
    let result = 0
    if (productKey.includes("FCM") && productKey.includes("500ML")) {
      result = quantity - returnQuantity
    } else if (productKey.includes("FCM") && productKey.includes("1000ML")) {
      result = quantity - returnQuantity
    } else if (productKey.includes("SM") && productKey.includes("500ML")) {
      result = a * quantity - returnQuantity
    } else if (productKey.includes("TM") && productKey.includes("500ML") && !productKey.includes("MINI")) {
      result = a * quantity - returnQuantity
    } else if (productKey.includes("DTM") && productKey.includes("500ML")) {
      result = a * quantity - returnQuantity
    } else if (productKey.includes("TM MINI") && productKey.includes("160ML")) {
      result = b * quantity - returnQuantity
    } else if (productKey.includes("CURD") && productKey.includes("500ML") && !productKey.includes("MINI")) {
      result = a * quantity - returnQuantity
    } else if (productKey.includes("CURD MINI") && productKey.includes("110ML")) {
      result = c * quantity - returnQuantity
    } else {
      result = quantity - returnQuantity // default calculation
    }
    
    return result
  }

  const calculateTotalAmount = (item: VanItem) => {
    const wholesale = item.wholeSalePrice || 0
    const retailPrice = item.retailPrice || 0
    const actualSold = calculateActualSold(item)
    const productKey = `${item.name} ${item.units}`
    
    let result = 0
    if (productKey.includes("FCM") && productKey.includes("500ML")) {
      result = actualSold * wholesale * d
    } else if (productKey.includes("FCM") && productKey.includes("1000ML")) {
      result = actualSold * 72
    } else if (productKey.includes("SM") && productKey.includes("500ML")) {
      result = actualSold * wholesale * d
    } else if (productKey.includes("TM") && productKey.includes("500ML") && !productKey.includes("MINI")) {
      result = actualSold * wholesale * d
    } else if (productKey.includes("DTM") && productKey.includes("500ML")) {
      result = actualSold * wholesale * d
    } else if (productKey.includes("TM MINI") && productKey.includes("160ML")) {
      result = actualSold * wholesale
    } else if (productKey.includes("CURD") && productKey.includes("500ML") && !productKey.includes("MINI")) {
      result = actualSold * retailPrice * d
    } else if (productKey.includes("CURD MINI") && productKey.includes("110ML")) {
      result = actualSold * wholesale
    } else {
      result = actualSold * wholesale // default calculation
    }
    
    return result
  }


  return (
    <div className="space-y-6">
      {/* Edit Controls */}
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
                <TableHead className="font-bold">Product Name</TableHead>
                <TableHead className="font-bold">Units</TableHead>
                <TableHead className="font-bold">Category</TableHead>
                <TableHead className="font-bold">Quantity (Cans)</TableHead>
                <TableHead className="font-bold">Quantity Price</TableHead>
                <TableHead className="font-bold">Return Quantity (Liters)</TableHead>
                <TableHead className="font-bold">Return Price</TableHead>
                <TableHead className="font-bold">Total Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* MILK Products */}
              {vanItems
                .filter(item => item.category === "milk")
                .map((item) => (
                  <TableRow key={item._id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.units}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                        type="number"
                        min="0"
                        value={focusedInput === item._id && item.quantity === 0 ? "" : item.quantity}
                        onChange={(e) => handleVanItemChange(item._id, 'quantity', parseInt(e.target.value) || 0)}
                        onFocus={() => setFocusedInput(item._id)}
                        onBlur={() => setFocusedInput(null)}
                        className="w-20"
                      />
                      ) : (
                        item.quantity
                      )}
                    </TableCell>
                    <TableCell>₹{calculateQuantityAmount(item)}</TableCell>
                    <TableCell>
                      {isEditing ? (
                         <Input
                        type="number"
                        min="0"
                        value={focusedInput === item._id && item.returnQuantity === 0 ? "" : item.returnQuantity}
                        onChange={(e) => handleVanItemChange(item._id, 'returnQuantity', parseInt(e.target.value) || 0)}
                        onFocus={() => setFocusedInput(item._id)}
                        onBlur={() => setFocusedInput(null)}
                        className="w-20"
                      />
                      ) : (
                        item.returnQuantity
                      )}
                    </TableCell>
                    <TableCell>₹{calculateReturnAmount(item)}</TableCell>
                    <TableCell>₹{calculateTotalAmount(item)}</TableCell>
                  </TableRow>
                ))}
              
              {/* MILK TOTAL Row */}
              <TableRow className="bg-gray-100 font-bold">
                <TableCell>MILK TOTAL</TableCell>
                <TableCell>--</TableCell>
                <TableCell>--</TableCell>
                <TableCell>{getVanMilkQuantity()}</TableCell>
                <TableCell>₹{getVanMilkQuantityAmount()}</TableCell>
                <TableCell>{getVanMilkReturnQuantity()}</TableCell>
                <TableCell>₹{getVanMilkReturnAmount()}</TableCell>
                <TableCell>₹{getVanMilkTotalAmount()}</TableCell>
              </TableRow>

              {/* CURD Products */}
              {vanItems
                .filter(item => item.category === "curd")
                .map((item) => (
                  <TableRow key={item._id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.units}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>
                      {isEditing ? (
                          <Input
                        type="number"
                        min="0"
                        value={focusedInput === item._id && item.quantity === 0 ? "" : item.quantity}
                        onChange={(e) => handleVanItemChange(item._id, 'quantity', parseInt(e.target.value) || 0)}
                        onFocus={() => setFocusedInput(item._id)}
                        onBlur={() => setFocusedInput(null)}
                        className="w-20"
                      />
                      ) : (
                        item.quantity
                      )}
                    </TableCell>
                    <TableCell>₹{calculateQuantityAmount(item)}</TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                        type="number"
                        min="0"
                        value={focusedInput === item._id && item.returnQuantity === 0 ? "" : item.returnQuantity}
                        onChange={(e) => handleVanItemChange(item._id, 'returnQuantity', parseInt(e.target.value) || 0)}
                        onFocus={() => setFocusedInput(item._id)}
                        onBlur={() => setFocusedInput(null)}
                        className="w-20"
                      />
                      ) : (
                        item.returnQuantity
                      )}
                    </TableCell>
                    <TableCell>₹{calculateReturnAmount(item)}</TableCell>
                    <TableCell>₹{calculateTotalAmount(item)}</TableCell>
                  </TableRow>
                ))}

              {/* CURD TOTAL Row */}
              <TableRow className="bg-gray-100 font-bold">
                <TableCell>CURD TOTAL</TableCell>
                <TableCell>--</TableCell>
                <TableCell>--</TableCell>
                <TableCell>{getVanCurdQuantity()}</TableCell>
                <TableCell>₹{getVanCurdQuantityAmount()}</TableCell>
                <TableCell>{getVanCurdReturnQuantity()}</TableCell>
                <TableCell>₹{getVanCurdReturnAmount()}</TableCell>
                <TableCell>₹{getVanCurdTotalAmount()}</TableCell>
              </TableRow>

              {/* GRAND TOTAL Row */}
              <TableRow className="bg-blue-100 font-bold text-lg">
                <TableCell>TOTAL</TableCell>
                <TableCell>---</TableCell>
                <TableCell>---</TableCell>
                <TableCell>{getVanGrandQuantity()}</TableCell>
                <TableCell>₹{getVanGrandQuantityAmount()}</TableCell>
                <TableCell>{getVanGrandReturnQuantity()}</TableCell>
                <TableCell>₹{getVanGrandReturnAmount()}</TableCell>
                <TableCell>₹{getVanGrandTotalAmount()}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}
