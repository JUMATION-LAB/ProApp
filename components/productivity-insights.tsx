"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, Minus, Target, Award, AlertCircle } from "lucide-react"
import { useScreenTime } from "@/hooks/use-screen-time"
import { useAppUsage } from "@/hooks/use-app-usage"
import { useFocusMode } from "@/hooks/use-focus-mode"

interface InsightCardProps {
  title: string
  value: string
  change?: number
  trend?: "up" | "down" | "neutral"
  description: string
  type?: "positive" | "negative" | "neutral"
}

function InsightCard({ title, value, change, trend, description, type = "neutral" }: InsightCardProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4" />
      case "down":
        return <TrendingDown className="h-4 w-4" />
      default:
        return <Minus className="h-4 w-4" />
    }
  }

  const getTrendColor = () => {
    if (type === "positive") return "text-green-600"
    if (type === "negative") return "text-red-600"
    return "text-muted-foreground"
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>
          {change !== undefined && (
            <div className={`flex items-center gap-1 text-xs ${getTrendColor()}`}>
              {getTrendIcon()}
              <span>{Math.abs(change)}%</span>
            </div>
          )}
        </div>
        <div className="text-2xl font-bold mb-1">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

export function ProductivityInsights() {
  const { todayStats, formatTime } = useScreenTime()
  const { apps, totalUsageTime, mostUsedApp } = useAppUsage()
  const { totalFocusTime, completedSessions } = useFocusMode()

  // Calculate insights
  const productivityRatio = totalUsageTime > 0 ? (totalFocusTime / totalUsageTime) * 100 : 0
  const averageSessionLength = todayStats.sessions.length > 0 ? todayStats.totalTime / todayStats.sessions.length : 0

  const productiveApps = apps.filter((app) => app.category === "Productivity" || app.category === "Utilities")
  const entertainmentApps = apps.filter((app) => app.category === "Entertainment" || app.category === "Social")

  const productiveTime = productiveApps.reduce((total, app) => total + app.timeSpent, 0)
  const entertainmentTime = entertainmentApps.reduce((total, app) => total + app.timeSpent, 0)

  // Generate recommendations
  const recommendations = []

  if (productivityRatio < 30) {
    recommendations.push({
      type: "focus" as const,
      title: "Increase Focus Time",
      description: "Try to spend more time in focus mode to boost productivity",
      icon: Target,
    })
  }

  if (entertainmentTime > productiveTime * 2) {
    recommendations.push({
      type: "balance" as const,
      title: "Balance App Usage",
      description: "Consider reducing entertainment app usage",
      icon: AlertCircle,
    })
  }

  if (completedSessions >= 4) {
    recommendations.push({
      type: "achievement" as const,
      title: "Great Focus!",
      description: "You've completed multiple focus sessions today",
      icon: Award,
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Productivity Insights</h2>
        <p className="text-muted-foreground">Understand your digital habits and improve your focus</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <InsightCard
          title="Productivity Ratio"
          value={`${Math.round(productivityRatio)}%`}
          change={5}
          trend="up"
          type="positive"
          description="Focus time vs total screen time"
        />

        <InsightCard
          title="Avg Session"
          value={formatTime(averageSessionLength)}
          change={-12}
          trend="down"
          type="positive"
          description="Average screen session length"
        />

        <InsightCard
          title="Focus Sessions"
          value={completedSessions.toString()}
          change={25}
          trend="up"
          type="positive"
          description="Completed focus sessions today"
        />

        <InsightCard
          title="App Diversity"
          value={apps.length.toString()}
          trend="neutral"
          description="Different apps used today"
        />
      </div>

      {/* Usage Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Productive Apps</span>
              <span>{formatTime(productiveTime)}</span>
            </div>
            <Progress value={(productiveTime / totalUsageTime) * 100} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Entertainment Apps</span>
              <span>{formatTime(entertainmentTime)}</span>
            </div>
            <Progress value={(entertainmentTime / totalUsageTime) * 100} className="h-2 bg-orange-100" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Focus Time</span>
              <span>{formatTime(totalFocusTime)}</span>
            </div>
            <Progress value={(totalFocusTime / totalUsageTime) * 100} className="h-2 bg-green-100" />
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendations.map((rec, index) => {
              const Icon = rec.icon
              return (
                <div key={index} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <div
                    className={`p-2 rounded-lg ${
                      rec.type === "achievement"
                        ? "bg-green-100"
                        : rec.type === "focus"
                          ? "bg-blue-100"
                          : "bg-orange-100"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 ${
                        rec.type === "achievement"
                          ? "text-green-600"
                          : rec.type === "focus"
                            ? "text-blue-600"
                            : "text-orange-600"
                      }`}
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">{rec.title}</h4>
                    <p className="text-xs text-muted-foreground">{rec.description}</p>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
