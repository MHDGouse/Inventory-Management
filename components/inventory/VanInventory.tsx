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
}

interface VanInventoryProps {
  selectedDate: Date
}

export default function VanInventory({ selectedDate }: VanInventoryProps) {
  const [vanItems, setVanItems] = useState<VanItem[]>([])
  const [loading, setLoading] = useState(true)
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
        const response = await axios.get(`${API}/api/V1/products/all`)
        console.log("van respons",response.data)
        // Map API data directly to van items
        const mappedVanItems = response.data.map((apiItem: any) => ({
          _id: apiItem._id,
          name: apiItem.name,
          units: apiItem.units,
          category: apiItem.category,
          wholeSalePrice: apiItem.wholeSalePrice,
          retailPrice:apiItem.retailPrice,
          quantity: 0, // Initialize quantity
          totalAmount: 0,
          returnQuantity: 0,
          returnAmount: 0
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
    
    // console.log(`Calculating quantity amount for ${productKey}:`, { wholesale, quantity, productKey })
    
    let result = 0
    if (productKey.includes("FCM") && productKey.includes("500ML")) {
      result = quantity * wholesale * d
    } else if (productKey.includes("FCM") && productKey.includes("1000ML")) {
      result =  quantity * 72
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
    const retailPrice = item.retailPrice ||0
    const returnQuantity = item.returnQuantity || 0
    const productKey = `${item.name} ${item.units}`
    
    // console.log(`Calculating return amount for ${productKey}:`, { wholesale, returnQuantity, productKey })
    
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
    
    // console.log(`Return amount result for ${productKey}:`, result)
    return result
  }

  const calculateActualSold = (item: VanItem) => {
    const quantity = item.quantity || 0
    const retailPrice = item.retailPrice ||0
    const returnQuantity = item.returnQuantity || 0
    const productKey = `${item.name} ${item.units}`
    
    // console.log(`Calculating actual sold for ${productKey}:`, { quantity, returnQuantity, productKey })
    
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
    
    // console.log(`Actual sold result for ${productKey}:`, result)
    return result
  }

  const calculateTotalAmount = (item: VanItem) => {
    const wholesale = item.wholeSalePrice || 0
    const retailPrice = item.retailPrice ||0
    const actualSold = calculateActualSold(item)
    const productKey = `${item.name} ${item.units}`
    
    // console.log(`Calculating total amount for ${productKey}:`, { wholesale, actualSold, productKey })
    
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
    
    // console.log(`Total amount result for ${productKey}:`, result)
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
          type: "van"
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
                <TableHead className="font-bold">Quantity (Cans)</TableHead>
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
                    <TableCell>{item.units}</TableCell>
                    <TableCell>{item.category}</TableCell>
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
