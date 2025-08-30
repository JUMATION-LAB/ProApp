"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAppUsage } from "@/hooks/use-app-usage"
import { Clock, BarChart3, Smartphone, TrendingUp } from "lucide-react"

export default function UsagePage() {
  const { apps, usageByCategory, totalUsageTime, mostUsedApp, sortBy, setSortBy, formatTime } = useAppUsage()

  const categories = Object.keys(usageByCategory)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">App Usage</h1>
          <p className="text-muted-foreground">Detailed breakdown of your app usage today</p>
        </div>

        <Select value={sortBy} onValueChange={(value: "time" | "alphabetical") => setSortBy(value)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="time">Most Used</SelectItem>
            <SelectItem value="alphabetical">Alphabetical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{formatTime(totalUsageTime)}</div>
            <p className="text-xs text-muted-foreground">Across all apps</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Apps Used</CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{apps.length}</div>
            <p className="text-xs text-muted-foreground">Different apps today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Used</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-secondary truncate">
              {mostUsedApp ? mostUsedApp.name : "No data"}
            </div>
            <p className="text-xs text-muted-foreground">{mostUsedApp ? formatTime(mostUsedApp.timeSpent) : "N/A"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-1">{categories.length}</div>
            <p className="text-xs text-muted-foreground">App categories</p>
          </CardContent>
        </Card>
      </div>

      {/* App Usage List */}
      <Card>
        <CardHeader>
          <CardTitle>Today's App Usage</CardTitle>
        </CardHeader>
        <CardContent>
          {apps.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              No app usage data available
            </div>
          ) : (
            <div className="space-y-4">
              {apps.map((app, index) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="flex items-center justify-center w-12 h-12 rounded-lg text-2xl"
                      style={{ backgroundColor: `${app.color}20` }}
                    >
                      {app.icon}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{app.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          {app.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {app.sessions} session{app.sessions !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-semibold text-lg">{formatTime(app.timeSpent)}</div>
                    <div className="text-xs text-muted-foreground">#{index + 1} most used</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage by Category */}
      {categories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Usage by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => {
                const categoryApps = usageByCategory[category]
                const categoryTotal = categoryApps.reduce((total, app) => total + app.timeSpent, 0)

                return (
                  <div key={category} className="p-4 rounded-lg border bg-card">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{category}</h4>
                      <Badge variant="secondary">{categoryApps.length}</Badge>
                    </div>
                    <div className="text-2xl font-bold text-primary mb-1">{formatTime(categoryTotal)}</div>
                    <p className="text-xs text-muted-foreground">
                      {categoryApps.length} app{categoryApps.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
