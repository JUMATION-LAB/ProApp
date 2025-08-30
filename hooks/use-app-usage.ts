"use client"

import { useState, useEffect } from "react"
import { appUsageTracker, type AppUsage } from "@/lib/app-usage-tracker"

export function useAppUsage() {
  const [apps, setApps] = useState<AppUsage[]>([])
  const [sortBy, setSortBy] = useState<"time" | "alphabetical">("time")

  useEffect(() => {
    // Subscribe to usage updates
    const unsubscribe = appUsageTracker.subscribe((updatedApps) => {
      setApps(updatedApps)
    })

    // Load initial data
    setApps(appUsageTracker.getTodayUsage())

    return unsubscribe
  }, [])

  const sortedApps =
    sortBy === "time" ? appUsageTracker.getUsageSortedByTime() : appUsageTracker.getUsageSortedAlphabetically()

  const usageByCategory = appUsageTracker.getUsageByCategory()
  const totalUsageTime = appUsageTracker.getTotalUsageTime()
  const mostUsedApp = appUsageTracker.getMostUsedApp()

  const formatTime = (milliseconds: number) => {
    return appUsageTracker.formatTime(milliseconds)
  }

  const resetData = () => {
    appUsageTracker.resetUsageData()
  }

  return {
    apps: sortedApps,
    usageByCategory,
    totalUsageTime,
    mostUsedApp,
    sortBy,
    setSortBy,
    formatTime,
    resetData,
  }
}
