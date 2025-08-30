import type React from "react"
import type { Metadata } from "next"
import { Navigation } from "@/components/navigation"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "FOCUSPLUS+ - Screen Time Tracker",
  description: "Track your screen time and stay focused with FOCUSPLUS+",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans">
        <Suspense fallback={<div>Loading...</div>}>
          <Navigation />
          <main className="pt-16 md:pt-0 md:pl-64 min-h-screen bg-background">
            <div className="p-4 md:p-8 max-w-7xl mx-auto">{children}</div>
          </main>
        </Suspense>
      </body>
    </html>
  )
}
