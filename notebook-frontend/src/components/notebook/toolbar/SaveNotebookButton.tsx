'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Save, Loader2 } from 'lucide-react';

interface SaveNotebookButtonProps {
  onHandleSave: (filename: string) => Promise<unknown>;
}

export function SaveNotebookButton({ onHandleSave }: SaveNotebookButtonProps) {
  const [isSaving, setIsSaving] = useState(false);

  //Save without trigger dialog
  const handleSave = async () => {
    setIsSaving(true);
    //Load for 2 seconds to simulate saving
    await new Promise(resolve => setTimeout(resolve, 2000));
    await onHandleSave("Filename");
    setIsSaving(false);
  };

  return (
    //Add save icon
    
    <Button 
      onClick={handleSave}
      disabled={isSaving}
    >
      <Save className='mr-2 h-4 w-4'/>
      {isSaving ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Saving...
      </>
    ) : (
        'Save'
      )}
    </Button>
  );
} 