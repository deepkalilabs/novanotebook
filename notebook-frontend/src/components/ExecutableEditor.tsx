import React, { useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { editor } from 'monaco-editor';
import { Monaco } from '@monaco-editor/react';

// Dynamically import Monaco Editor with no SSR and no loading state
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => null
});

interface ExecutableEditorProps {
  code: string;
  onCodeChange: (value: string) => void;
  onExecute: (code: string) => void;
  isExecuting?: boolean;
  height?: string | number;
  language?: string;
}

const ExecutableEditor: React.FC<ExecutableEditorProps> = ({ 
  code, 
  onCodeChange, 
  onExecute,
  isExecuting = false,
  height = "200px",
  language = "python"
}) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const handleEditorMount = useCallback((editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
    editorRef.current = editor;

    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
      () => {
        if (!isExecuting) {
          const selection = editor.getSelection();
          const model = editor.getModel();
          
          if (!model) return;
          
          const selectedText = selection && !selection.isEmpty() 
            ? model.getValueInRange(selection)
            : editor.getValue();

          onExecute(selectedText);
        }
      }
    );

    if (isExecuting) {
      editor.updateOptions({ readOnly: true });
    } else {
      editor.updateOptions({ readOnly: false });
    }
  }, [isExecuting, onExecute]);

  const editorOptions = {
    minimap: { enabled: false },
    lineNumbers: 'on' as const,
    wordWrap: 'on' as const,
    tabSize: 4,
    insertSpaces: true,
    fontSize: 14,
    scrollBeyondLastLine: false,
    automaticLayout: true,
    suggestOnTriggerCharacters: true,
    acceptSuggestionOnEnter: 'on' as const,
    tabCompletion: 'on' as const,
    scrollbar: {
      verticalScrollbarSize: 10,
      verticalSliderSize: 10
    }
  };

  return (
    <div className="w-full border rounded-lg overflow-hidden relative">
      <MonacoEditor
        height={height}
        language={language}
        value={code}
        onChange={(value: string | undefined) => onCodeChange(value || '')}
        onMount={handleEditorMount}
        options={editorOptions}
        loading={null}
      />
      {isExecuting && (
        <div className="absolute top-0 right-0 m-2 px-2 py-1 bg-blue-500 text-white text-sm rounded">
          Executing...
        </div>
      )}
    </div>
  );
};

export default ExecutableEditor;