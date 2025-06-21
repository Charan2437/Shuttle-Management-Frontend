"use client"

import type React from "react"
import { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import {
  LayoutDashboard,
  Route,
  MapPin,
  Users,
  Calendar,
  CreditCard,
  BarChart3,
  Menu,
  LogOut,
  User,
  Bell,
  Search,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Suspense } from "react"

const navigation = [
  {
    name: "Overview",
    href: "/dashboard/admin",
    icon: LayoutDashboard,
    description: "System analytics and insights",
  },
  {
    name: "Route Management",
    href: "/dashboard/admin/routes",
    icon: Route,
    description: "Manage shuttle routes and schedules",
  },
  {
    name: "Stop Management",
    href: "/dashboard/admin/stops",
    icon: MapPin,
    description: "Add and configure bus stops",
  },
  {
    name: "Student Management",
    href: "/dashboard/admin/students",
    icon: Users,
    description: "Manage student accounts and profiles",
  },
  {
    name: "Booking Management",
    href: "/dashboard/admin/bookings",
    icon: Calendar,
    description: "View and manage all bookings",
  },
  {
    name: "Wallet Management",
    href: "/dashboard/admin/wallets",
    icon: CreditCard,
    description: "Manage student points and transactions",
  },
  {
    name: "Analytics",
    href: "/dashboard/admin/analytics",
    icon: BarChart3,
    description: "Detailed system analytics",
  },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Mock admin user for demo purposes
  const mockAdmin = {
    name: "System Administrator",
    email: "admin@university.edu",
  }

  const handleSignOut = () => {
    // Clear all localStorage and sessionStorage data
    localStorage.clear();
    sessionStorage.clear();
    // Optionally clear cookies if needed
    document.cookie = "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "auth-token=; path=/; domain=localhost; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "auth-token=; path=/; domain=.localhost; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    // Redirect to login page
    window.location.href = "/auth/login";
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="min-h-screen bg-gray-50">
        {/* Mobile sidebar */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-64 p-0">
            <div className="flex h-full flex-col">
              <div className="flex h-16 items-center border-b px-6">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded bg-[#1e3a5f] flex items-center justify-center">
                    <Route className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-lg font-semibold">Admin Panel</span>
                </div>
              </div>
              <nav className="flex-1 space-y-1 px-3 py-4">
                {navigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        isActive ? "bg-[#1e3a5f] text-white" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                      )}
                    >
                      <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                      {item.name}
                    </Link>
                  )
                })}
              </nav>
            </div>
          </SheetContent>
        </Sheet>

        {/* Desktop sidebar */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
          <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white">
            <div className="flex h-16 flex-shrink-0 items-center border-b border-gray-200 px-6">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded bg-[#1e3a5f] flex items-center justify-center">
                  <Route className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg font-semibold text-gray-900">Admin Panel</span>
              </div>
            </div>
            <div className="flex flex-1 flex-col overflow-y-auto">
              <nav className="flex-1 space-y-1 px-3 py-4">
                {navigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        isActive ? "bg-[#1e3a5f] text-white" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                      )}
                    >
                      <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                      <div className="flex-1">
                        <div>{item.name}</div>
                        <div className="text-xs opacity-75 mt-0.5">{item.description}</div>
                      </div>
                    </Link>
                  )
                })}
              </nav>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:pl-64">
          {/* Top navigation */}
          <div className="sticky top-0 z-40 flex h-16 flex-shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
            <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>

            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
              <div className="relative flex flex-1 items-center">
                <Search className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-400 pl-3" />
                <input
                  className="block h-full w-full border-0 py-0 pl-10 pr-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm bg-transparent"
                  placeholder="Search..."
                  type="search"
                />
              </div>
              <div className="flex items-center gap-x-4 lg:gap-x-6">
                <Button variant="ghost" size="sm">
                  <Bell className="h-5 w-5" />
                </Button>

                <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Admin" />
                        <AvatarFallback className="bg-[#1e3a5f] text-white">{mockAdmin.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{mockAdmin.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">{mockAdmin.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* Page content */}
          <main className="py-6">
            <div className="px-4 sm:px-6 lg:px-8">{children}</div>
          </main>
        </div>
      </div>
    </Suspense>
  )
}
