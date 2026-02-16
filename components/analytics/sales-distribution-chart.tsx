"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { formatCurrency, formatPercentage } from "@/lib/analytics"

interface SalesDistributionData {
  name: string
  value: number
  percentage: number
  color: string
}

interface SalesDistributionChartProps {
  retailRevenue: number
  wholesaleRevenue: number
  className?: string
}

export function SalesDistributionChart({ retailRevenue, wholesaleRevenue, className }: SalesDistributionChartProps) {
  const total = retailRevenue + wholesaleRevenue

  const data: SalesDistributionData[] = [
    {
      name: "Retail Sales",
      value: retailRevenue,
      percentage: (retailRevenue / total) * 100,
      color: "hsl(var(--chart-1))",
    },
    {
      name: "Wholesale Sales",
      value: wholesaleRevenue,
      percentage: (wholesaleRevenue / total) * 100,
      color: "hsl(var(--chart-2))",
    },
  ]

  const chartConfig = {
    retail: {
      label: "Retail Sales",
      color: "hsl(var(--chart-1))",
    },
    wholesale: {
      label: "Wholesale Sales",
      color: "hsl(var(--chart-2))",
    },
  }

  return (
    <ChartContainer config={chartConfig} className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value, name) => [
                  `${formatCurrency(Number(value))} (${formatPercentage(data.find((d) => d.name === name)?.percentage || 0)})`,
                  name,
                ]}
              />
            }
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value, entry) => (
              <span style={{ color: entry.color }}>
                {value}: {formatCurrency(data.find((d) => d.name === value)?.value || 0)}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
