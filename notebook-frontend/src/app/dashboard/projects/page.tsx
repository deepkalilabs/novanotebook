"use client"
import React, { useEffect, useState } from 'react';
import { Plus, Search, MessageCircle, ArrowRight, BookTemplate, Trash2, Upload } from 'lucide-react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { redirect, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import FileUpload from '@/components/FileUpload';
import { v4 as uuidv4 } from 'uuid';
import { NotebookCell } from '@/app/types';
import { User } from '@supabase/supabase-js';
import { useNotebookConnection } from '@/hooks/useNotebookConnection';
import { useToast } from '@/hooks/use-toast';

const templateData = {
    "templates": [
        {
            "id": 1,
            "name": "My First Template",
            "description": "A template for testing",
            "example_customer": "See Provision this X and Y and resulted in this"
        },
        {
            "id": 2,
            "name": "My Second Template",
            "description": "A template for testing",
            "example_customer": "See Provision this X and Y and resulted in this"
        },
        {
            "id": 3,
            "name": "My Third Template",
            "description": "A template for testing",
            "example_customer": "See Provision this X and Y and resulted in this"
        }
    ]
}

interface Notebook {
    id: string;
    user_id: string;
    session_id: string;
    name: string;
    description: string;
    s3_url: string;
    updated_at: string;
    created_at: string;
}

export default function ProjectsPage() {
    const [notebooks, setNotebooks] = useState<Notebook[]>([]);
    const [search, setSearch] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [newNotebookName, setNewNotebookName] = useState("");
    const filterNotebooks = notebooks.filter((notebook: { name: string }) => notebook.name.toLowerCase().includes(search.toLowerCase()));
    const [importNotebookDialogOpen, setImportNotebookDialogOpen] = useState(false);
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);  // Add at the top with other state declarations
    const { toast } = useToast();

    const { saveNotebook } = useNotebookConnection({
      onNotebookSaved: (data) => {
        if (data.success) {
          console.log(`Toasting: Received notebook_saved: ${data.type}, success: ${data.success}, message: ${data.message}`);
          toast({
            title: "Notebook imported",
            description: data.message,
            variant: "default"
          });
        } else {
          toast({
            title: "Failed to save",
            description: data.message,
            variant: "destructive"
          });
        }
      }
    })

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                redirect('/auth/signin');
            }
            const { data: { user: currentUser }, error } = await supabase.auth.getUser();
            if (!error && currentUser) {
                setUser(currentUser);
            }
        };
        checkAuth();
    }, []);

    const createNotebookHelper = async (notebookName: string) : Promise<string> => {
      const newNotebook = {
          user_id: user?.id,
          name: notebookName,
          description: "New notebook", // Adding a default description
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
      }

      // Supabase create notebook
      const { data, error } = await supabase
          .from('notebooks')
          .insert(newNotebook)
          .select()
          .single();

      if (error) {
          console.error('Error creating notebook:', error);
          alert('Failed to create notebook: ' + error.message);
          return "";
      }

      setNotebooks(prevNotebooks => [...prevNotebooks, data]);
      setNewNotebookName("");

      return data.id;
    }

    const createNotebook = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        const notebookId = await createNotebookHelper(newNotebookName);
        alert(`Notebook created successfully at ${notebookId}`);

        setDialogOpen(false);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleFileSelect = async (fileName: string, fileContent: { cells: any[] }) => {
      const codeCells = fileContent?.cells?.filter((cell) => cell.cell_type === 'code') || [];
      const cosmicCells: NotebookCell[] = []
      
      codeCells.forEach((cell) => {
        cosmicCells.push({
          id: uuidv4(),
          code: cell.source.join(''),
          output: cell.outputs[0],
          executionCount: 0
        })
      })

      setImportNotebookDialogOpen(false);
      const notebookId = await createNotebookHelper(fileName);
      alert(`Notebook created successfully at ${notebookId}`);

      // TODO: Save the notebook cells to S3 associated with the notebook name
      if (user?.id) {
        saveNotebook(cosmicCells, fileName, notebookId, user?.id)
      } else {
        console.error("User should not be null for saving notebook.")
      }
      console.log('cosmicCells', cosmicCells);
      openNotebook(notebookId, fileName);
    }

    const getAllNotebooks = async () => {
        const { data, error } = await supabase.from('notebooks').select();
        if (error) {
            alert('Failed to fetch notebooks: ' + error.message);
            return;
        }
        setNotebooks(data || [] as Notebook[]); // Type assertion with proper interface
    }

    const deleteNotebook = async (notebookId: string) => {
        const { error } = await supabase
            .from('notebooks')
            .delete()
            .eq('id', notebookId);
            
        if (error) {
            alert('Failed to delete notebook: ' + error.message);
            return;
        }
        
        setNotebooks(notebooks.filter((notebook: { id: string }) => notebook.id !== notebookId));
    }

    const openNotebook = (notebookId: string, name: string) => {
        router.push(`/dashboard/notebook/${notebookId}?name=${name}`);
    }

    useEffect(() => {
        console.log(newNotebookName);
    }, [newNotebookName]);

    useEffect(() => {
        getAllNotebooks();
    }, []);

    return (
        <div className="flex flex-col h-screen bg-background">
        <div className="flex-1 space-y-8 p-8 pt-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Notebooks</h2>
              <p className="text-muted-foreground">
                Manage and create your Jupyter notebooks.
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Notebook
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Notebook</DialogTitle>
                </DialogHeader>
                <div className="flex gap-4">
                  <Input
                    value={newNotebookName}
                    onChange={(e) => setNewNotebookName(e.target.value)}
                    placeholder="Enter notebook name"
                  />
                  <Button onClick={createNotebook}>Create</Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={importNotebookDialogOpen} onOpenChange={setImportNotebookDialogOpen}> 
                <Button onClick={() => setImportNotebookDialogOpen(true)}>
                  <Upload className="mr-2 h-4 w-4" />
                  Import Notebook
                </Button>
              <DialogContent aria-describedby="import-notebook-description">
                <DialogHeader>
                  <DialogTitle>Import Notebook</DialogTitle>
                  <DialogDescription id="import-notebook-description">
                    Upload a Jupyter notebook file to import it into your workspace.
                  </DialogDescription>
                </DialogHeader>
                <FileUpload onFileSelect={handleFileSelect} />
              </DialogContent>
            </Dialog>
            </div>
          </div>
  
          {/* Search */}
          <div className="flex items-center space-x-2 max-w-md">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notebooks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9"
            />
          </div>
  
          {/* Notebooks Grid */}
          <ScrollArea className="flex-1">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filterNotebooks.map((notebook) => (
                <Card key={notebook.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="space-y-0 pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <MessageCircle className="h-4 w-4 text-muted-foreground" />
                        <h4 className="font-medium">{notebook.name}</h4>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotebook(notebook.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-500" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {notebook.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Modified: {notebook.updated_at}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="secondary" 
                      className="w-full"
                      onClick={() => openNotebook(notebook.id, notebook.name)}
                    >
                      Open Notebook
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </ScrollArea>
  
          <Separator className="my-4" />
  
          {/* Templates Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Templates</h3>
              <Button variant="outline">
                Request Template
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid gap-4 md:grid-cols-3">
              {templateData.templates.map((template) => (
                <Card key={template.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="space-y-0 pb-2">
                    <div className="flex items-center space-x-2">
                      <BookTemplate className="h-4 w-4 text-muted-foreground" />
                      <h4 className="font-medium">{template.name}</h4>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {template.description}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="secondary" className="w-full">
                      Use Template
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
}