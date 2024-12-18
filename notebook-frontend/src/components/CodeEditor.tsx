'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Ansi from "ansi-to-react";
import { Loader2 } from 'lucide-react';

const MonacoEditor = dynamic(
  () => import('@monaco-editor/react'),
  { ssr: false }
);

interface CodeEditorProps {
  code: string;
  output?: string;
  executionCount: number;
  onCodeChange: (code: string) => void;
}

export function CodeEditor({ 
  code, 
  output, 
  executionCount, 
  onCodeChange 
}: CodeEditorProps) {
  const [isEditorReady, setIsEditorReady] = useState(false);

  const calculateEditorHeight = (value: string) => {
    const lineCount = value.split("\n").length;
    const baseHeight = 200;
    const lineHeight = 20;
    return Math.max(baseHeight, Math.min(lineCount * lineHeight, 500));
  };

  return (
    <div className="w-full">
      <div className="rounded-md border">
        {!isEditorReady && (
          <div className="h-[200px] flex items-center justify-center bg-muted">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}
        <MonacoEditor
          height={calculateEditorHeight(code)}
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

      {output && (
        <div className="mt-4">
          <div className="text-sm text-muted-foreground">
            {executionCount > 0 ? `Out [${executionCount}]:` : 'Out [ ]'}
          </div>
          <pre className="mt-2 rounded-md bg-muted p-4 font-mono text-sm whitespace-pre-wrap overflow-x-auto">
            <Ansi>{output}</Ansi>
          </pre>
        </div>
      )}
    </div>
  );
}

export default CodeEditor;