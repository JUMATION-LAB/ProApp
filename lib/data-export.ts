// Data Export Utilities
// Handles exporting user data in various formats

import { focusModeManager } from "./focus-mode-manager"
import { screenTimeTracker } from "./screen-time-tracker"
import { appUsageTracker } from "./app-usage-tracker"

export interface ExportData {
  exportDate: string
  screenTime: {
    totalTime: number
    sessions: any[]
    dailyGoal: number
  }
  appUsage: {
    apps: any[]
    categories: any[]
  }
  focusMode: {
    sessions: any[]
    settings: any
    allowedApps: any[]
  }
}

class DataExporter {
  private isBrowser(): boolean {
    return typeof window !== "undefined"
  }

  public async exportToCSV(): Promise<string> {
    if (!this.isBrowser()) return ""

    const data = this.gatherAllData()

    // Create CSV content
    let csv = "FOCUSPLUS+ Data Export\n\n"

    // Screen Time Data
    csv += "Screen Time Sessions\n"
    csv += "Date,Duration (minutes),Session Count\n"

    // Focus Sessions
    csv += "\nFocus Sessions\n"
    csv += "Date,Type,Duration (minutes),Target Duration,Completed\n"
    data.focusMode.sessions.forEach((session) => {
      csv += `${new Date(session.startTime).toLocaleDateString()},${session.type},${Math.round(session.duration / 60000)},${Math.round((session.targetDuration || 0) / 60000)},${session.completed}\n`
    })

    // App Usage
    csv += "\nApp Usage\n"
    csv += "App Name,Category,Time (minutes),Sessions\n"
    data.appUsage.apps.forEach((app) => {
      csv += `${app.name},${app.category},${Math.round(app.timeSpent / 60000)},${app.sessions}\n`
    })

    return csv
  }

  public async exportToJSON(): Promise<string> {
    if (!this.isBrowser()) return "{}"

    const data = this.gatherAllData()
    return JSON.stringify(data, null, 2)
  }

  private gatherAllData(): ExportData {
    return {
      exportDate: new Date().toISOString(),
      screenTime: {
        totalTime: screenTimeTracker.instance?.getTodayStats().totalTime || 0,
        sessions: screenTimeTracker.instance?.getTodayStats().sessions || [],
        dailyGoal: 6 * 60 * 60 * 1000, // 6 hours default goal
      },
      appUsage: {
        apps: appUsageTracker.getTodayUsage(),
        categories: appUsageTracker.getCategoryBreakdown(),
      },
      focusMode: {
        sessions: focusModeManager.getTodayFocusSessions(),
        settings: focusModeManager.getSettings(),
        allowedApps: focusModeManager.getAllowedApps(),
      },
    }
  }

  public downloadFile(content: string, filename: string, type: string) {
    if (!this.isBrowser()) return

    const blob = new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  public async exportAndDownload(format: "csv" | "json") {
    const timestamp = new Date().toISOString().split("T")[0]

    if (format === "csv") {
      const csv = await this.exportToCSV()
      this.downloadFile(csv, `focusplus-data-${timestamp}.csv`, "text/csv")
    } else {
      const json = await this.exportToJSON()
      this.downloadFile(json, `focusplus-data-${timestamp}.json`, "application/json")
    }
  }
}

export const dataExporter = new DataExporter()
