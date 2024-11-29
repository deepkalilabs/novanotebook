"use client"

import { Home, Settings, Activity, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    href: string
    title: string
    icon: React.ReactNode
  }[]
  isCollapsed: boolean
}

function SidebarNav({ className, items, isCollapsed, ...props }: SidebarNavProps) {
  return (
    <nav className={cn("flex flex-col gap-2", className)} {...props}>
      {items.map((item) => (
        <Button
          key={item.href}
          variant="ghost"
          className="w-full justify-start gap-2"
          asChild
        >
          <a href={item.href}>
            {item.icon}
            {!isCollapsed && item.title}
          </a>
        </Button>
      ))}
    </nav>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const sidebarNavItems = [
    {
      title: "Projects",
      href: "/dashboard/projects",
      icon: <Home className="h-4 w-4" />,
    },
    {
      title: "Jobs",
      href: "/dashboard/jobs",
      icon: <Activity className="h-4 w-4" />,
    },
    {
      title: "Settings",
      href: "/dashboard/settings", 
      icon: <Settings className="h-4 w-4" />,
    }
  ]

  return (
    <div className="flex min-h-screen">
      <div className="hidden border-r bg-gray-100/40 lg:block dark:bg-gray-800/40">
        <div className="flex h-full flex-col gap-2">
          <div className="flex h-[60px] items-center border-b px-6">
            {!isCollapsed && <span className="font-bold">NovaNotebook</span>}
          </div>
          <div className="flex-1 px-4">
            <SidebarNav items={sidebarNavItems} className="p-1" isCollapsed={isCollapsed} />
          </div>
          <Button
            variant="ghost"
            className="absolute -right-4 top-6 h-8 w-8 rounded-full border"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      <div className="flex-1">{children}</div>
    </div>
  )
}