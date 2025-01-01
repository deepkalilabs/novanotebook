"use client"

import { usePathname } from 'next/navigation';
import { useUserStore } from "@/app/store";
import { toast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { ConnectorCredentialsList } from '@/app/types';
import { Button } from "@/components/ui/button";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, MoreVertical, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';

export default function ConnectorsPage() {
  const pathname = usePathname();
  const pathSegments = pathname.split('/').filter(Boolean);
  const notebookId = pathSegments[pathSegments.length - 2];
  const userId = useUserStore.getState().user?.id;
  const [list, setList] = useState<ConnectorCredentialsList>({ credentials: [] });
  const [showCredentials, setShowCredentials] = useState<Record<string, boolean>>({});

  const fetchConnectors = async () => {
    try {
      const response = await fetch(`/api/connectors/${userId}/${notebookId}`);

      if (!response.ok) {
        toast({
          title: 'Failed to fetch connectors',
          description: 'Unable to load connector data. Please try again.',
          variant: 'destructive',
        });
        return null;
      }

      return response.json();
    } catch (error) {
      console.error("Error fetching connectors", error)
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while fetching connectors.',
        variant: 'destructive',
      });
      return null;
    }
  };

  useEffect(() => {
    if (list?.credentials?.length > 0) return;
    
    fetchConnectors().then((data) => {
      if (data) {
        const body = JSON.parse(data.data?.body);
        if (body?.credentials) {
          setList(body);
        }
      }
    });
  }, []);

  const toggleCredentialsVisibility = (id: string) => {
    setShowCredentials(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleEdit = (id: string) => {
    toast({
      title: 'Edit Connector',
      description: `Editing connector ${id}`,
    });
  };

  const handleDelete = (id: string) => {
    toast({
      title: 'Delete Connector',
      description: `Deleting connector ${id}`,
      variant: 'destructive',
    });
  };

  const handleAddConnector = () => {
    toast({
      title: 'Add Connector',
      description: 'Opening connector creation form',
    });
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <h1 className="text-2xl font-semibold">Connectors</h1>
          <p className="text-sm text-muted-foreground">
            Manage connectors for notebook {notebookId}
          </p>
        </div>
        <Button onClick={handleAddConnector}>
          <Plus className="mr-2 h-4 w-4" />
          Add Connector
        </Button>
      </div>
      <div className="mt-6">
        {list?.credentials?.length > 0 ? (
          <Table>
            <TableCaption>A list of your connectors.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Credentials</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.credentials.map((connector) => (
                <TableRow key={connector?.id}>
                  <TableCell>{connector?.connector_type}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-sm">
                        {showCredentials[connector?.id] 
                          ? JSON.stringify(connector?.credentials)
                          : '••••••••'}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleCredentialsVisibility(connector?.id)}
                      >
                        {showCredentials[connector?.id] ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(connector?.id)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(connector?.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-6 text-gray-500">
            No connectors found for this notebook.
          </div>
        )}
      </div>
    </div>
  );
}