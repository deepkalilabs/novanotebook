import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Layers3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import dynamic from 'next/dynamic';
import { NotebookCell } from '@/app/types';
import { useState } from 'react';
const MonacoEditor = dynamic(
    () => import('@monaco-editor/react'),
    { ssr: false }
);
  
interface ShowCodeButtonProps {
    allCells: NotebookCell[];
}

export function ShowCodeButton({ allCells }: ShowCodeButtonProps) {
    const [allCode, setAllCode] = useState('');
    const [isCodeDialogOpen, setIsCodeDialogOpen] = useState(false);

    const showAllCode = () => {
        const code = allCells.map((cell) => cell.code).join('\n');
        setAllCode(code);
        setIsCodeDialogOpen(true);
    };
  
    return (
        <Dialog open={isCodeDialogOpen} onOpenChange={setIsCodeDialogOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className="justify-end gap-2"
                    onClick={() => showAllCode()}
                    disabled={allCells.length === 0}
                >
                    <Layers3 className="h-4 w-4" />
                    Show All Code
                </Button>
            </DialogTrigger>
            <DialogContent className="w-3/4 h-3/4 max-w-[90vw]">
                <DialogHeader>
                    <DialogTitle>All Code View</DialogTitle>
                    <DialogDescription>
                        View all code from your notebook cells combined
                    </DialogDescription>
                </DialogHeader>
                <div className="flex-1 min-h-[60vh]">
                <MonacoEditor
                    value={allCode}
                    language="python"
                    options={{ 
                        readOnly: true,
                        minimap: { enabled: false },
                        lineNumbers: 'on',
                        wordWrap: 'on',
                        tabSize: 4,
                        insertSpaces: true,
                        fontSize: 14,
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                    }}
                    height="60vh"
                />
            </div>
        </DialogContent>
    </Dialog>
  )
}