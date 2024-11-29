"use client"

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Home, Settings, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sidebar } from "@/components/ui/sidebar"

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

export function AppSidebar() {
  return (
    <Sidebar className="border-r bg-background">
      <div className="flex h-[60px] items-center border-b px-6">
        <span className="font-semibold">NovaNotebook</span>
      </div>
      <nav className="space-y-1 p-2">
        {sidebarNavItems.map((item) => (
          <Button
            key={item.href}
            variant="ghost"
            className="w-full justify-start gap-2"
            asChild
          >
            <a href={item.href}>
              {item.icon}
              <span>{item.title}</span>
            </a>
          </Button>
        ))}
      </nav>
    </Sidebar>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1">
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  )
}