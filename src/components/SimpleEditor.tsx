import React, { ChangeEvent } from 'react';
import { Play } from 'lucide-react';

interface SimpleEditorProps {
  value: string;
  onChange: (value: string) => void;
  onRun: () => void;
}

export const SimpleEditor: React.FC<SimpleEditorProps> = ({ value, onChange, onRun }) => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-semibold text-gray-700">Редактор коду</h3>
        <button 
          onClick={onRun} 
          className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
        >
          <Play size={16} />
          Виконати
        </button>
      </div>
      <textarea
        value={value}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
        className="flex-1 w-full p-3 border border-gray-300 rounded-lg font-mono text-sm bg-gray-900 text-green-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
        placeholder="// Пишіть ваш код тут..."
        spellCheck={false}
        style={{ tabSize: 2, WebkitTabSize: 2, MozTabSize: 2 }}
      />
    </div>
  );
};
