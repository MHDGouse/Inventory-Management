"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus, DollarSign, ShoppingCart, Package, BarChart3 } from "lucide-react"
import { formatCurrency, formatPercentage, type ComparisonData } from "@/lib/analytics"

interface ComparisonMetricsProps {
  data: ComparisonData
  className?: string
}

export function ComparisonMetrics({ data, className }: ComparisonMetricsProps) {
  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-3 w-3 text-green-600" />
    if (change < 0) return <TrendingDown className="h-3 w-3 text-red-600" />
    return <Minus className="h-3 w-3 text-muted-foreground" />
  }

  const getTrendColor = (change: number) => {
    if (change > 0) return "text-green-600"
    if (change < 0) return "text-red-600"
    return "text-muted-foreground"
  }

  const getBadgeVariant = (change: number) => {
    if (change > 0) return "default"
    if (change < 0) return "destructive"
    return "secondary"
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 ${className}`}>
      <Card className="col-span-1 md:col-span-2 lg:col-span-1 xl:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">{formatCurrency(data.current.totalRevenue)}</div>
          <div className="flex items-center gap-2 mt-1">
            {getTrendIcon(data.percentageChanges.revenue)}
            <span className={`text-xs font-medium ${getTrendColor(data.percentageChanges.revenue)}`}>
              {formatPercentage(Math.abs(data.percentageChanges.revenue))}
            </span>
            <Badge variant={getBadgeVariant(data.percentageChanges.revenue)} className="text-xs">
              vs previous period
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Previous: {formatCurrency(data.previous.totalRevenue)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-secondary">{formatCurrency(data.current.totalProfit)}</div>
          <div className="flex items-center gap-2 mt-1">
            {getTrendIcon(data.percentageChanges.profit)}
            <span className={`text-xs font-medium ${getTrendColor(data.percentageChanges.profit)}`}>
              {formatPercentage(Math.abs(data.percentageChanges.profit))}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Previous: {formatCurrency(data.previous.totalProfit)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Transactions</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.current.totalTransactions.toLocaleString()}</div>
          <div className="flex items-center gap-2 mt-1">
            {getTrendIcon(data.percentageChanges.transactions)}
            <span className={`text-xs font-medium ${getTrendColor(data.percentageChanges.transactions)}`}>
              {formatPercentage(Math.abs(data.percentageChanges.transactions))}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Previous: {data.previous.totalTransactions.toLocaleString()}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Items Sold</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.current.totalItemsSold.toLocaleString()}</div>
          <div className="flex items-center gap-2 mt-1">
            {getTrendIcon(data.percentageChanges.itemsSold)}
            <span className={`text-xs font-medium ${getTrendColor(data.percentageChanges.itemsSold)}`}>
              {formatPercentage(Math.abs(data.percentageChanges.itemsSold))}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Previous: {data.previous.totalItemsSold.toLocaleString()}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatPercentage(data.current.profitMargin)}</div>
          <div className="flex items-center gap-2 mt-1">
            {getTrendIcon(data.percentageChanges.profitMargin)}
            <span className={`text-xs font-medium ${getTrendColor(data.percentageChanges.profitMargin)}`}>
              {formatPercentage(Math.abs(data.percentageChanges.profitMargin))}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Previous: {formatPercentage(data.previous.profitMargin)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(data.current.averageOrderValue)}</div>
          <div className="flex items-center gap-2 mt-1">
            {getTrendIcon(data.percentageChanges.averageOrderValue)}
            <span className={`text-xs font-medium ${getTrendColor(data.percentageChanges.averageOrderValue)}`}>
              {formatPercentage(Math.abs(data.percentageChanges.averageOrderValue))}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Previous: {formatCurrency(data.previous.averageOrderValue)}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
