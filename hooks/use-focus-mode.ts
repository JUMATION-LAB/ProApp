"use client"

import { useState, useEffect } from "react"
import { focusModeManager, type FocusSession, type AllowedApp, type FocusSettings } from "@/lib/focus-mode-manager"

export function useFocusMode() {
  const [currentSession, setCurrentSession] = useState<FocusSession | null>(() => focusModeManager.getCurrentSession())
  const [allowedApps, setAllowedApps] = useState<AllowedApp[]>(() => focusModeManager.getAllowedApps())
  const [settings, setSettings] = useState<FocusSettings>(() => focusModeManager.getSettings())

  useEffect(() => {
    // Subscribe to session updates
    const unsubscribeSession = focusModeManager.subscribe((session) => {
      setCurrentSession(session)
    })

    // Subscribe to settings updates
    const unsubscribeSettings = focusModeManager.subscribeToSettings((newSettings) => {
      setSettings(newSettings)
    })

    // Update current session every second
    const interval = setInterval(() => {
      const session = focusModeManager.getCurrentSession()
      if (session) {
        setCurrentSession({ ...session })
      }
    }, 1000)

    return () => {
      unsubscribeSession()
      unsubscribeSettings()
      clearInterval(interval)
    }
  }, [])

  const startFocusSession = (type: "manual" | "pomodoro" | "custom", targetDuration?: number) => {
    return focusModeManager.startFocusSession(type, targetDuration)
  }

  const endFocusSession = () => {
    return focusModeManager.endFocusSession()
  }

  const updateAllowedApp = (appId: string, isAllowed: boolean) => {
    focusModeManager.updateAllowedApp(appId, isAllowed)
    setAllowedApps(focusModeManager.getAllowedApps())
  }

  const updateSettings = (newSettings: Partial<FocusSettings>) => {
    focusModeManager.updateSettings(newSettings)
  }

  const resetData = () => {
    focusModeManager.resetAllData()
    setCurrentSession(null)
    setAllowedApps(focusModeManager.getAllowedApps())
    setSettings(focusModeManager.getSettings())
  }

  const formatTime = (milliseconds: number) => {
    return focusModeManager.formatTime(milliseconds)
  }

  const isInFocusMode = focusModeManager.isInFocusMode()
  const todayFocusSessions = focusModeManager.getTodayFocusSessions()
  const totalFocusTime = focusModeManager.getTotalFocusTime()
  const completedSessions = focusModeManager.getCompletedSessions()

  return {
    currentSession,
    allowedApps,
    settings,
    isInFocusMode,
    todayFocusSessions,
    totalFocusTime,
    completedSessions,
    startFocusSession,
    endFocusSession,
    updateAllowedApp,
    updateSettings,
    resetData,
    formatTime,
  }
}
