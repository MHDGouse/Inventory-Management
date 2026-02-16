"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, Filter, X, RefreshCw } from "lucide-react"
import { format, subDays } from "date-fns"
import { cn } from "@/lib/utils"
import type { AnalyticsFilters } from "@/lib/analytics"

interface AnalyticsFiltersProps {
  filters: AnalyticsFilters
  onFiltersChange: (filters: AnalyticsFilters) => void
  className?: string
}

const categories = ["All Categories", "Milk", "Cheese", "Yogurt", "Butter", "Cream"]
const saleTypes = [
  { value: "all", label: "All Sales" },
  { value: "retail", label: "Retail Only" },
  { value: "wholesale", label: "Wholesale Only" },
]

const quickDateRanges = [
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
  { label: "This month", days: "month" as const },
  { label: "Last month", days: "lastMonth" as const },
]

export function AnalyticsFiltersComponent({ filters, onFiltersChange, className }: AnalyticsFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [startDate, setStartDate] = useState<Date | undefined>(
    filters.startDate ? new Date(filters.startDate) : undefined,
  )
  const [endDate, setEndDate] = useState<Date | undefined>(filters.endDate ? new Date(filters.endDate) : undefined)

  const handleDateRangeChange = (start: Date | undefined, end: Date | undefined) => {
    setStartDate(start)
    setEndDate(end)
    onFiltersChange({
      ...filters,
      startDate: start?.toISOString().split("T")[0],
      endDate: end?.toISOString().split("T")[0],
    })
  }

  const handleQuickDateRange = (range: (typeof quickDateRanges)[0]) => {
    const today = new Date()
    let start: Date
    let end: Date = today

    if (range.days === "month") {
      start = new Date(today.getFullYear(), today.getMonth(), 1)
    } else if (range.days === "lastMonth") {
      start = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      end = new Date(today.getFullYear(), today.getMonth(), 0)
    } else {
      start = subDays(today, range.days)
    }

    handleDateRangeChange(start, end)
  }

  const handleSaleTypeChange = (value: string) => {
    onFiltersChange({
      ...filters,
      saleType: value === "all" ? undefined : (value as "retail" | "wholesale"),
    })
  }

  const handleCategoryChange = (value: string) => {
    onFiltersChange({
      ...filters,
      category: value === "All Categories" ? undefined : value,
    })
  }

  const clearFilters = () => {
    setStartDate(undefined)
    setEndDate(undefined)
    onFiltersChange({})
  }

  const activeFiltersCount = Object.values(filters).filter(Boolean).length

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Filter Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Filters</span>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {activeFiltersCount} active
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="text-xs">
                {isExpanded ? "Less" : "More"} Filters
              </Button>
              {activeFiltersCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs gap-1">
                  <X className="h-3 w-3" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2">
            {quickDateRanges.map((range) => (
              <Button
                key={range.label}
                variant="outline"
                size="sm"
                onClick={() => handleQuickDateRange(range)}
                className="text-xs"
              >
                {range.label}
              </Button>
            ))}
          </div>

          {/* Main Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "flex-1 justify-start text-left font-normal",
                        !startDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "MMM dd") : "Start"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      disabled={(date) => date > new Date() || (endDate && date > endDate)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("flex-1 justify-start text-left font-normal", !endDate && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "MMM dd") : "End"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      disabled={(date) => date > new Date() || (startDate && date < startDate)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              {(startDate || endDate) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDateRangeChange(startDate, endDate)}
                  className="w-full text-xs gap-1"
                >
                  <RefreshCw className="h-3 w-3" />
                  Apply Date Range
                </Button>
              )}
            </div>

            {/* Sale Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Sale Type</label>
              <Select value={filters.saleType || "all"} onValueChange={handleSaleTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select sale type" />
                </SelectTrigger>
                <SelectContent>
                  {saleTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={filters.category || "All Categories"} onValueChange={handleCategoryChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Additional Filters (shown when expanded) */}
            {isExpanded && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Time Period</label>
                <Select defaultValue="daily">
                  <SelectTrigger>
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Active Filters Display */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              {filters.startDate && (
                <Badge variant="outline" className="gap-1">
                  From: {format(new Date(filters.startDate), "MMM dd, yyyy")}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => handleDateRangeChange(undefined, endDate)} />
                </Badge>
              )}
              {filters.endDate && (
                <Badge variant="outline" className="gap-1">
                  To: {format(new Date(filters.endDate), "MMM dd, yyyy")}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => handleDateRangeChange(startDate, undefined)} />
                </Badge>
              )}
              {filters.saleType && (
                <Badge variant="outline" className="gap-1">
                  {filters.saleType === "retail" ? "Retail Sales" : "Wholesale Sales"}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => handleSaleTypeChange("all")} />
                </Badge>
              )}
              {filters.category && (
                <Badge variant="outline" className="gap-1">
                  {filters.category}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => handleCategoryChange("All Categories")} />
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export { AnalyticsFiltersComponent as AnalyticsFilters }
