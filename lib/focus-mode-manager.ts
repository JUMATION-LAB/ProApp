// Focus Mode Management System
// Handles focus sessions, allowed apps, and productivity tracking

export interface AllowedApp {
  id: string
  name: string
  icon: string
  category: string
  isAllowed: boolean
}

export interface FocusSession {
  id: string
  startTime: number
  endTime?: number
  duration: number
  targetDuration?: number
  type: "manual" | "pomodoro" | "custom"
  allowedApps: string[]
  completed: boolean
}

export interface FocusSettings {
  defaultDuration: number // in minutes
  pomodoroWorkDuration: number // in minutes
  pomodoroBreakDuration: number // in minutes
  pomodoroLongBreakDuration: number // in minutes
  pomodoroSessionsBeforeLongBreak: number
  allowNotifications: boolean
  strictMode: boolean // prevents ending focus session early
  autoStartBreaks: boolean
}

class FocusModeManager {
  private currentSession: FocusSession | null = null
  private listeners: Array<(session: FocusSession | null) => void> = []
  private settingsListeners: Array<(settings: FocusSettings) => void> = []
  private pomodoroCount = 0
  private isInitialized = false

  private defaultSettings: FocusSettings = {
    defaultDuration: 25,
    pomodoroWorkDuration: 25,
    pomodoroBreakDuration: 5,
    pomodoroLongBreakDuration: 15,
    pomodoroSessionsBeforeLongBreak: 4,
    allowNotifications: false,
    strictMode: false,
    autoStartBreaks: false,
  }

  // Default allowed apps for focus mode
  private defaultAllowedApps: AllowedApp[] = [
    { id: "focusplus", name: "FOCUSPLUS+", icon: "🎯", category: "Productivity", isAllowed: true },
    { id: "email", name: "Email", icon: "📧", category: "Productivity", isAllowed: true },
    { id: "calendar", name: "Calendar", icon: "📅", category: "Productivity", isAllowed: true },
    { id: "notes", name: "Notes", icon: "📝", category: "Productivity", isAllowed: true },
    { id: "music", name: "Music", icon: "🎵", category: "Entertainment", isAllowed: true },
    { id: "social_media", name: "Social Media", icon: "📱", category: "Social", isAllowed: false },
    { id: "games", name: "Games", icon: "🎮", category: "Entertainment", isAllowed: false },
    { id: "video", name: "Video Streaming", icon: "📺", category: "Entertainment", isAllowed: false },
    { id: "shopping", name: "Shopping", icon: "🛒", category: "Lifestyle", isAllowed: false },
    { id: "news", name: "News", icon: "📰", category: "Information", isAllowed: false },
  ]

  constructor() {
    // this.initializeSettings()
  }

  private isBrowser(): boolean {
    return typeof window !== "undefined" && typeof localStorage !== "undefined"
  }

  private ensureInitialized() {
    if (!this.isInitialized && this.isBrowser()) {
      this.initializeSettings()
      this.isInitialized = true
    }
  }

  private initializeSettings() {
    if (!this.isBrowser()) return

    // Load settings from localStorage or use defaults
    const storedSettings = localStorage.getItem("focus_settings")
    if (!storedSettings) {
      this.saveSettings(this.defaultSettings)
    }

    // Load allowed apps or use defaults
    const storedApps = localStorage.getItem("focus_allowed_apps")
    if (!storedApps) {
      this.saveAllowedApps(this.defaultAllowedApps)
    }
  }

  public startFocusSession(type: "manual" | "pomodoro" | "custom", targetDuration?: number): FocusSession {
    this.ensureInitialized()

    if (this.currentSession) {
      this.endFocusSession()
    }

    const settings = this.getSettings()
    const allowedApps = this.getAllowedApps()
      .filter((app) => app.isAllowed)
      .map((app) => app.id)

    let duration = targetDuration || settings.defaultDuration
    if (type === "pomodoro") {
      duration = settings.pomodoroWorkDuration
    }

    this.currentSession = {
      id: `focus_${Date.now()}`,
      startTime: Date.now(),
      duration: 0,
      targetDuration: duration * 60 * 1000, // convert to milliseconds
      type,
      allowedApps,
      completed: false,
    }

    console.log(`[v0] Focus session started: ${type}, target: ${duration} minutes`)
    this.notifyListeners()
    return this.currentSession
  }

  public endFocusSession(): FocusSession | null {
    if (!this.currentSession) return null

    const now = Date.now()
    this.currentSession.endTime = now
    this.currentSession.duration = now - this.currentSession.startTime

    // Check if session was completed (reached target duration)
    if (
      this.currentSession.targetDuration &&
      this.currentSession.duration >= this.currentSession.targetDuration * 0.9
    ) {
      this.currentSession.completed = true

      // Handle Pomodoro cycle
      if (this.currentSession.type === "pomodoro") {
        this.pomodoroCount++
        this.handlePomodoroCompletion()
      }
    }

    // Save session to history
    this.saveFocusSession(this.currentSession)

    const completedSession = this.currentSession
    this.currentSession = null

    console.log(`[v0] Focus session ended: ${completedSession.completed ? "completed" : "interrupted"}`)
    this.notifyListeners()
    return completedSession
  }

  private handlePomodoroCompletion() {
    const settings = this.getSettings()

    if (settings.autoStartBreaks) {
      const isLongBreak = this.pomodoroCount % settings.pomodoroSessionsBeforeLongBreak === 0
      const breakDuration = isLongBreak ? settings.pomodoroLongBreakDuration : settings.pomodoroBreakDuration

      console.log(`[v0] Starting ${isLongBreak ? "long" : "short"} break: ${breakDuration} minutes`)

      // Auto-start break session
      setTimeout(() => {
        this.startBreakSession(breakDuration)
      }, 1000)
    }
  }

  private startBreakSession(duration: number) {
    // Break sessions allow all apps
    this.currentSession = {
      id: `break_${Date.now()}`,
      startTime: Date.now(),
      duration: 0,
      targetDuration: duration * 60 * 1000,
      type: "pomodoro",
      allowedApps: this.getAllowedApps().map((app) => app.id), // All apps allowed during break
      completed: false,
    }

    this.notifyListeners()
  }

  public getCurrentSession(): FocusSession | null {
    if (this.currentSession) {
      // Update duration in real-time
      this.currentSession.duration = Date.now() - this.currentSession.startTime
    }
    return this.currentSession
  }

  public isInFocusMode(): boolean {
    return this.currentSession !== null
  }

  public isAppAllowed(appId: string): boolean {
    if (!this.currentSession) return true
    return this.currentSession.allowedApps.includes(appId)
  }

  public getAllowedApps(): AllowedApp[] {
    this.ensureInitialized()
    if (!this.isBrowser()) return this.defaultAllowedApps

    const stored = localStorage.getItem("focus_allowed_apps")
    return stored ? JSON.parse(stored) : this.defaultAllowedApps
  }

  public updateAllowedApp(appId: string, isAllowed: boolean) {
    if (!this.isBrowser()) return

    const apps = this.getAllowedApps()
    const appIndex = apps.findIndex((app) => app.id === appId)

    if (appIndex >= 0) {
      apps[appIndex].isAllowed = isAllowed
      this.saveAllowedApps(apps)
    }
  }

  public saveAllowedApps(apps: AllowedApp[]) {
    if (!this.isBrowser()) return
    localStorage.setItem("focus_allowed_apps", JSON.stringify(apps))
  }

  public getSettings(): FocusSettings {
    this.ensureInitialized()
    if (!this.isBrowser()) return this.defaultSettings

    const stored = localStorage.getItem("focus_settings")
    return stored ? JSON.parse(stored) : this.defaultSettings
  }

  public updateSettings(settings: Partial<FocusSettings>) {
    if (!this.isBrowser()) return

    const currentSettings = this.getSettings()
    const newSettings = { ...currentSettings, ...settings }
    this.saveSettings(newSettings)
    this.notifySettingsListeners()
  }

  private saveSettings(settings: FocusSettings) {
    if (!this.isBrowser()) return
    localStorage.setItem("focus_settings", JSON.stringify(settings))
  }

  private saveFocusSession(session: FocusSession) {
    if (!this.isBrowser()) return

    const today = new Date().toISOString().split("T")[0]
    const key = `focus_sessions_${today}`
    const existing = localStorage.getItem(key)
    const sessions: FocusSession[] = existing ? JSON.parse(existing) : []

    sessions.push(session)
    localStorage.setItem(key, JSON.stringify(sessions))
  }

  public getTodayFocusSessions(): FocusSession[] {
    if (!this.isBrowser()) return []

    const today = new Date().toISOString().split("T")[0]
    const key = `focus_sessions_${today}`
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : []
  }

  public getTotalFocusTime(): number {
    return this.getTodayFocusSessions().reduce((total, session) => total + session.duration, 0)
  }

  public getCompletedSessions(): number {
    return this.getTodayFocusSessions().filter((session) => session.completed).length
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

  public subscribe(callback: (session: FocusSession | null) => void) {
    this.listeners.push(callback)
    return () => {
      this.listeners = this.listeners.filter((listener) => listener !== callback)
    }
  }

  public subscribeToSettings(callback: (settings: FocusSettings) => void) {
    this.settingsListeners.push(callback)
    return () => {
      this.settingsListeners = this.settingsListeners.filter((listener) => listener !== callback)
    }
  }

  private notifyListeners() {
    this.listeners.forEach((callback) => callback(this.currentSession))
  }

  private notifySettingsListeners() {
    const settings = this.getSettings()
    this.settingsListeners.forEach((callback) => callback(settings))
  }

  public resetAllData() {
    if (!this.isBrowser()) return

    // Clear all focus-related data
    const keys = Object.keys(localStorage).filter((key) => key.startsWith("focus_") || key.includes("focus"))
    keys.forEach((key) => localStorage.removeItem(key))

    // Reset current state
    this.currentSession = null
    this.pomodoroCount = 0

    // Reinitialize with defaults
    this.initializeSettings()

    console.log("[v0] All focus mode data reset")
    this.notifyListeners()
    this.notifySettingsListeners()
  }
}

// Singleton instance
export const focusModeManager = new FocusModeManager()
