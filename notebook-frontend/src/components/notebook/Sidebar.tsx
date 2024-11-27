// Update imports
import { Home, Settings, MessageSquare, Activity, Menu, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState } from "react"

//TODO: Swap the sidebar with the shadcn sidebar

// Add this new interface above the component
interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    href: string
    title: string
    icon: React.ReactNode
  }[]
  isCollapsed: boolean
}

// Add this new component above NotebookPage
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

export default function NotebookPageSidebar({ notebookId, isConnected }: { notebookId: string, isConnected: boolean }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  console.log(notebookId);

  const sidebarNavItems = [
    {
      title: "Home",
      href: "/dashboard/projects",
      icon: <Home className="h-4 w-4" />,
    },
    {
      title: "Active Jobs",
      href: "/jobs",
      icon: <Activity className="h-4 w-4" />,
    },
    {
      title: "Comments",
      href: "/comments",
      icon: <MessageSquare className="h-4 w-4" />,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: <Settings className="h-4 w-4" />,
    },
  ]

  const SidebarContent = () => (
    <div className={cn("relative space-y-4 py-4", isCollapsed ? "w-16" : "w-48")}>
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1 hidden lg:flex"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </Button>
      <div className="px-3 py-2">
        {!isCollapsed && (
          <>
            <h2 className="mb-2 px-4 text-lg font-semibold">NovaNotebook</h2>
            <div className="text-sm text-muted-foreground px-4 mb-4">
              <p>Name: {"DatasetEnrich"}</p>
              <p>Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
            </div>
          </>
        )}
        <SidebarNav items={sidebarNavItems} isCollapsed={isCollapsed} />
      </div>
    </div>
  )


  return (
    <div className="flex min-h-screen">
      {/* Mobile Sidebar */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetTrigger asChild className="lg:hidden absolute left-4 top-4">
          <Button variant="outline" size="icon">
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-48 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className={cn(
        "hidden lg:block border-r bg-muted/40 min-h-screen transition-all duration-300 pr-8",
        isCollapsed ? "w-16" : "w-48"
      )}>
        <SidebarContent />
      </div>

    </div>
  );
}