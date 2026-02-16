"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, ShoppingCart, Package, BarChart3 } from "lucide-react"
import Link from "next/link"
import {
  getAnalyticsSummary,
  getProductAnalytics,
  getCategoryAnalytics,
  getTimeSeriesData,
  getComparisonData,
  getProductComparison,
  getCategoryComparison,
  getComparisonPeriods,
  formatCurrency,
  formatPercentage,
  type AnalyticsData,
  type ProductAnalytics,
  type CategoryAnalytics,
  type TimeSeriesData,
  type AnalyticsFilters,
  type ComparisonData,
  type ProductComparison,
  type CategoryComparison,
} from "@/lib/analytics"
import { RevenueTrendChart } from "@/components/analytics/revenue-trend-chart"
import { SalesDistributionChart } from "@/components/analytics/sales-distribution-chart"
import { ProductPerformanceChart } from "@/components/analytics/product-performance-chart"
import { CategoryPerformanceChart } from "@/components/analytics/category-performance-chart"
import { AnalyticsFilters as AnalyticsFiltersComponent } from "@/components/analytics/analytics-filters"
import { ComparisonMetrics } from "@/components/analytics/comparison-metrics"
import { ProductComparisonTable } from "@/components/analytics/product-comparison-table"
import { CategoryComparisonChart } from "@/components/analytics/category-comparison-chart"
import axios from "axios"

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<AnalyticsData | null>(null)
  const [productAnalytics, setProductAnalytics] = useState<ProductAnalytics[]>([])
  const [categoryAnalytics, setCategoryAnalytics] = useState<CategoryAnalytics[]>([])
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([])
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null)
  const [productComparison, setProductComparison] = useState<ProductComparison[]>([])
  const [categoryComparison, setCategoryComparison] = useState<CategoryComparison[]>([])
  const [filters, setFilters] = useState<AnalyticsFilters>({})
  const [loading, setLoading] = useState(true)


  const API = process.env.NEXT_PUBLIC_API_URL;
  const loadAnalytics = async (currentFilters: AnalyticsFilters = {}) => {
    setLoading(true)
    try {
      console.log("[v0] Loading analytics with filters:", currentFilters)

      const periods = getComparisonPeriods(currentFilters)

      const [
        summaryData,
        productData,
        categoryData,
        timeData,
        comparisonSummary,
        productComparisonData,
        categoryComparisonData,
      ] = await Promise.all([
        getAnalyticsSummary(currentFilters),
        getProductAnalytics(currentFilters),
        getCategoryAnalytics(currentFilters),
        getTimeSeriesData("daily", currentFilters),
        getComparisonData(periods.current, periods.previous),
        getProductComparison(periods.current, periods.previous),
        getCategoryComparison(periods.current, periods.previous),
      ])

      setSummary(summaryData)
      setProductAnalytics(productData)
      setCategoryAnalytics(categoryData)
      setTimeSeriesData(timeData)
      setComparisonData(comparisonSummary)
      setProductComparison(productComparisonData)
      setCategoryComparison(categoryComparisonData)
    } catch (error) {
      console.error("Failed to load analytics:", error)
    } finally {
      setLoading(false)
    }
  }


  useEffect(() => {
    const fetch = async () => {
      const fetching = await axios.get(`${API}/api/V1/sales/date/2026-02-16`)

      console.log(fetching)
      await loadAnalytics(filters)
    }
    fetch()
  }, [filters])

  const handleFiltersChange = (newFilters: AnalyticsFilters) => {
    console.log("[v0] Filters changed:", newFilters)
    setFilters(newFilters)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/sales">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Sales
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-card-foreground">Sales Analytics</h1>
                <p className="text-sm text-muted-foreground">Comprehensive insights into your dairy product sales</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        <AnalyticsFiltersComponent filters={filters} onFiltersChange={handleFiltersChange} />

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="comparison">Period Comparison</TabsTrigger>
            <TabsTrigger value="products">Product Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* KPI Cards */}
            {summary && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <Card className="col-span-1 md:col-span-2 lg:col-span-1 xl:col-span-2">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">{formatCurrency(summary.totalRevenue)}</div>
                    <p className="text-xs text-muted-foreground">
                      <TrendingUp className="inline h-3 w-3 mr-1" />
                      +12.5% from last month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-secondary">{formatCurrency(summary.totalProfit)}</div>
                    <p className="text-xs text-muted-foreground">{formatPercentage(summary.profitMargin)} margin</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{summary.totalTransactions.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(summary.averageOrderValue)} avg order
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Items Sold</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{summary.totalItemsSold.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                      {(summary.totalItemsSold / summary.totalTransactions).toFixed(1)} per transaction
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatPercentage(summary.profitMargin)}</div>
                    <p className="text-xs text-muted-foreground">
                      <TrendingUp className="inline h-3 w-3 mr-1" />
                      +2.1% improvement
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(summary.averageOrderValue)}</div>
                    <p className="text-xs text-muted-foreground">
                      <TrendingDown className="inline h-3 w-3 mr-1" />
                      -1.2% from last week
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Main Analytics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              <Card className="xl:col-span-3">
                <CardHeader>
                  <CardTitle className="flex justify-center Item-center">Todays</CardTitle>

                </CardHeader>

              </Card>
              {/* Top Products */}
              <Card className="xl:col-span-2">
                <CardHeader>
                  <CardTitle>Top Performing Products</CardTitle>
                  <CardDescription>Revenue and profit analysis by product</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {productAnalytics.slice(0, 5).map((product) => (
                      <div
                        key={product.productId}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                      >
                        <div className="flex-1">
                          <div className="font-medium">{product.productName}</div>
                          <div className="text-sm text-muted-foreground">{product.category}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(product.revenue)}</div>
                          <div className="text-sm text-muted-foreground">
                            {product.quantitySold} sold • {formatPercentage(product.profitMargin)} margin
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Category Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Category Performance</CardTitle>
                  <CardDescription>Sales breakdown by product category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {categoryAnalytics.map((category) => (
                      <div key={category.category} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{category.category}</span>
                          <span className="text-sm text-muted-foreground">
                            {formatPercentage(category.marketShare)}
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${category.marketShare}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>{formatCurrency(category.revenue)}</span>
                          <span>{category.quantitySold} items</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trends</CardTitle>
                  <CardDescription>Daily revenue and profit trends over the last 30 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <RevenueTrendChart data={timeSeriesData} className="h-64" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sales Distribution</CardTitle>
                  <CardDescription>Retail vs Wholesale sales breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <SalesDistributionChart
                    retailRevenue={summary ? summary.totalRevenue * 0.65 : 0}
                    wholesaleRevenue={summary ? summary.totalRevenue * 0.35 : 0}
                    className="h-64"
                  />
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Product Performance</CardTitle>
                  <CardDescription>Revenue and profit comparison across top products</CardDescription>
                </CardHeader>
                <CardContent>
                  <ProductPerformanceChart data={productAnalytics} className="h-80" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Category Revenue</CardTitle>
                  <CardDescription>Revenue distribution by product category</CardDescription>
                </CardHeader>
                <CardContent>
                  <CategoryPerformanceChart data={categoryAnalytics} className="h-80" />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="comparison" className="space-y-6">
            {comparisonData && (
              <>
                <ComparisonMetrics data={comparisonData} />

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <ProductComparisonTable data={productComparison} />

                  <Card>
                    <CardHeader>
                      <CardTitle>Category Performance Comparison</CardTitle>
                      <CardDescription>Revenue comparison across categories</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <CategoryComparisonChart data={categoryComparison} className="h-80" />
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Product Performance</CardTitle>
                  <CardDescription>Revenue and profit comparison across top products</CardDescription>
                </CardHeader>
                <CardContent>
                  <ProductPerformanceChart data={productAnalytics} className="h-80" />
                </CardContent>
              </Card>

              <ProductComparisonTable data={productComparison} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
