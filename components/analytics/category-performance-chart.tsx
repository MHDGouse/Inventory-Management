"use client"

import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { formatCurrency, formatPercentage } from "@/lib/analytics"
import type { CategoryAnalytics } from "@/lib/analytics"

interface CategoryPerformanceChartProps {
  data: CategoryAnalytics[]
  className?: string
}

export function CategoryPerformanceChart({ data, className }: CategoryPerformanceChartProps) {
  const chartConfig = {
    revenue: {
      label: "Revenue",
      color: "hsl(var(--chart-1))",
    },
  }

  // Color palette for different categories
  const colors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ]

  return (
    <ChartContainer config={chartConfig} className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="category" className="text-xs" />
          <YAxis className="text-xs" tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`} />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value, name, props) => [
                  formatCurrency(Number(value)),
                  `Revenue (${formatPercentage(props.payload?.profitMargin || 0)} margin)`,
                ]}
                labelFormatter={(label) => `${label} Category`}
              />
            }
          />
          <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
