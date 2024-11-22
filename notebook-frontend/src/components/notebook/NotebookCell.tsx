// components/NotebookCell.tsx
'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Loader2, ChevronUp, ChevronDown, Trash2 } from 'lucide-react';
import Ansi from "ansi-to-react";
// Dynamic import of Monaco editor to avoid SSR issues
const MonacoEditor = dynamic(
  () => import('@monaco-editor/react'),
  { ssr: false }
);

interface NotebookCellProps {
  id: string;
  code: string;
  output: string;
  executionCount: number;
  isExecuting: boolean;
  onCodeChange: (code: string) => void;
  onExecute: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export function NotebookCell({
  id,
  code,
  output,
  executionCount,
  isExecuting,
  onCodeChange,
  onExecute,
  onDelete,
  onMoveUp,
  onMoveDown
}: NotebookCellProps) {
  const [isEditorReady, setIsEditorReady] = useState(false);

  const calculateEditorHeight = (value: string) => {
    const lineCount = value.split("\n").length;
    const baseHeight = 200;
    const lineHeight = 20;
    return Math.max(baseHeight, Math.min(lineCount * lineHeight, 500)); // cap at 500px
  }

  return (
    <Card className="group min-h-[25vh] max-h-[75vh] h-auto overflow-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sticky top-0 z-50 bg-background py-2 border-b">
        <div className="flex flex-row items-center space-x-2 ">
          <Button
            size="sm"
            onClick={onExecute}
            disabled={isExecuting}
            className="flex items-center"
            variant="default"
          >
            {isExecuting ? (
              <div className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running...
              </div>
            ) : (
              'Run'
            )}
          </Button>
          
          <div className="flex flex-row items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="default"
              onClick={onMoveUp}
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="default"
              onClick={onMoveDown}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="default"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="text-sm text-muted-foreground">
          {executionCount > 0 ? `In [${executionCount}]` : 'In [ ]'}
        </div>
      </CardHeader>
      
      <CardContent >
        <div className="rounded-md border h-full">
          {!isEditorReady && (
            <div className="h-[200px] flex items-center justify-center bg-muted">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}
          <MonacoEditor
            height={ calculateEditorHeight(code) }
            language="python"
            value={code}
            onChange={(value) => onCodeChange(value || '')}
            onMount={() => setIsEditorReady(true)}
            options={{
              minimap: { enabled: false },
              lineNumbers: 'on',
              wordWrap: 'on',
              tabSize: 4,
              insertSpaces: true,
              fontSize: 14,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              acceptSuggestionOnEnter: 'on',
              tabCompletion: 'on',
            }}
          />
        </div>
        
        {output && id && (
          <div className="mt-4">
            <div className="text-sm text-muted-foreground">
              {executionCount > 0 ? `Out [${executionCount}]:` : 'Out [ ]'}
            </div>
            <pre className="mt-2 rounded-md bg-muted p-4 font-mono text-sm whitespace-pre-wrap overflow-x-auto">
              <Ansi>{output}</Ansi>
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}