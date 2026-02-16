"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { formatCurrency, formatPercentage, type ProductComparison } from "@/lib/analytics"

interface ProductComparisonTableProps {
  data: ProductComparison[]
  className?: string
}

export function ProductComparisonTable({ data, className }: ProductComparisonTableProps) {
  const getTrendIcon = (change: number) => {
    if (change > 5) return <TrendingUp className="h-3 w-3 text-green-600" />
    if (change < -5) return <TrendingDown className="h-3 w-3 text-red-600" />
    return <Minus className="h-3 w-3 text-muted-foreground" />
  }

  const getTrendColor = (change: number) => {
    if (change > 5) return "text-green-600"
    if (change < -5) return "text-red-600"
    return "text-muted-foreground"
  }

  const sortedData = [...data].sort((a, b) => b.changes.revenue - a.changes.revenue)

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Product Performance Comparison</CardTitle>
        <CardDescription>Revenue changes compared to previous period</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedData.slice(0, 10).map((product) => (
            <div key={product.productId} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex-1">
                <div className="font-medium">{product.productName}</div>
                <div className="text-sm text-muted-foreground">{product.category}</div>
                <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                  <span>Current: {formatCurrency(product.current.revenue)}</span>
                  <span>Previous: {formatCurrency(product.previous.revenue)}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 mb-1">
                  {getTrendIcon(product.changes.revenue)}
                  <span className={`font-medium ${getTrendColor(product.changes.revenue)}`}>
                    {formatPercentage(Math.abs(product.changes.revenue))}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {product.current.quantitySold} sold ({product.changes.quantitySold > 0 ? "+" : ""}
                  {formatPercentage(product.changes.quantitySold)})
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
