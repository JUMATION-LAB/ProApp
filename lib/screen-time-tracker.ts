// Screen Time Tracking Service
// Uses Page Visibility API and focus/blur events to simulate mobile screen on/off tracking

export interface ScreenTimeSession {
  id: string
  startTime: number
  endTime?: number
  duration: number
  date: string
}

export interface DailyStats {
  date: string
  totalTime: number
  sessions: ScreenTimeSession[]
  focusTime: number
}

class ScreenTimeTracker {
  private currentSession: ScreenTimeSession | null = null
  private isTracking = false
  private listeners: Array<(stats: DailyStats) => void> = []
  private focusStartTime: number | null = null
  private totalFocusTime = 0
  private initialized = false

  constructor() {
    // Only initialize if we're in the browser
    if (typeof window !== 'undefined') {
      this.initializeTracking()
    }
  }

  private initializeTracking() {
    if (this.initialized) return
    this.initialized = true

    // Track page visibility changes (simulates screen on/off)
    document.addEventListener("visibilitychange", this.handleVisibilityChange.bind(this))

    // Track window focus/blur as additional screen activity indicators
    window.addEventListener("focus", this.handleWindowFocus.bind(this))
    window.addEventListener("blur", this.handleWindowBlur.bind(this))

    // Track mouse movement and keyboard activity
    document.addEventListener("mousemove", this.handleUserActivity.bind(this))
    document.addEventListener("keypress", this.handleUserActivity.bind(this))

    // Start tracking if page is visible
    if (!document.hidden) {
      this.startSession()
    }
  }

  private handleVisibilityChange() {
    if (document.hidden) {
      this.endSession()
    } else {
      this.startSession()
    }
  }

  private handleWindowFocus() {
    if (!this.isTracking) {
      this.startSession()
    }
  }

  private handleWindowBlur() {
    // Don't end session immediately on blur, wait for visibility change
    // This prevents ending sessions when switching between browser tabs
  }

  private handleUserActivity() {
    // Reset any idle timers if needed
    if (!this.isTracking && !document.hidden) {
      this.startSession()
    }
  }

  private startSession() {
    if (this.isTracking) return

    const now = Date.now()
    this.currentSession = {
      id: `session_${now}`,
      startTime: now,
      duration: 0,
      date: new Date().toISOString().split("T")[0],
    }

    this.isTracking = true
    console.log("[v0] Screen time session started")
  }

  private endSession() {
    if (!this.isTracking || !this.currentSession) return

    const now = Date.now()
    this.currentSession.endTime = now
    this.currentSession.duration = now - this.currentSession.startTime

    // Save session to storage
    this.saveSession(this.currentSession)

    this.isTracking = false
    this.currentSession = null
    console.log("[v0] Screen time session ended")

    // Notify listeners
    this.notifyListeners()
  }

  private saveSession(session: ScreenTimeSession) {
    const today = new Date().toISOString().split("T")[0]
    const existingData = this.getTodayStats()

    existingData.sessions.push(session)
    existingData.totalTime += session.duration

    localStorage.setItem(`screentime_${today}`, JSON.stringify(existingData))
  }

  public getCurrentSession(): { duration: number; isActive: boolean } {
    if (!this.isTracking || !this.currentSession) {
      return { duration: 0, isActive: false }
    }

    return {
      duration: Date.now() - this.currentSession.startTime,
      isActive: true,
    }
  }

  public getTodayStats(): DailyStats {
    const today = new Date().toISOString().split("T")[0]
    const stored = localStorage.getItem(`screentime_${today}`)

    if (stored) {
      return JSON.parse(stored)
    }

    return {
      date: today,
      totalTime: 0,
      sessions: [],
      focusTime: this.totalFocusTime,
    }
  }

  public getWeekStats(): DailyStats[] {
    const stats: DailyStats[] = []
    const today = new Date()

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]

      const stored = localStorage.getItem(`screentime_${dateStr}`)
      if (stored) {
        stats.push(JSON.parse(stored))
      } else {
        stats.push({
          date: dateStr,
          totalTime: 0,
          sessions: [],
          focusTime: 0,
        })
      }
    }

    return stats
  }

  public startFocusMode() {
    this.focusStartTime = Date.now()
    console.log("[v0] Focus mode started")
  }

  public endFocusMode() {
    if (this.focusStartTime) {
      const focusSession = Date.now() - this.focusStartTime
      this.totalFocusTime += focusSession

      // Update today's stats with focus time
      const today = new Date().toISOString().split("T")[0]
      const stats = this.getTodayStats()
      stats.focusTime = this.totalFocusTime
      localStorage.setItem(`screentime_${today}`, JSON.stringify(stats))

      this.focusStartTime = null
      console.log("[v0] Focus mode ended, session duration:", focusSession)
      this.notifyListeners()
    }
  }

  public getCurrentFocusTime(): number {
    if (!this.focusStartTime) return 0
    return Date.now() - this.focusStartTime
  }

  public subscribe(callback: (stats: DailyStats) => void) {
    this.listeners.push(callback)
    return () => {
      this.listeners = this.listeners.filter((listener) => listener !== callback)
    }
  }

  private notifyListeners() {
    const stats = this.getTodayStats()
    this.listeners.forEach((callback) => callback(stats))
  }

  public formatTime(milliseconds: number): string {
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

  public resetAllData() {
    // Clear all stored data
    const keys = Object.keys(localStorage).filter((key) => key.startsWith("screentime_"))
    keys.forEach((key) => localStorage.removeItem(key))

    // Reset current state
    this.totalFocusTime = 0
    this.focusStartTime = null

    console.log("[v0] All screen time data reset")
    this.notifyListeners()
  }
}

// Lazy singleton instance - only create when needed
let screenTimeTrackerInstance: ScreenTimeTracker | null = null

export const screenTimeTracker = {
  get instance() {
    if (!screenTimeTrackerInstance && typeof window !== 'undefined') {
      screenTimeTrackerInstance = new ScreenTimeTracker()
    }
    return screenTimeTrackerInstance
  }
}
