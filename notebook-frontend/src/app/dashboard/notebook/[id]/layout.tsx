"use client"

import { Database, Notebook, Activity } from "lucide-react"
import { useParams, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from "@/lib/utils";

const getNotebookNavItems = (id: string, name: string) => [
  {
    title: "Notebook",
    href: `/dashboard/notebook/${id}?name=${encodeURIComponent(name)}`,
    icon: <Notebook className="h-4 w-4" />,
  },
  {
    title: "Connectors",
    href: `/dashboard/notebook/${id}/connectors?name=${encodeURIComponent(name)}`,
    icon: <Database className="h-4 w-4" />,
  },
  {
    title: "Jobs",
    href: `/dashboard/notebook/${id}/jobs?name=${encodeURIComponent(name)}`,
    icon: <Activity className="h-4 w-4" />,
  },
]

function SidebarNav() {
  const params = useParams();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const id = params.id as string;
  const name = searchParams.get('name') || '';
  
  const items = getNotebookNavItems(id, name);

  return (
    <nav className="grid items-start gap-1">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground",
            pathname === item.href ? "bg-accent" : "transparent"
          )}
        >
          {item.icon}
          {item.title}
        </Link>
      ))}
    </nav>
  )
}

function Sidebar() {
  return (
    <div className="w-[240px] border-r bg-background">
      <div className="flex h-14 items-center border-b px-6">
        <span className="font-medium">Notebook Editor</span>
      </div>
      <div className="py-2 px-2">
        <SidebarNav />
      </div>
    </div>
  )
}

export default function NotebookLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-full">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-2">
        {children}
      </main>
    </div>
  )
} 