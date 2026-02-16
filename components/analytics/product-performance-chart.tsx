"use client"

import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { formatCurrency } from "@/lib/analytics"
import type { ProductAnalytics } from "@/lib/analytics"

interface ProductPerformanceChartProps {
  data: ProductAnalytics[]
  className?: string
}

export function ProductPerformanceChart({ data, className }: ProductPerformanceChartProps) {
  const chartConfig = {
    revenue: {
      label: "Revenue",
      color: "hsl(var(--chart-1))",
    },
    profit: {
      label: "Profit",
      color: "hsl(var(--chart-2))",
    },
  }

  // Prepare data for the chart with shortened product names
  const chartData = data.slice(0, 8).map((product) => ({
    ...product,
    shortName: product.productName.length > 15 ? product.productName.substring(0, 15) + "..." : product.productName,
  }))

  return (
    <ChartContainer config={chartConfig} className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="shortName" className="text-xs" angle={-45} textAnchor="end" height={80} interval={0} />
          <YAxis className="text-xs" tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`} />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value, name) => [formatCurrency(Number(value)), name]}
                labelFormatter={(label) => {
                  const product = data.find((p) => p.shortName === label || p.productName === label)
                  return product?.productName || label
                }}
              />
            }
          />
          <Legend />
          <Bar dataKey="revenue" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} name="Revenue" />
          <Bar dataKey="profit" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} name="Profit" />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
