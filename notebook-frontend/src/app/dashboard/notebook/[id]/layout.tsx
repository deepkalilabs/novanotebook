"use client"

import { Button } from "@/components/ui/button"
import { Database, Notebook, Activity } from "lucide-react"
import { useParams, useSearchParams } from 'next/navigation';

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

export function NotebookSidebar({ id, name }: { id: string, name: string }) {
  return (
    <div className="w-[240px] border-r bg-background">
      <div className="flex h-[60px] items-center border-b px-6">
        <span className="font-semibold">Notebook Settings</span>
      </div>
      <nav className="space-y-1 p-2">
        {getNotebookNavItems(id, name).map((item) => (
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
    </div>
  )
}

export default function NotebookLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const name = searchParams.get('name') || '';

  return (
    <div className="flex">
      <NotebookSidebar id={id} name={name} />
      <div className="flex-1 p-6">
        {children}
      </div>
    </div>
  )
} 