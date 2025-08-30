// App Usage Tracking Service
// Simulates mobile app usage tracking by monitoring different sections and external navigation

export interface AppUsage {
  id: string
  name: string
  icon: string
  category: string
  timeSpent: number // in milliseconds
  lastUsed: number
  sessions: number
  color: string
}

export interface AppUsageSession {
  appId: string
  startTime: number
  endTime?: number
  duration: number
}

class AppUsageTracker {
  private currentApp: string | null = null
  private currentAppStartTime: number | null = null
  private listeners: Array<(apps: AppUsage[]) => void> = []

  // Simulated apps with realistic usage patterns
  private readonly simulatedApps: Omit<AppUsage, "timeSpent" | "lastUsed" | "sessions">[] = [
    { id: "social_media", name: "Social Media", icon: "📱", category: "Social", color: "#3b82f6" },
    { id: "messaging", name: "Messages", icon: "💬", category: "Communication", color: "#10b981" },
    { id: "browser", name: "Web Browser", icon: "🌐", category: "Productivity", color: "#f59e0b" },
    { id: "email", name: "Email", icon: "📧", category: "Productivity", color: "#ef4444" },
    { id: "music", name: "Music", icon: "🎵", category: "Entertainment", color: "#8b5cf6" },
    { id: "video", name: "Video Streaming", icon: "📺", category: "Entertainment", color: "#ec4899" },
    { id: "games", name: "Games", icon: "🎮", category: "Entertainment", color: "#06b6d4" },
    { id: "news", name: "News", icon: "📰", category: "Information", color: "#84cc16" },
    { id: "shopping", name: "Shopping", icon: "🛒", category: "Lifestyle", color: "#f97316" },
    { id: "fitness", name: "Fitness", icon: "💪", category: "Health", color: "#22c55e" },
    { id: "camera", name: "Camera", icon: "📷", category: "Utilities", color: "#6366f1" },
    { id: "maps", name: "Maps", icon: "🗺️", category: "Navigation", color: "#14b8a6" },
  ]

  constructor() {
    this.initializeTracking()
    this.generateRealisticUsage()
  }

  private initializeTracking() {
    // Track page navigation within the app
    if (typeof window !== "undefined") {
      // Track route changes
      window.addEventListener("popstate", this.handleRouteChange.bind(this))

      // Track when user leaves/returns to the page
      document.addEventListener("visibilitychange", this.handleVisibilityChange.bind(this))

      // Start tracking current page
      this.startAppUsage("focusplus")
    }
  }

  private handleRouteChange() {
    // In a real app, this would track navigation between different apps
    // For now, we'll simulate app switching
    this.simulateAppSwitch()
  }

  private handleVisibilityChange() {
    if (document.hidden) {
      this.endCurrentAppUsage()
    } else {
      this.startAppUsage("focusplus")
    }
  }

  private simulateAppSwitch() {
    // Randomly switch to a different app to simulate realistic usage
    const randomApp = this.simulatedApps[Math.floor(Math.random() * this.simulatedApps.length)]
    this.startAppUsage(randomApp.id)

    // Switch back after a random duration (1-30 seconds)
    setTimeout(
      () => {
        this.startAppUsage("focusplus")
      },
      Math.random() * 29000 + 1000,
    )
  }

  private startAppUsage(appId: string) {
    if (this.currentApp === appId) return

    // End current app usage
    this.endCurrentAppUsage()

    // Start new app usage
    this.currentApp = appId
    this.currentAppStartTime = Date.now()

    console.log(`[v0] Started using app: ${appId}`)
  }

  private endCurrentAppUsage() {
    if (!this.currentApp || !this.currentAppStartTime) return

    const duration = Date.now() - this.currentAppStartTime
    this.recordAppUsage(this.currentApp, duration)

    this.currentApp = null
    this.currentAppStartTime = null
  }

  private recordAppUsage(appId: string, duration: number) {
    const today = new Date().toISOString().split("T")[0]
    const key = `appusage_${today}`

    const existingData = this.getTodayUsage()
    const appIndex = existingData.findIndex((app) => app.id === appId)

    if (appIndex >= 0) {
      existingData[appIndex].timeSpent += duration
      existingData[appIndex].sessions += 1
      existingData[appIndex].lastUsed = Date.now()
    } else {
      // Find app template or create new one
      const appTemplate = this.simulatedApps.find((app) => app.id === appId)
      if (appTemplate) {
        existingData.push({
          ...appTemplate,
          timeSpent: duration,
          lastUsed: Date.now(),
          sessions: 1,
        })
      }
    }

    localStorage.setItem(key, JSON.stringify(existingData))
    this.notifyListeners()
  }

  private generateRealisticUsage() {
    // Generate some realistic usage data for demonstration
    const today = new Date().toISOString().split("T")[0]
    const key = `appusage_${today}`

    if (!localStorage.getItem(key)) {
      const realisticUsage: AppUsage[] = this.simulatedApps.map((app) => ({
        ...app,
        timeSpent: Math.random() * 3600000, // 0-1 hour in milliseconds
        lastUsed: Date.now() - Math.random() * 86400000, // Within last 24 hours
        sessions: Math.floor(Math.random() * 20) + 1, // 1-20 sessions
      }))

      localStorage.setItem(key, JSON.stringify(realisticUsage))
    }
  }

  public getTodayUsage(): AppUsage[] {
    const today = new Date().toISOString().split("T")[0]
    const key = `appusage_${today}`
    const stored = localStorage.getItem(key)

    if (stored) {
      return JSON.parse(stored)
    }

    return []
  }

  public getUsageSortedByTime(): AppUsage[] {
    return this.getTodayUsage().sort((a, b) => b.timeSpent - a.timeSpent)
  }

  public getUsageSortedAlphabetically(): AppUsage[] {
    return this.getTodayUsage().sort((a, b) => a.name.localeCompare(b.name))
  }

  public getUsageByCategory(): Record<string, AppUsage[]> {
    const usage = this.getTodayUsage()
    const categories: Record<string, AppUsage[]> = {}

    usage.forEach((app) => {
      if (!categories[app.category]) {
        categories[app.category] = []
      }
      categories[app.category].push(app)
    })

    return categories
  }

  public getTotalUsageTime(): number {
    return this.getTodayUsage().reduce((total, app) => total + app.timeSpent, 0)
  }

  public getMostUsedApp(): AppUsage | null {
    const usage = this.getUsageSortedByTime()
    return usage.length > 0 ? usage[0] : null
  }

  public formatTime(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000)
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    if (minutes > 0) {
      return `${minutes}m`
    }
    return `${seconds}s`
  }

  public subscribe(callback: (apps: AppUsage[]) => void) {
    this.listeners.push(callback)
    return () => {
      this.listeners = this.listeners.filter((listener) => listener !== callback)
    }
  }

  private notifyListeners() {
    const usage = this.getTodayUsage()
    this.listeners.forEach((callback) => callback(usage))
  }

  public resetUsageData() {
    const keys = Object.keys(localStorage).filter((key) => key.startsWith("appusage_"))
    keys.forEach((key) => localStorage.removeItem(key))
    this.notifyListeners()
    console.log("[v0] App usage data reset")
  }
}

// Singleton instance
export const appUsageTracker = new AppUsageTracker()
