"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Clock,
  Shield,
  Smartphone,
  Play,
  Pause,
  BarChart3,
  History,
  TrendingUp,
  Target,
  CheckCircle,
  AlertTriangle,
} from "lucide-react"
import { useScreenTime } from "@/hooks/use-screen-time"
import { useAppUsage } from "@/hooks/use-app-usage"
import { useFocusMode } from "@/hooks/use-focus-mode"
import Link from "next/link"

export function Dashboard() {
  const { todayStats, currentSession, isFocusMode, currentFocusTime, startFocusMode, endFocusMode, formatTime } =
    useScreenTime()

  const { apps, mostUsedApp, totalUsageTime } = useAppUsage()
  const {
    currentSession: focusSession,
    isInFocusMode: focusActive,
    totalFocusTime,
    completedSessions,
    allowedApps,
  } = useFocusMode()

  const productivityScore = totalFocusTime > 0 ? Math.min((totalFocusTime / totalUsageTime) * 100, 100) : 0
  const allowedAppsCount = allowedApps.filter((app) => app.isAllowed).length
  const blockedAppsCount = allowedApps.filter((app) => !app.isAllowed).length

  const dailyFocusGoal = 2 * 60 * 60 * 1000 // 2 hours in milliseconds
  const focusGoalProgress = (totalFocusTime / dailyFocusGoal) * 100

  const dailyScreenTimeGoal = 6 * 60 * 60 * 1000 // 6 hours in milliseconds
  const screenTimeProgress = (todayStats.totalTime / dailyScreenTimeGoal) * 100
  const isScreenTimeExcessive = screenTimeProgress > 80

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-balance">Good morning!</h1>
        <p className="text-muted-foreground text-pretty">Here's your screen time summary for today</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Usage</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{formatTime(todayStats.totalTime)}</div>
            <p className="text-xs text-muted-foreground">{todayStats.sessions.length} sessions today</p>
            <div className="mt-2">
              <Progress
                value={Math.min(screenTimeProgress, 100)}
                className={`h-1 ${isScreenTimeExcessive ? "bg-destructive/20" : ""}`}
              />
              <p className="text-xs text-muted-foreground mt-1">{Math.round(screenTimeProgress)}% of daily limit</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Session</CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              {currentSession.isActive ? formatTime(currentSession.duration) : "Inactive"}
            </div>
            <p className="text-xs text-muted-foreground">
              {currentSession.isActive ? "Screen active time" : "Screen is off"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Focus Time</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">
              {focusActive ? formatTime(currentFocusTime) : formatTime(totalFocusTime)}
            </div>
            <p className="text-xs text-muted-foreground">
              {focusActive ? "Current focus session" : "Total focus time today"}
            </p>
            <div className="mt-2">
              <Progress value={Math.min(focusGoalProgress, 100)} className="h-1" />
              <p className="text-xs text-muted-foreground mt-1">{Math.round(focusGoalProgress)}% of daily goal</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productivity</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-1">{Math.round(productivityScore)}%</div>
            <p className="text-xs text-muted-foreground">Focus vs total time</p>
            <div className="mt-2">
              <Progress value={productivityScore} className="h-1" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Daily Goals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Focus Time Goal</span>
                <span>
                  {formatTime(totalFocusTime)} / {formatTime(dailyFocusGoal)}
                </span>
              </div>
              <Progress value={Math.min(focusGoalProgress, 100)} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Screen Time Limit</span>
                <span className={isScreenTimeExcessive ? "text-destructive" : ""}>
                  {formatTime(todayStats.totalTime)} / {formatTime(dailyScreenTimeGoal)}
                </span>
              </div>
              <Progress
                value={Math.min(screenTimeProgress, 100)}
                className={`h-2 ${isScreenTimeExcessive ? "bg-destructive/20" : ""}`}
              />
            </div>

            <div className="flex items-center gap-2 text-sm">
              {focusGoalProgress >= 100 ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <Target className="h-4 w-4 text-muted-foreground" />
              )}
              <span className={focusGoalProgress >= 100 ? "text-green-600" : "text-muted-foreground"}>
                {focusGoalProgress >= 100 ? "Focus goal achieved!" : "Keep focusing to reach your goal"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Today's Highlights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-xl font-bold text-secondary">{completedSessions}</div>
                <p className="text-xs text-muted-foreground">Focus sessions</p>
              </div>
              <div>
                <div className="text-xl font-bold text-primary">{apps.length}</div>
                <p className="text-xs text-muted-foreground">Apps used</p>
              </div>
            </div>

            {mostUsedApp && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{mostUsedApp.icon}</span>
                  <span className="font-medium text-sm">Most used app</span>
                </div>
                <p className="text-sm font-semibold">{mostUsedApp.name}</p>
                <p className="text-xs text-muted-foreground">{formatTime(mostUsedApp.timeSpent)}</p>
              </div>
            )}

            {isScreenTimeExcessive && (
              <div className="flex items-center gap-2 p-2 bg-destructive/10 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <span className="text-sm text-destructive">Screen time limit exceeded</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Focus Mode Control */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Focus Mode
                {focusActive && (
                  <Badge variant="secondary" className="ml-2">
                    Active
                  </Badge>
                )}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {focusActive
                  ? "Focus mode is active. Only allowed apps are accessible."
                  : "Block distracting apps and stay focused on what matters."}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Button
            onClick={focusActive ? endFocusMode : startFocusMode}
            size="lg"
            className="w-full"
            variant={focusActive ? "destructive" : "default"}
          >
            {focusActive ? (
              <>
                <Pause className="mr-2 h-4 w-4" />
                End Focus Session
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Start Focus Session
              </>
            )}
          </Button>

          {focusActive && focusSession && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Session Duration:</span>
                <span className="font-medium">{formatTime(currentFocusTime)}</span>
              </div>
              {focusSession.targetDuration && (
                <div className="space-y-1">
                  <Progress
                    value={Math.min((currentFocusTime / focusSession.targetDuration) * 100, 100)}
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span>{formatTime(Math.max(focusSession.targetDuration - currentFocusTime, 0))} remaining</span>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-4 grid grid-cols-2 gap-4 text-center text-sm">
            <div>
              <div className="font-semibold text-green-600">{allowedAppsCount}</div>
              <p className="text-muted-foreground">Apps allowed</p>
            </div>
            <div>
              <div className="font-semibold text-destructive">{blockedAppsCount}</div>
              <p className="text-muted-foreground">Apps blocked</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/usage">
          <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">View App Usage</h3>
                  <p className="text-sm text-muted-foreground">See detailed breakdown of your app usage</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/history">
          <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-secondary/10 rounded-lg">
                  <History className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <h3 className="font-semibold">Usage History</h3>
                  <p className="text-sm text-muted-foreground">Track your progress over time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
