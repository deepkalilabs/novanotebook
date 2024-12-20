"use client"

import { usePathname } from 'next/navigation';

export default function ConnectorsPage() {
  const pathname = usePathname();
  const pathSegments = pathname.split('/').filter(Boolean);
  const notebookId = pathSegments[pathSegments.length - 2];
  
  return (
    <div>
      <h1>Connectors for Notebook: {notebookId}</h1>
    </div>
  );
}