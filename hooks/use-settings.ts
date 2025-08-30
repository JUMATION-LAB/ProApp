"use client"

// Settings Management Hook
// Handles app-wide settings and preferences

import { useState, useEffect } from "react"

export interface AppSettings {
  theme: "light" | "dark" | "system"
  notifications: {
    dailySummary: boolean
    focusReminders: boolean
    breakReminders: boolean
    goalAchieved: boolean
  }
  privacy: {
    dataCollection: boolean
    analytics: boolean
  }
  display: {
    use24HourFormat: boolean
    showSeconds: boolean
    compactMode: boolean
  }
  goals: {
    dailyScreenTimeLimit: number // in minutes
    dailyFocusGoal: number // in minutes
    weeklyFocusGoal: number // in minutes
  }
}

const defaultSettings: AppSettings = {
  theme: "system",
  notifications: {
    dailySummary: true,
    focusReminders: true,
    breakReminders: true,
    goalAchieved: true,
  },
  privacy: {
    dataCollection: false,
    analytics: false,
  },
  display: {
    use24HourFormat: false,
    showSeconds: false,
    compactMode: false,
  },
  goals: {
    dailyScreenTimeLimit: 480, // 8 hours
    dailyFocusGoal: 120, // 2 hours
    weeklyFocusGoal: 840, // 14 hours
  },
}

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(true)

  // Load settings from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("app_settings")
      if (stored) {
        try {
          const parsedSettings = JSON.parse(stored)
          setSettings({ ...defaultSettings, ...parsedSettings })
        } catch (error) {
          console.error("[v0] Failed to parse stored settings:", error)
        }
      }
      setIsLoading(false)
    }
  }, [])

  // Save settings to localStorage
  const saveSettings = (newSettings: AppSettings) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("app_settings", JSON.stringify(newSettings))
      setSettings(newSettings)
    }
  }

  // Update specific setting
  const updateSetting = <K extends keyof AppSettings>(category: K, updates: Partial<AppSettings[K]>) => {
    const newSettings = {
      ...settings,
      [category]: { ...settings[category], ...updates },
    }
    saveSettings(newSettings)
  }

  // Reset all settings
  const resetSettings = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("app_settings")
      setSettings(defaultSettings)
    }
  }

  // Reset all app data
  const resetAllData = () => {
    if (typeof window !== "undefined") {
      // Clear all localStorage data
      const keys = Object.keys(localStorage)
      keys.forEach((key) => {
        if (
          key.startsWith("focus_") ||
          key.startsWith("screen_") ||
          key.startsWith("app_usage_") ||
          key === "app_settings"
        ) {
          localStorage.removeItem(key)
        }
      })

      // Reset to defaults
      setSettings(defaultSettings)

      // Notify other systems to reset
      window.dispatchEvent(new CustomEvent("data-reset"))
    }
  }

  return {
    settings,
    isLoading,
    updateSetting,
    resetSettings,
    resetAllData,
  }
}
