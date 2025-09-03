"use client"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Plus, CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import Link from "next/link"
import ShopInventoryTab from "./ShopInventoryTab"
import VanInventoryTab from "./VanInventoryTab"

export default function InventoryTable() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [activeTab, setActiveTab] = useState("shop")

  return (
    <div className="p-4">
      {/* Header with Date Picker and Add Inventory Button */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold">Inventory Management</h1>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <Link href="/dashboard/inventory/inventory-items" className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add Inventory</span>
        </Link>
      </div>

      {/* Tabs for Shop and Van */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="shop">Shop</TabsTrigger>
          <TabsTrigger value="van">Van</TabsTrigger>
        </TabsList>
        
        {/* Shop Tab */}
        <TabsContent value="shop">
          <ShopInventoryTab selectedDate={selectedDate} />
        </TabsContent>

        {/* Van Tab */}
        <TabsContent value="van">
          <VanInventoryTab selectedDate={selectedDate} />
        </TabsContent>
      </Tabs>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  )
}
