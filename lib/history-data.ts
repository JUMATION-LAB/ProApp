// History Data Management
// Generates and manages historical data for charts and analytics

export interface DailyHistoryData {
  date: string
  screenTime: number
  focusTime: number
  sessions: number
  completedFocusSessions: number
  productivity: number
  mostUsedApp: string
  appCount: number
}

export interface WeeklyTrend {
  week: string
  avgScreenTime: number
  avgFocusTime: number
  avgProductivity: number
  totalSessions: number
}

class HistoryDataManager {
  // Generate realistic historical data for the past 30 days
  public generateHistoricalData(): DailyHistoryData[] {
    const data: DailyHistoryData[] = []
    const today = new Date()

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]

      // Generate realistic patterns
      const isWeekend = date.getDay() === 0 || date.getDay() === 6
      const baseScreenTime = isWeekend
        ? (4 + Math.random() * 4) * 60 * 60 * 1000
        : // 4-8 hours on weekends
          (3 + Math.random() * 3) * 60 * 60 * 1000 // 3-6 hours on weekdays

      const baseFocusTime = isWeekend
        ? (0.5 + Math.random() * 1.5) * 60 * 60 * 1000
        : // 0.5-2 hours on weekends
          (1 + Math.random() * 2) * 60 * 60 * 1000 // 1-3 hours on weekdays

      const sessions = Math.floor(8 + Math.random() * 12) // 8-20 sessions
      const completedFocusSessions = Math.floor(Math.random() * 6) // 0-5 focus sessions
      const productivity = baseFocusTime > 0 ? (baseFocusTime / baseScreenTime) * 100 : 0

      const apps = ["Social Media", "Browser", "Email", "Music", "Games", "Video", "News"]
      const mostUsedApp = apps[Math.floor(Math.random() * apps.length)]
      const appCount = Math.floor(6 + Math.random() * 8) // 6-14 apps

      data.push({
        date: dateStr,
        screenTime: baseScreenTime,
        focusTime: baseFocusTime,
        sessions,
        completedFocusSessions,
        productivity: Math.min(productivity, 100),
        mostUsedApp,
        appCount,
      })
    }

    return data
  }

  public getWeeklyTrends(dailyData: DailyHistoryData[]): WeeklyTrend[] {
    const weeks: WeeklyTrend[] = []
    const weeksData: { [key: string]: DailyHistoryData[] } = {}

    // Group data by week
    dailyData.forEach((day) => {
      const date = new Date(day.date)
      const weekStart = new Date(date)
      weekStart.setDate(date.getDate() - date.getDay()) // Start of week (Sunday)
      const weekKey = weekStart.toISOString().split("T")[0]

      if (!weeksData[weekKey]) {
        weeksData[weekKey] = []
      }
      weeksData[weekKey].push(day)
    })

    // Calculate weekly averages
    Object.entries(weeksData).forEach(([weekStart, days]) => {
      const avgScreenTime = days.reduce((sum, day) => sum + day.screenTime, 0) / days.length
      const avgFocusTime = days.reduce((sum, day) => sum + day.focusTime, 0) / days.length
      const avgProductivity = days.reduce((sum, day) => sum + day.productivity, 0) / days.length
      const totalSessions = days.reduce((sum, day) => sum + day.completedFocusSessions, 0)

      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 6)

      weeks.push({
        week: `${weekStart} - ${weekEnd.toISOString().split("T")[0]}`,
        avgScreenTime,
        avgFocusTime,
        avgProductivity,
        totalSessions,
      })
    })

    return weeks.slice(-4) // Last 4 weeks
  }

  public formatTime(milliseconds: number): string {
    const hours = milliseconds / (1000 * 60 * 60)
    return `${hours.toFixed(1)}h`
  }

  public formatTimeDetailed(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000)
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }
}

export const historyDataManager = new HistoryDataManager()
