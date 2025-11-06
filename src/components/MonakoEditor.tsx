import React, { useRef, useEffect, useState } from 'react';
import { Play } from 'lucide-react';

interface MonacoEditorProps {
  value: string;
  onChange: (value: string) => void;
  onRun: () => void;
}

export const MonacoEditor: React.FC<MonacoEditorProps> = ({ value, onChange, onRun }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const monacoRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs/loader.min.js';
    script.async = true;
    
    script.onload = () => {
      (window as any).require.config({ 
        paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs' } 
      });
      
      (window as any).require(['vs/editor/editor.main'], () => {
        if (editorRef.current && !monacoRef.current) {
          monacoRef.current = (window as any).monaco.editor.create(editorRef.current, {
            value: value,
            language: 'javascript',
            theme: 'vs-dark',
            automaticLayout: true,
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on'
          });

          monacoRef.current.onDidChangeModelContent(() => {
            onChange(monacoRef.current.getValue());
          });
          
          setIsLoading(false);
        }
      });
    };
    
    document.head.appendChild(script);

    return () => {
      if (monacoRef.current) {
        monacoRef.current.dispose();
      }
    };
  }, []);

  useEffect(() => {
    if (monacoRef.current && value !== monacoRef.current.getValue()) {
      monacoRef.current.setValue(value);
    }
  }, [value]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-semibold text-gray-700">Редактор коду</h3>
        <button 
          onClick={onRun} 
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Play size={16} />
          Виконати
        </button>
      </div>
      
      {isLoading && (
        <div className="flex-1 flex items-center justify-center border border-gray-300 rounded-lg bg-gray-50">
          <div className="text-gray-500">Завантаження редактора...</div>
        </div>
      )}
      
      <div 
        ref={editorRef} 
        className="flex-1 border border-gray-300 rounded-lg overflow-hidden" 
        style={{ display: isLoading ? 'none' : 'block' }} 
      />
    </div>
  );
};
