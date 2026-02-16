"use client"

import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { formatCurrency } from "@/lib/analytics"
import type { TimeSeriesData } from "@/lib/analytics"

interface RevenueTrendChartProps {
  data: TimeSeriesData[]
  className?: string
}

export function RevenueTrendChart({ data, className }: RevenueTrendChartProps) {
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

  return (
    <ChartContainer config={chartConfig} className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="date"
            className="text-xs"
            tickFormatter={(value) => new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          />
          <YAxis className="text-xs" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value, name) => [formatCurrency(Number(value)), name]}
                labelFormatter={(label) =>
                  new Date(label).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })
                }
              />
            }
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="var(--color-chart-1)"
            strokeWidth={2}
            dot={{ fill: "var(--color-chart-1)", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: "var(--color-chart-1)", strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="profit"
            stroke="var(--color-chart-2)"
            strokeWidth={2}
            dot={{ fill: "var(--color-chart-2)", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: "var(--color-chart-2)", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
