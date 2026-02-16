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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface VanItem {
  _id: string
  name: string
  category: string
  units: string
  quantity: number
  returnQuantity: number
  returnAmount: number
  totalAmount: number
  wholeSalePrice: number
  retailPrice: number
  unitType: "Can" | "Liters" | "Pieces" // New field for the dropdown selection
}

interface VanInventoryProps {
  selectedDate: Date
}

export default function VanInventory({ selectedDate }: VanInventoryProps) {
  const [vanItems, setVanItems] = useState<VanItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [focusedInput, setFocusedInput] = useState<string | null>(null)
  const [returnCash, setReturnCash] = useState<number>(0)

  // Constants for calculations
  const a = 12 // products in one can
  const b = 60 // TM mini in one can
  const c = 84 // Mini curd in one can
  const d = 2 // multiplier for 500ml products

  const API = process.env.NEXT_PUBLIC_API_URL

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`${API}/api/V1/products/all`)
        console.log("van respons",response.data)
        // Map API data directly to van items
        const mappedVanItems = response.data.map((apiItem: any) => ({
          _id: apiItem._id,
          name: apiItem.name,
          units: apiItem.units,
          category: apiItem.category,
          wholeSalePrice: apiItem.wholeSalePrice,
          retailPrice: apiItem.retailPrice,
          quantity: 0, // Initialize quantity
          totalAmount: 0,
          returnQuantity: 0,
          returnAmount: 0,
              unitType: "Can", // Default to Can for all products
        }))
        
        setVanItems(mappedVanItems)
      } catch (error) {
        console.error("Error fetching van inventory:", error)
        // If API fails, set empty inventory
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
  
  // Handle unit type change
  const handleUnitTypeChange = (id: string, value: "Can" | "Liters" | "Pieces") => {
    setVanItems(prev => 
      prev.map(item => {
        if (item._id === id) {
          return { ...item, unitType: value }
        }
        return item
      })
    )
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
      .reduce((sum, item) => sum + calculateQuantityAmount(item), 0)
  }

  const getVanCurdQuantityAmount = () => {
    return vanItems
      .filter(item => item.category === "curd")
      .reduce((sum, item) => sum + calculateQuantityAmount(item), 0)
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
    const retailPrice = item.retailPrice ||0
    const quantity = item.quantity || 0
  const productKey = `${item.name} ${item.units}`
  const isCanUnit = item.unitType === "Can"
  const isPieces = item.unitType === "Pieces"
    
  let result = 0
    if (productKey.includes("FCM") && productKey.includes("500ML")) {
      // FCM is already calculated in liters
       result = isCanUnit ? a * quantity * wholesale * d : quantity * wholesale * d
    } else if (productKey.includes("FCM") && productKey.includes("1000ML")) {
      result = quantity * 72
    } else if (productKey.includes("SM") && productKey.includes("500ML")) {
      // Adjust calculation based on unit type
      result = isCanUnit ? a * quantity * wholesale * d : quantity * wholesale * d
    } else if (productKey.includes("TM") && productKey.includes("500ML") && !productKey.includes("MINI")) {
      result = isCanUnit ? a * quantity * wholesale * d : quantity * wholesale * d
    } else if (productKey.includes("DTM") && productKey.includes("500ML")) {
      result = isCanUnit ? a * quantity * wholesale * d : quantity * wholesale * d
    } else if (productKey.includes("TM MINI") && productKey.includes("160ML")) {
      if (isPieces) {
        // 160ml per piece -> convert to liters and charge per-liter wholesale
        const liters = quantity * 0.16
        result = liters * wholesale
      } else {
        result = isCanUnit ? b * quantity * wholesale : quantity * wholesale
      }
    } else if (productKey.includes("CURD") && productKey.includes("500ML") && !productKey.includes("MINI")) {
      result = isCanUnit ? a * quantity * retailPrice * d : quantity * retailPrice * d
    } else if (productKey.includes("CURD MINI") && productKey.includes("110ML")) {
      if (isPieces) {
        // 110ml per piece -> convert to liters and charge per-liter wholesale
        const liters = quantity * 0.11
        result = liters * wholesale
      } else {
        result = isCanUnit ? c * quantity * wholesale : quantity * wholesale
      }
    } else {
      result = quantity * wholesale // default calculation
    }
    
    return result
  }

  const calculateReturnAmount = (item: VanItem) => {
    const wholesale = item.wholeSalePrice || 0
    const retailPrice = item.retailPrice ||0
    const returnQuantity = item.returnQuantity || 0
    const productKey = `${item.name} ${item.units}`
    // Return amounts are always calculated in liters
    
  const isPieces = item.unitType === "Pieces"
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
      if (isPieces) {
        const liters = returnQuantity * 0.16
        result = liters * wholesale
      } else {
        result = returnQuantity * wholesale
      }
    } else if (productKey.includes("CURD") && productKey.includes("500ML") && !productKey.includes("MINI")) {
      result = returnQuantity * retailPrice * d
    } else if (productKey.includes("CURD MINI") && productKey.includes("110ML")) {
      if (isPieces) {
        const liters = returnQuantity * 0.11
        result = liters * wholesale
      } else {
        result = returnQuantity * wholesale
      }
    } else {
      result = returnQuantity * wholesale // default calculation
    }
    
    return result
  }

  const calculateActualSold = (item: VanItem) => {
    const quantity = item.quantity || 0
    const returnQuantity = item.returnQuantity || 0
    const productKey = `${item.name} ${item.units}`
  const isCanUnit = item.unitType === "Can"
  const isPieces = item.unitType === "Pieces"
    
  let result = 0
    if (productKey.includes("FCM") && productKey.includes("500ML")) {
      // FCM is already in liters
      result = quantity - returnQuantity
    } else if (productKey.includes("FCM") && productKey.includes("1000ML")) {
      result = quantity - returnQuantity
    } else if (productKey.includes("SM") && productKey.includes("500ML")) {
      // For cans, convert to liters first
      result = isCanUnit ? a * quantity - returnQuantity : quantity - returnQuantity
    } else if (productKey.includes("TM") && productKey.includes("500ML") && !productKey.includes("MINI")) {
      result = isCanUnit ? a * quantity - returnQuantity : quantity - returnQuantity
    } else if (productKey.includes("DTM") && productKey.includes("500ML")) {
      result = isCanUnit ? a * quantity - returnQuantity : quantity - returnQuantity
    } else if (productKey.includes("TM MINI") && productKey.includes("160ML")) {
      if (isPieces) {
        const litersQty = quantity * 0.16
        const litersReturn = returnQuantity * 0.16
        result = litersQty - litersReturn
      } else {
        result = isCanUnit ? b * quantity - returnQuantity : quantity - returnQuantity
      }
    } else if (productKey.includes("CURD") && productKey.includes("500ML") && !productKey.includes("MINI")) {
      result = isCanUnit ? a * quantity - returnQuantity : quantity - returnQuantity
    } else if (productKey.includes("CURD MINI") && productKey.includes("110ML")) {
      if (isPieces) {
        const litersQty = quantity * 0.11
        const litersReturn = returnQuantity * 0.11
        result = litersQty - litersReturn
      } else {
        result = isCanUnit ? c * quantity - returnQuantity : quantity - returnQuantity
      }
    } else {
      result = quantity - returnQuantity // default calculation
    }
    
    return result
  }

  const calculateTotalAmount = (item: VanItem) => {
    const wholesale = item.wholeSalePrice || 0
    const retailPrice = item.retailPrice ||0
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

  // Save data to API
  const handleSave = async () => {
    setSaving(true)
    try {
      const formattedDate = format(selectedDate, "yyyy-MM-dd")
      
      const payload = vanItems
        .filter(item => item.quantity > 0 || item.returnQuantity > 0)
        .map(item => ({
          productId: item._id,
          name: item.name,
          units: item.units,
          quantity: item.quantity,
          quantityPrice: calculateQuantityAmount(item),
          returnQuantity: item.returnQuantity,
          returnAmount: calculateReturnAmount(item),
          totalAmount: calculateTotalAmount(item),
          addedDate: formattedDate,
          type: "van",
          unitType: item.unitType // Include unitType in the payload
        }))

     const response = await axios.post(`${API}/api/V1/inventory/add`, payload, {
        headers: { "Content-Type": "application/json" }
      })

      console.log("Save response:", response.data);
      toast.success("Van inventory saved successfully!")
    } catch (error) {
      toast.error("Error saving van inventory!")
      console.error("Error saving van inventory:", error)
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
                <TableHead className="font-bold">Product Name</TableHead>
                <TableHead className="font-bold">Units</TableHead>
                <TableHead className="font-bold">Category</TableHead>
                <TableHead className="font-bold">Unit Type</TableHead>
                <TableHead className="font-bold">Quantity</TableHead>
                <TableHead className="font-bold">Quantity Amount</TableHead>
                <TableHead className="font-bold">Return Quantity (Liters)</TableHead>
                <TableHead className="font-bold">Return Amount</TableHead>
                <TableHead className="font-bold">Total Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* MILK Products */}
              {vanItems
                .filter(item => item.category === "milk")
                .map((item) => (
                  <TableRow key={item._id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>
                      <Select
                        value={item.unitType}
                        onValueChange={(value) => handleUnitTypeChange(item._id, value as "Can" | "Liters" | "Pieces")}
                      >
                        <SelectTrigger className="w-[100px]">
                          <SelectValue placeholder="Unit Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Can">Can</SelectItem>
                          <SelectItem value="Liters">Liters</SelectItem>
                          <SelectItem value="Pieces">Pieces</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        value={focusedInput === item._id && item.quantity === 0 ? "" : item.quantity}
                        onChange={(e) => handleVanItemChange(item._id, 'quantity', parseInt(e.target.value) || 0)}
                        onFocus={() => setFocusedInput(item._id)}
                        onBlur={() => setFocusedInput(null)}
                        className="w-20"
                      />
                    </TableCell>
                    <TableCell>₹{calculateQuantityAmount(item)}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        value={focusedInput === item._id && item.returnQuantity === 0 ? "" : item.returnQuantity}
                        onChange={(e) => handleVanItemChange(item._id, 'returnQuantity', parseInt(e.target.value) || 0)}
                        onFocus={() => setFocusedInput(item._id)}
                        onBlur={() => setFocusedInput(null)}
                        className="w-20"
                      />
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
                      <Select
                        value={item.unitType}
                        onValueChange={(value) => handleUnitTypeChange(item._id, value as "Can" | "Liters")}
                      >
                        <SelectTrigger className="w-[100px]">
                          <SelectValue placeholder="Unit Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Can">Can</SelectItem>
                          <SelectItem value="Liters">Liters</SelectItem>
                          <SelectItem value="Pieces">Pieces</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        value={focusedInput === item._id && item.quantity === 0 ? "" : item.quantity}
                        onChange={(e) => handleVanItemChange(item._id, 'quantity', parseInt(e.target.value) || 0)}
                        onFocus={() => setFocusedInput(item._id)}
                        onBlur={() => setFocusedInput(null)}
                        className="w-20"
                      />
                    </TableCell>
                    <TableCell>₹{calculateQuantityAmount(item)}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        value={focusedInput === item._id && item.returnQuantity === 0 ? "" : item.returnQuantity}
                        onChange={(e) => handleVanItemChange(item._id, 'returnQuantity', parseInt(e.target.value) || 0)}
                        onFocus={() => setFocusedInput(item._id)}
                        onBlur={() => setFocusedInput(null)}
                        className="w-20"
                      />
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

      {/* Return Cash input and Net Total */}
      <div className="flex items-center justify-end gap-4">
        <label className="flex items-center gap-2">
          <span className="text-sm">Return Cash:</span>
          <Input
            type="number"
            min="0"
            value={returnCash}
            onChange={(e) => setReturnCash(Number(e.target.value) || 0)}
            className="w-32"
          />
        </label>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">Net Total</div>
          <div className="font-bold text-lg">₹{(getVanGrandTotalAmount() - returnCash).toFixed(2)}</div>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-6 flex justify-center">
        <Button
          onClick={handleSave}
          disabled={saving || (getVanGrandQuantity() === 0 && getVanGrandReturnQuantity() === 0)}
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
              Save Van Inventory
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
