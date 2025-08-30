"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { useFocusMode } from "@/hooks/use-focus-mode"
import { Shield, Play, Pause, Clock, Target, CheckCircle, Settings, Timer, Zap } from "lucide-react"
import { useState } from "react"

export default function FocusPage() {
  const {
    currentSession,
    allowedApps,
    settings,
    isInFocusMode,
    totalFocusTime,
    completedSessions,
    startFocusSession,
    endFocusSession,
    updateAllowedApp,
    updateSettings,
    formatTime,
  } = useFocusMode()

  const [customDuration, setCustomDuration] = useState(25)

  const getSessionProgress = () => {
    if (!currentSession || !currentSession.targetDuration) return 0
    return Math.min((currentSession.duration / currentSession.targetDuration) * 100, 100)
  }

  const getRemainingTime = () => {
    if (!currentSession || !currentSession.targetDuration) return 0
    return Math.max(currentSession.targetDuration - currentSession.duration, 0)
  }

  const allowedAppsCount = allowedApps.filter((app) => app.isAllowed).length
  const blockedAppsCount = allowedApps.filter((app) => !app.isAllowed).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Focus Mode</h1>
        <p className="text-muted-foreground">Configure your focus sessions and stay productive</p>
      </div>

      {/* Current Session Status */}
      {isInFocusMode && currentSession && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Focus Session Active
                <Badge variant="secondary" className="ml-2">
                  {currentSession.type}
                </Badge>
              </CardTitle>
              <Button onClick={endFocusSession} variant="destructive" size="sm">
                <Pause className="mr-2 h-4 w-4" />
                End Session
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{formatTime(getRemainingTime())} remaining</span>
              </div>
              <Progress value={getSessionProgress()} className="h-2" />
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{formatTime(currentSession.duration)}</div>
                <p className="text-xs text-muted-foreground">Elapsed Time</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-secondary">{allowedAppsCount}</div>
                <p className="text-xs text-muted-foreground">Apps Allowed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="start" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="start">Start Session</TabsTrigger>
          <TabsTrigger value="apps">Allowed Apps</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Start Session Tab */}
        <TabsContent value="start" className="space-y-6">
          {/* Today's Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Focus Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{formatTime(totalFocusTime)}</div>
                <p className="text-xs text-muted-foreground">Today</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed Sessions</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-secondary">{completedSessions}</div>
                <p className="text-xs text-muted-foreground">Sessions finished</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Apps Blocked</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{blockedAppsCount}</div>
                <p className="text-xs text-muted-foreground">Distracting apps</p>
              </CardContent>
            </Card>
          </div>

          {/* Session Types */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
              <CardContent className="p-6" onClick={() => startFocusSession("pomodoro")}>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Timer className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Pomodoro</h3>
                    <p className="text-sm text-muted-foreground">{settings.pomodoroWorkDuration} min focus</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
              <CardContent className="p-6" onClick={() => startFocusSession("manual")}>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-secondary/10 rounded-lg">
                    <Target className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Quick Focus</h3>
                    <p className="text-sm text-muted-foreground">{settings.defaultDuration} min session</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-accent/10 rounded-lg">
                      <Zap className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Custom</h3>
                      <p className="text-sm text-muted-foreground">Set your own duration</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={customDuration}
                      onChange={(e) => setCustomDuration(Number(e.target.value))}
                      className="w-20"
                      min="1"
                      max="180"
                    />
                    <Button onClick={() => startFocusSession("custom", customDuration)} size="sm" className="flex-1">
                      <Play className="mr-2 h-4 w-4" />
                      Start
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Allowed Apps Tab */}
        <TabsContent value="apps" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Manage Allowed Apps</CardTitle>
              <p className="text-sm text-muted-foreground">
                Choose which apps you can access during focus sessions. Blocked apps will be restricted.
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {allowedApps.map((app) => (
                  <div key={app.id} className="flex items-center justify-between p-4 rounded-lg border bg-card">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl">{app.icon}</div>
                      <div>
                        <h4 className="font-semibold">{app.name}</h4>
                        <p className="text-sm text-muted-foreground">{app.category}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant={app.isAllowed ? "secondary" : "destructive"}>
                        {app.isAllowed ? "Allowed" : "Blocked"}
                      </Badge>
                      <Switch
                        checked={app.isAllowed}
                        onCheckedChange={(checked) => updateAllowedApp(app.id, checked)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Focus Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Duration Settings */}
              <div className="space-y-4">
                <h4 className="font-semibold">Session Durations</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="default-duration">Default Focus Duration (minutes)</Label>
                    <Input
                      id="default-duration"
                      type="number"
                      value={settings.defaultDuration}
                      onChange={(e) => updateSettings({ defaultDuration: Number(e.target.value) })}
                      min="1"
                      max="180"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pomodoro-work">Pomodoro Work Duration (minutes)</Label>
                    <Input
                      id="pomodoro-work"
                      type="number"
                      value={settings.pomodoroWorkDuration}
                      onChange={(e) => updateSettings({ pomodoroWorkDuration: Number(e.target.value) })}
                      min="1"
                      max="60"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pomodoro-break">Pomodoro Break Duration (minutes)</Label>
                    <Input
                      id="pomodoro-break"
                      type="number"
                      value={settings.pomodoroBreakDuration}
                      onChange={(e) => updateSettings({ pomodoroBreakDuration: Number(e.target.value) })}
                      min="1"
                      max="30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="long-break">Long Break Duration (minutes)</Label>
                    <Input
                      id="long-break"
                      type="number"
                      value={settings.pomodoroLongBreakDuration}
                      onChange={(e) => updateSettings({ pomodoroLongBreakDuration: Number(e.target.value) })}
                      min="1"
                      max="60"
                    />
                  </div>
                </div>
              </div>

              {/* Behavior Settings */}
              <div className="space-y-4">
                <h4 className="font-semibold">Behavior</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="auto-breaks">Auto-start breaks</Label>
                      <p className="text-sm text-muted-foreground">Automatically start break sessions after work</p>
                    </div>
                    <Switch
                      id="auto-breaks"
                      checked={settings.autoStartBreaks}
                      onCheckedChange={(checked) => updateSettings({ autoStartBreaks: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="strict-mode">Strict mode</Label>
                      <p className="text-sm text-muted-foreground">Prevent ending sessions early</p>
                    </div>
                    <Switch
                      id="strict-mode"
                      checked={settings.strictMode}
                      onCheckedChange={(checked) => updateSettings({ strictMode: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="notifications">Allow notifications</Label>
                      <p className="text-sm text-muted-foreground">Show notifications during focus sessions</p>
                    </div>
                    <Switch
                      id="notifications"
                      checked={settings.allowNotifications}
                      onCheckedChange={(checked) => updateSettings({ allowNotifications: checked })}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
