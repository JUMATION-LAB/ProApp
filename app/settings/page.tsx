"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useSettings } from "@/hooks/use-settings"
import { dataExporter } from "@/lib/data-export"
import { Download, RotateCcw, Trash2, Bell, Eye, Target, Shield } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const { settings, isLoading, updateSetting, resetSettings, resetAllData } = useSettings()
  const { toast } = useToast()
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async (format: "csv" | "json") => {
    setIsExporting(true)
    try {
      await dataExporter.exportAndDownload(format)
      toast({
        title: "Export successful",
        description: `Your data has been exported as ${format.toUpperCase()}`,
      })
    } catch (error) {
      toast({
        title: "Export failed",
        description: "There was an error exporting your data",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleResetSettings = () => {
    resetSettings()
    toast({
      title: "Settings reset",
      description: "All settings have been restored to defaults",
    })
  }

  const handleResetAllData = () => {
    resetAllData()
    toast({
      title: "All data cleared",
      description: "All app data has been permanently deleted",
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold "  >Settings</h1>
          <p className="text-muted-foreground">Loading preferences...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Configure your FOCUSPLUS+ preferences</p>
      </div>

      {/* Theme Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Appearance
          </CardTitle>
          <CardDescription>Customize how the app looks and feels</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="theme">Theme</Label>
            <Select
              value={settings.theme}
              onValueChange={(value: "light" | "dark" | "system") => updateSetting("theme", value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="24hour">Use 24-hour format</Label>
            <Switch
              id="24hour"
              checked={settings.display.use24HourFormat}
              onCheckedChange={(checked) => updateSetting("display", { use24HourFormat: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="seconds">Show seconds in timers</Label>
            <Switch
              id="seconds"
              checked={settings.display.showSeconds}
              onCheckedChange={(checked) => updateSetting("display", { showSeconds: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="compact">Compact mode</Label>
            <Switch
              id="compact"
              checked={settings.display.compactMode}
              onCheckedChange={(checked) => updateSetting("display", { compactMode: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>Control when and how you receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="daily-summary">Daily summary</Label>
            <Switch
              id="daily-summary"
              checked={settings.notifications.dailySummary}
              onCheckedChange={(checked) => updateSetting("notifications", { dailySummary: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="focus-reminders">Focus session reminders</Label>
            <Switch
              id="focus-reminders"
              checked={settings.notifications.focusReminders}
              onCheckedChange={(checked) => updateSetting("notifications", { focusReminders: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="break-reminders">Break reminders</Label>
            <Switch
              id="break-reminders"
              checked={settings.notifications.breakReminders}
              onCheckedChange={(checked) => updateSetting("notifications", { breakReminders: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="goal-achieved">Goal achievement alerts</Label>
            <Switch
              id="goal-achieved"
              checked={settings.notifications.goalAchieved}
              onCheckedChange={(checked) => updateSetting("notifications", { goalAchieved: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Goals Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Goals & Limits
          </CardTitle>
          <CardDescription>Set your daily and weekly targets</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>
              Daily screen time limit: {Math.floor(settings.goals.dailyScreenTimeLimit / 60)}h{" "}
              {settings.goals.dailyScreenTimeLimit % 60}m
            </Label>
            <Slider
              value={[settings.goals.dailyScreenTimeLimit]}
              onValueChange={([value]) => updateSetting("goals", { dailyScreenTimeLimit: value })}
              max={720}
              min={60}
              step={30}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label>
              Daily focus goal: {Math.floor(settings.goals.dailyFocusGoal / 60)}h {settings.goals.dailyFocusGoal % 60}m
            </Label>
            <Slider
              value={[settings.goals.dailyFocusGoal]}
              onValueChange={([value]) => updateSetting("goals", { dailyFocusGoal: value })}
              max={480}
              min={15}
              step={15}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label>
              Weekly focus goal: {Math.floor(settings.goals.weeklyFocusGoal / 60)}h{" "}
              {settings.goals.weeklyFocusGoal % 60}m
            </Label>
            <Slider
              value={[settings.goals.weeklyFocusGoal]}
              onValueChange={([value]) => updateSetting("goals", { weeklyFocusGoal: value })}
              max={2520}
              min={120}
              step={60}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy
          </CardTitle>
          <CardDescription>Control your data and privacy preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="data-collection">Allow data collection for improvements</Label>
            <Switch
              id="data-collection"
              checked={settings.privacy.dataCollection}
              onCheckedChange={(checked) => updateSetting("privacy", { dataCollection: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="analytics">Share anonymous usage analytics</Label>
            <Switch
              id="analytics"
              checked={settings.privacy.analytics}
              onCheckedChange={(checked) => updateSetting("privacy", { analytics: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Data Management
          </CardTitle>
          <CardDescription>Export, backup, or reset your data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={() => handleExport("csv")} disabled={isExporting} variant="outline" className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Export as CSV
            </Button>
            <Button onClick={() => handleExport("json")} disabled={isExporting} variant="outline" className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Export as JSON
            </Button>
          </div>

          <Separator />

          <div className="flex flex-col sm:flex-row gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="flex-1 bg-transparent">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset Settings
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset Settings</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will restore all settings to their default values. Your usage data will not be affected.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleResetSettings}>Reset Settings</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="flex-1">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear All Data</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all your usage data, focus sessions, settings, and preferences. This
                    action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleResetAllData}
                    className="bg-destructive text-destructive-foreground"
                  >
                    Delete Everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
