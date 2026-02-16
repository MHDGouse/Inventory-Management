"use client"

import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { formatCurrency, formatPercentage, type CategoryComparison } from "@/lib/analytics"

interface CategoryComparisonChartProps {
  data: CategoryComparison[]
  className?: string
}

export function CategoryComparisonChart({ data, className }: CategoryComparisonChartProps) {
  const chartConfig = {
    current: {
      label: "Current Period",
      color: "hsl(var(--chart-1))",
    },
    previous: {
      label: "Previous Period",
      color: "hsl(var(--chart-2))",
    },
  }

  const chartData = data.map((category) => ({
    category: category.category,
    current: category.current.revenue,
    previous: category.previous.revenue,
    change: category.changes.revenue,
  }))

  return (
    <ChartContainer config={chartConfig} className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="category" className="text-xs" />
          <YAxis className="text-xs" tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`} />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value, name, props) => [
                  formatCurrency(Number(value)),
                  name === "current" ? "Current Period" : "Previous Period",
                ]}
                labelFormatter={(label) => {
                  const item = chartData.find((d) => d.category === label)
                  return `${label} (${item?.change > 0 ? "+" : ""}${formatPercentage(item?.change || 0)})`
                }}
              />
            }
          />
          <Legend />
          <Bar dataKey="current" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} name="Current Period" />
          <Bar dataKey="previous" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} name="Previous Period" />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
