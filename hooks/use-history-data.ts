"use client"

import { useState, useEffect } from "react"
import { historyDataManager, type DailyHistoryData, type WeeklyTrend } from "@/lib/history-data"

export function useHistoryData() {
  const [dailyData, setDailyData] = useState<DailyHistoryData[]>([])
  const [weeklyTrends, setWeeklyTrends] = useState<WeeklyTrend[]>([])
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "weekly">("30d")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading historical data
    setIsLoading(true)

    setTimeout(() => {
      const historical = historyDataManager.generateHistoricalData()
      setDailyData(historical)
      setWeeklyTrends(historyDataManager.getWeeklyTrends(historical))
      setIsLoading(false)
    }, 500)
  }, [])

  const getFilteredData = () => {
    if (timeRange === "7d") {
      return dailyData.slice(-7)
    }
    if (timeRange === "weekly") {
      return weeklyTrends
    }
    return dailyData
  }

  const getAverages = () => {
    const data = timeRange === "weekly" ? [] : dailyData
    if (data.length === 0) return { avgScreenTime: 0, avgFocusTime: 0, avgProductivity: 0 }

    const avgScreenTime = data.reduce((sum, day) => sum + day.screenTime, 0) / data.length
    const avgFocusTime = data.reduce((sum, day) => sum + day.focusTime, 0) / data.length
    const avgProductivity = data.reduce((sum, day) => sum + day.productivity, 0) / data.length

    return { avgScreenTime, avgFocusTime, avgProductivity }
  }

  const getTrends = () => {
    if (dailyData.length < 7) return { screenTimeTrend: 0, focusTimeTrend: 0, productivityTrend: 0 }

    const recent = dailyData.slice(-7)
    const previous = dailyData.slice(-14, -7)

    const recentAvgScreen = recent.reduce((sum, day) => sum + day.screenTime, 0) / recent.length
    const previousAvgScreen = previous.reduce((sum, day) => sum + day.screenTime, 0) / previous.length

    const recentAvgFocus = recent.reduce((sum, day) => sum + day.focusTime, 0) / recent.length
    const previousAvgFocus = previous.reduce((sum, day) => sum + day.focusTime, 0) / previous.length

    const recentAvgProd = recent.reduce((sum, day) => sum + day.productivity, 0) / recent.length
    const previousAvgProd = previous.reduce((sum, day) => sum + day.productivity, 0) / previous.length

    return {
      screenTimeTrend: previousAvgScreen > 0 ? ((recentAvgScreen - previousAvgScreen) / previousAvgScreen) * 100 : 0,
      focusTimeTrend: previousAvgFocus > 0 ? ((recentAvgFocus - previousAvgFocus) / previousAvgFocus) * 100 : 0,
      productivityTrend: previousAvgProd > 0 ? ((recentAvgProd - previousAvgProd) / previousAvgProd) * 100 : 0,
    }
  }

  return {
    dailyData,
    weeklyTrends,
    timeRange,
    setTimeRange,
    isLoading,
    filteredData: getFilteredData(),
    averages: getAverages(),
    trends: getTrends(),
    formatTime: historyDataManager.formatTime,
    formatTimeDetailed: historyDataManager.formatTimeDetailed,
  }
}
