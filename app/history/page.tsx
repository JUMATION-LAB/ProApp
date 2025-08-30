"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useHistoryData } from "@/hooks/use-history-data"
import { TrendingUp, TrendingDown, Clock, Shield, Calendar, Target, Minus } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from "recharts"

function TrendIndicator({ value, label }: { value: number; label: string }) {
  const isPositive = value > 0
  const isNegative = value < 0

  return (
    <div className="flex items-center gap-2">
      {isPositive && <TrendingUp className="h-4 w-4 text-green-600" />}
      {isNegative && <TrendingDown className="h-4 w-4 text-red-600" />}
      {!isPositive && !isNegative && <Minus className="h-4 w-4 text-muted-foreground" />}
      <span
        className={`text-sm font-medium ${
          isPositive ? "text-green-600" : isNegative ? "text-red-600" : "text-muted-foreground"
        }`}
      >
        {Math.abs(value).toFixed(1)}% {label}
      </span>
    </div>
  )
}

export default function HistoryPage() {
  const {
    dailyData,
    weeklyTrends,
    timeRange,
    setTimeRange,
    isLoading,
    filteredData,
    averages,
    trends,
    formatTime,
    formatTimeDetailed,
  } = useHistoryData()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Usage History</h1>
          <p className="text-muted-foreground">Loading your usage history...</p>
        </div>
        <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  // Prepare chart data
  const chartData =
    timeRange === "weekly"
      ? weeklyTrends.map((week) => ({
          date: week.week.split(" - ")[0],
          screenTime: week.avgScreenTime / (1000 * 60 * 60), // Convert to hours
          focusTime: week.avgFocusTime / (1000 * 60 * 60),
          productivity: week.avgProductivity,
          sessions: week.totalSessions,
        }))
      : filteredData.map((day) => ({
          date: new Date(day.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          screenTime: day.screenTime / (1000 * 60 * 60), // Convert to hours
          focusTime: day.focusTime / (1000 * 60 * 60),
          productivity: day.productivity,
          sessions: day.completedFocusSessions,
        }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Usage History</h1>
          <p className="text-muted-foreground">Track your screen time progress over time</p>
        </div>

        <Select value={timeRange} onValueChange={(value: "7d" | "30d" | "weekly") => setTimeRange(value)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select time range..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="weekly">Weekly Trends</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Screen Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{formatTime(averages.avgScreenTime)}</div>
            <TrendIndicator value={trends.screenTimeTrend} label="vs last week" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Focus Time</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">{formatTime(averages.avgFocusTime)}</div>
            <TrendIndicator value={trends.focusTimeTrend} label="vs last week" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Productivity</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{averages.avgProductivity.toFixed(1)}%</div>
            <TrendIndicator value={trends.productivityTrend} label="vs last week" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Days</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-1">{filteredData.length}</div>
            <p className="text-xs text-muted-foreground">Days tracked</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="focus">Focus Analysis</TabsTrigger>
          <TabsTrigger value="productivity">Productivity</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Screen Time & Focus Time Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        `${value.toFixed(1)}h`,
                        name === "screenTime" ? "Screen Time" : "Focus Time",
                      ]}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="screenTime"
                      stroke="var(--color-primary)"
                      name="Screen Time"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="focusTime"
                      stroke="var(--color-secondary)"
                      name="Focus Time"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Daily Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => [`${value}`, "Focus Sessions"]} />
                    <Bar dataKey="sessions" fill="var(--color-accent)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Focus Analysis Tab */}
        <TabsContent value="focus" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Focus Time Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => [`${value.toFixed(1)}h`, "Focus Time"]} />
                    <Area
                      type="monotone"
                      dataKey="focusTime"
                      stroke="var(--color-secondary)"
                      fill="var(--color-secondary)"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Focus Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Best Focus Day</span>
                  <span className="font-medium">
                    {dailyData.reduce((best, day) => (day.focusTime > best.focusTime ? day : best)).date}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Focus Sessions</span>
                  <span className="font-medium">
                    {dailyData.reduce((sum, day) => sum + day.completedFocusSessions, 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Focus Streak</span>
                  <Badge variant="secondary">3 days</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Weekly Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {weeklyTrends.slice(-2).map((week, index) => (
                  <div key={week.week} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Week {index + 1}</span>
                      <span>{formatTime(week.avgFocusTime)}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-secondary h-2 rounded-full"
                        style={{ width: `${Math.min((week.avgFocusTime / (2 * 60 * 60 * 1000)) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Productivity Tab */}
        <TabsContent value="productivity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Productivity Score Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, "Productivity"]} />
                    <Line
                      type="monotone"
                      dataKey="productivity"
                      stroke="var(--color-chart-1)"
                      strokeWidth={3}
                      dot={{ fill: "var(--color-chart-1)", strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {dailyData.filter((day) => day.productivity > 50).length}
                </div>
                <p className="text-sm text-muted-foreground">High Productivity Days</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {Math.max(...dailyData.map((day) => day.productivity)).toFixed(1)}%
                </div>
                <p className="text-sm text-muted-foreground">Best Productivity Score</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-secondary mb-2">
                  {(dailyData.reduce((sum, day) => sum + day.productivity, 0) / dailyData.length).toFixed(1)}%
                </div>
                <p className="text-sm text-muted-foreground">Average Productivity</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
