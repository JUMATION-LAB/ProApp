"use client"

import { useState, useEffect } from "react"
import { screenTimeTracker, type DailyStats } from "@/lib/screen-time-tracker"

export function useScreenTime() {
  const [todayStats, setTodayStats] = useState<DailyStats>(() => {
    if (typeof window !== 'undefined' && screenTimeTracker.instance) {
      return screenTimeTracker.instance.getTodayStats()
    }
    return {
      date: new Date().toISOString().split("T")[0],
      totalTime: 0,
      sessions: [],
      focusTime: 0,
    }
  })
  
  const [currentSession, setCurrentSession] = useState(() => {
    if (typeof window !== 'undefined' && screenTimeTracker.instance) {
      return screenTimeTracker.instance.getCurrentSession()
    }
    return {
      id: '',
      startTime: 0,
      duration: 0,
      date: new Date().toISOString().split("T")[0],
      isActive: false,
    }
  })
  
  const [isFocusMode, setIsFocusMode] = useState(false)
  const [currentFocusTime, setCurrentFocusTime] = useState(0)

  useEffect(() => {
    if (typeof window === 'undefined' || !screenTimeTracker.instance) return

    // Subscribe to stats updates
    const unsubscribe = screenTimeTracker.instance.subscribe((stats) => {
      setTodayStats(stats)
    })

    // Update current session every second
    const sessionInterval = setInterval(() => {
      if (screenTimeTracker.instance) {
        setCurrentSession(screenTimeTracker.instance.getCurrentSession())
      }
    }, 1000)

    // Update focus time every second when in focus mode
    const focusInterval = setInterval(() => {
      if (isFocusMode && screenTimeTracker.instance) {
        setCurrentFocusTime(screenTimeTracker.instance.getCurrentFocusTime())
      }
    }, 1000)

    return () => {
      unsubscribe()
      clearInterval(sessionInterval)
      clearInterval(focusInterval)
    }
  }, [isFocusMode])

  const startFocusMode = () => {
    if (typeof window !== 'undefined' && screenTimeTracker.instance) {
      screenTimeTracker.instance.startFocusMode()
      setIsFocusMode(true)
      setCurrentFocusTime(0)
    }
  }

  const endFocusMode = () => {
    if (typeof window !== 'undefined' && screenTimeTracker.instance) {
      screenTimeTracker.instance.endFocusMode()
      setIsFocusMode(false)
      setCurrentFocusTime(0)
      // Refresh today's stats to include the focus session
      setTodayStats(screenTimeTracker.instance.getTodayStats())
    }
  }

  const resetData = () => {
    if (typeof window !== 'undefined' && screenTimeTracker.instance) {
      screenTimeTracker.instance.resetAllData()
      setTodayStats(screenTimeTracker.instance.getTodayStats())
      setCurrentSession(screenTimeTracker.instance.getCurrentSession())
      setIsFocusMode(false)
      setCurrentFocusTime(0)
    }
  }

  const formatTime = (milliseconds: number) => {
    if (typeof window !== 'undefined' && screenTimeTracker.instance) {
      return screenTimeTracker.instance.formatTime(milliseconds)
    }
    // Fallback formatting for SSR
    const seconds = Math.floor(milliseconds / 1000)
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`
    }
    return `${remainingSeconds}s`
  }

  const getWeekStats = () => {
    if (typeof window !== 'undefined' && screenTimeTracker.instance) {
      return screenTimeTracker.instance.getWeekStats()
    }
    return []
  }

  return {
    todayStats,
    currentSession,
    isFocusMode,
    currentFocusTime,
    startFocusMode,
    endFocusMode,
    resetData,
    formatTime,
    getWeekStats,
  }
}
