"use client"

import { usePathname } from 'next/navigation';
import { useUserStore } from "@/app/store";
import { toast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { ConnectorCredentialsList } from '@/app/types';


//TODO: 1. Obscure credentials
//TODO: 2. Add a button to delete a connector
//TODO: 3. Add a button to edit a connector
//TODO: 4. Add a button to add a connector
//TODO: 5. Only show connectors that are meant for this notebook
//TODO: 6. Make the page look nice

export default function ConnectorsPage() {
  const pathname = usePathname();
  const pathSegments = pathname.split('/').filter(Boolean);
  const notebookId = pathSegments[pathSegments.length - 2];
  const userId = useUserStore.getState().user?.id;
  const [list, setList] = useState<ConnectorCredentialsList>({ credentials: [] });


  const fetchConnectors = async () => {
    console.log('userId', userId);
    console.log('notebookId', notebookId);
    const response = await fetch(`/api/connectors/${userId}/${notebookId}`);

    if (response.status !== 200) {
      toast({
        title: 'Failed to fetch connectors',
        variant: 'destructive',
      });
      console.error('Failed to fetch connectors', response);
      return null;
    }

    return response.json();
  };

  useEffect(() => {
    console.log('fetching connectors');
    if (list?.credentials?.length > 0) {
      return;
    }
    fetchConnectors().then((data) => {
      if (data) {
        console.log('data', data.data?.body);
        let body = JSON.parse(data.data?.body);
        if (body?.credentials) {
          setList(body);
        }
      }
    });
  }, []);

  useEffect(() => {
    console.log('list', list.credentials);
  }, [list]);

  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Connectors for Notebook: {notebookId}</h1>
      {list?.credentials?.length > 0 ? (
        <ul className="space-y-2">
          {list.credentials.map((connector) => (
            <li 
              key={connector?.id} 
              className="p-3 border rounded-lg hover:bg-gray-50"
            >
              <div className="font-medium">ID: {connector?.connector_id}</div>
              {connector?.id && <div>id: {connector?.id}</div>}
              {connector?.notebook_id && <div>notebook_id: {connector?.notebook_id}</div>}
              {connector?.user_id && <div>user_id: {connector?.user_id}</div>}
              {connector?.credentials && <div>credentials: {JSON.stringify(connector?.credentials)}</div>}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No connectors found for this notebook.</p>
      )}
    </div>
  );
}
