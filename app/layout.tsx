import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { NextAuthSessionProvider } from "@/components/providers/session-provider"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Shuttle Management System",
  description: "Smart Campus Transit Solution for University Students",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NextAuthSessionProvider>
          <div className="min-h-screen bg-background">{children}</div>
          <Toaster />
        </NextAuthSessionProvider>
      </body>
    </html>
  )
}
