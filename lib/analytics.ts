export interface AnalyticsData {
  totalRevenue: number
  totalProfit: number
  totalTransactions: number
  totalItemsSold: number
  averageOrderValue: number
  profitMargin: number
}

export interface ProductAnalytics {
  productId: number
  productName: string
  category: string
  quantitySold: number
  revenue: number
  profit: number
  profitMargin: number
  averagePrice: number
}

export interface CategoryAnalytics {
  category: string
  totalProducts: number
  quantitySold: number
  revenue: number
  profit: number
  profitMargin: number
  marketShare: number
}

export interface TimeSeriesData {
  date: string
  revenue: number
  profit: number
  transactions: number
  itemsSold: number
}

export interface AnalyticsFilters {
  startDate?: string
  endDate?: string
  saleType?: "retail" | "wholesale" | "all"
  category?: string
  productIds?: number[]
}

// Mock analytics functions - replace with actual database queries
export async function getAnalyticsSummary(filters: AnalyticsFilters = {}): Promise<AnalyticsData> {
  // In a real app, this would query the database with filters
  const mockData: AnalyticsData = {
    totalRevenue: 15420.5,
    totalProfit: 4326.75,
    totalTransactions: 342,
    totalItemsSold: 1247,
    averageOrderValue: 45.09,
    profitMargin: 28.05,
  }
  return mockData
}

export async function getProductAnalytics(filters: AnalyticsFilters = {}): Promise<ProductAnalytics[]> {
  // Mock product analytics data
  const mockData: ProductAnalytics[] = [
    {
      productId: 1,
      productName: "Whole Milk 1L",
      category: "Milk",
      quantitySold: 156,
      revenue: 622.44,
      profit: 156.0,
      profitMargin: 25.06,
      averagePrice: 3.99,
    },
    {
      productId: 2,
      productName: "Cheddar Cheese 200g",
      category: "Cheese",
      quantitySold: 89,
      revenue: 622.11,
      profit: 133.5,
      profitMargin: 21.46,
      averagePrice: 6.99,
    },
    {
      productId: 3,
      productName: "Greek Yogurt 500g",
      category: "Yogurt",
      quantitySold: 124,
      revenue: 680.76,
      profit: 161.2,
      profitMargin: 23.68,
      averagePrice: 5.49,
    },
  ]
  return mockData
}

export async function getCategoryAnalytics(filters: AnalyticsFilters = {}): Promise<CategoryAnalytics[]> {
  // Mock category analytics data
  const mockData: CategoryAnalytics[] = [
    {
      category: "Milk",
      totalProducts: 4,
      quantitySold: 245,
      revenue: 1156.78,
      profit: 289.2,
      profitMargin: 25.01,
      marketShare: 32.5,
    },
    {
      category: "Cheese",
      totalProducts: 4,
      quantitySold: 178,
      revenue: 1344.22,
      profit: 268.84,
      profitMargin: 20.0,
      marketShare: 28.7,
    },
    {
      category: "Yogurt",
      totalProducts: 3,
      quantitySold: 198,
      revenue: 987.45,
      profit: 246.86,
      profitMargin: 25.0,
      marketShare: 21.2,
    },
    {
      category: "Butter",
      totalProducts: 2,
      quantitySold: 134,
      revenue: 668.66,
      profit: 133.73,
      profitMargin: 20.0,
      marketShare: 17.6,
    },
  ]
  return mockData
}

export async function getTimeSeriesData(
  period: "daily" | "weekly" | "monthly",
  filters: AnalyticsFilters = {},
): Promise<TimeSeriesData[]> {
  // Mock time series data for the last 30 days
  const mockData: TimeSeriesData[] = []
  const today = new Date()

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)

    mockData.push({
      date: date.toISOString().split("T")[0],
      revenue: Math.random() * 800 + 200,
      profit: Math.random() * 200 + 50,
      transactions: Math.floor(Math.random() * 20) + 5,
      itemsSold: Math.floor(Math.random() * 50) + 10,
    })
  }

  return mockData
}

export async function getTopPerformingProducts(
  limit = 10,
  filters: AnalyticsFilters = {},
): Promise<ProductAnalytics[]> {
  const allProducts = await getProductAnalytics(filters)
  return allProducts.sort((a, b) => b.revenue - a.revenue).slice(0, limit)
}

export async function getProfitTrends(filters: AnalyticsFilters = {}): Promise<{
  currentPeriod: number
  previousPeriod: number
  percentageChange: number
}> {
  // Mock profit trend data
  return {
    currentPeriod: 4326.75,
    previousPeriod: 3892.45,
    percentageChange: 11.16,
  }
}

export function calculateProfitMargin(revenue: number, cost: number): number {
  if (revenue === 0) return 0
  return ((revenue - cost) / revenue) * 100
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`
}

export interface ComparisonData {
  current: AnalyticsData
  previous: AnalyticsData
  percentageChanges: {
    revenue: number
    profit: number
    transactions: number
    itemsSold: number
    averageOrderValue: number
    profitMargin: number
  }
}

export interface ProductComparison {
  productId: number
  productName: string
  category: string
  current: {
    revenue: number
    profit: number
    quantitySold: number
    profitMargin: number
  }
  previous: {
    revenue: number
    profit: number
    quantitySold: number
    profitMargin: number
  }
  changes: {
    revenue: number
    profit: number
    quantitySold: number
    profitMargin: number
  }
}

export interface CategoryComparison {
  category: string
  current: CategoryAnalytics
  previous: CategoryAnalytics
  changes: {
    revenue: number
    profit: number
    quantitySold: number
    marketShare: number
  }
}

export async function getComparisonData(
  currentFilters: AnalyticsFilters = {},
  previousFilters: AnalyticsFilters = {},
): Promise<ComparisonData> {
  const [current, previous] = await Promise.all([
    getAnalyticsSummary(currentFilters),
    getAnalyticsSummary(previousFilters),
  ])

  const percentageChanges = {
    revenue: calculatePercentageChange(previous.totalRevenue, current.totalRevenue),
    profit: calculatePercentageChange(previous.totalProfit, current.totalProfit),
    transactions: calculatePercentageChange(previous.totalTransactions, current.totalTransactions),
    itemsSold: calculatePercentageChange(previous.totalItemsSold, current.totalItemsSold),
    averageOrderValue: calculatePercentageChange(previous.averageOrderValue, current.averageOrderValue),
    profitMargin: calculatePercentageChange(previous.profitMargin, current.profitMargin),
  }

  return {
    current,
    previous,
    percentageChanges,
  }
}

export async function getProductComparison(
  currentFilters: AnalyticsFilters = {},
  previousFilters: AnalyticsFilters = {},
): Promise<ProductComparison[]> {
  const [currentProducts, previousProducts] = await Promise.all([
    getProductAnalytics(currentFilters),
    getProductAnalytics(previousFilters),
  ])

  return currentProducts.map((current) => {
    const previous = previousProducts.find((p) => p.productId === current.productId) || {
      revenue: 0,
      profit: 0,
      quantitySold: 0,
      profitMargin: 0,
    }

    return {
      productId: current.productId,
      productName: current.productName,
      category: current.category,
      current: {
        revenue: current.revenue,
        profit: current.profit,
        quantitySold: current.quantitySold,
        profitMargin: current.profitMargin,
      },
      previous: {
        revenue: previous.revenue,
        profit: previous.profit,
        quantitySold: previous.quantitySold,
        profitMargin: previous.profitMargin,
      },
      changes: {
        revenue: calculatePercentageChange(previous.revenue, current.revenue),
        profit: calculatePercentageChange(previous.profit, current.profit),
        quantitySold: calculatePercentageChange(previous.quantitySold, current.quantitySold),
        profitMargin: calculatePercentageChange(previous.profitMargin, current.profitMargin),
      },
    }
  })
}

export async function getCategoryComparison(
  currentFilters: AnalyticsFilters = {},
  previousFilters: AnalyticsFilters = {},
): Promise<CategoryComparison[]> {
  const [currentCategories, previousCategories] = await Promise.all([
    getCategoryAnalytics(currentFilters),
    getCategoryAnalytics(previousFilters),
  ])

  return currentCategories.map((current) => {
    const previous = previousCategories.find((c) => c.category === current.category) || {
      category: current.category,
      totalProducts: 0,
      quantitySold: 0,
      revenue: 0,
      profit: 0,
      profitMargin: 0,
      marketShare: 0,
    }

    return {
      category: current.category,
      current,
      previous,
      changes: {
        revenue: calculatePercentageChange(previous.revenue, current.revenue),
        profit: calculatePercentageChange(previous.profit, current.profit),
        quantitySold: calculatePercentageChange(previous.quantitySold, current.quantitySold),
        marketShare: calculatePercentageChange(previous.marketShare, current.marketShare),
      },
    }
  })
}

export function calculatePercentageChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return newValue > 0 ? 100 : 0
  return ((newValue - oldValue) / oldValue) * 100
}

export function getComparisonPeriods(filters: AnalyticsFilters): {
  current: AnalyticsFilters
  previous: AnalyticsFilters
} {
  if (!filters.startDate || !filters.endDate) {
    // Default to last 30 days vs previous 30 days
    const today = new Date()
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sixtyDaysAgo = new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000)

    return {
      current: {
        ...filters,
        startDate: thirtyDaysAgo.toISOString().split("T")[0],
        endDate: today.toISOString().split("T")[0],
      },
      previous: {
        ...filters,
        startDate: sixtyDaysAgo.toISOString().split("T")[0],
        endDate: thirtyDaysAgo.toISOString().split("T")[0],
      },
    }
  }

  const startDate = new Date(filters.startDate)
  const endDate = new Date(filters.endDate)
  const periodLength = endDate.getTime() - startDate.getTime()

  const previousEndDate = new Date(startDate.getTime() - 1)
  const previousStartDate = new Date(previousEndDate.getTime() - periodLength)

  return {
    current: filters,
    previous: {
      ...filters,
      startDate: previousStartDate.toISOString().split("T")[0],
      endDate: previousEndDate.toISOString().split("T")[0],
    },
  }
}
