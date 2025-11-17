import React, { ChangeEvent } from 'react';
import { Code, Database, Smartphone, RefreshCw, Plus } from 'lucide-react';

interface HeaderProps {
  isMobile: boolean;
  syncing: boolean;
  onSync: () => void;
  onExport: () => void;
  onImport: (event: ChangeEvent<HTMLInputElement>) => void;
  onAddTask: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  isMobile, 
  syncing, 
  onSync, 
  onExport, 
  onImport, 
  onAddTask 
}) => {
  return (
    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4 md:mb-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2 md:gap-3">
          <Code className="text-indigo-600" size={isMobile ? 28 : 36} />
          JS Coding Tasks
        </h1>
        <p className="text-sm md:text-base text-gray-600 mt-1 flex items-center gap-2">
          <Database size={14} className="text-green-600" />
          Локальне збереження (TinyBase + IndexedDB)
        </p>
        {isMobile && (
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-2 text-xs text-indigo-600">
              <Smartphone size={14} />
              <span>Мобільна версія</span>
            </div>
          </div>
        )}  
      </div>

      <div className="flex gap-2 flex-wrap">
         <button
          onClick={onSync}
          disabled={syncing}
          className="flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm disabled:opacity-50"
        >
          <RefreshCw size={18} className={syncing ? 'animate-spin' : ''} />
          Синхронізувати
        </button>
        
        <button
          onClick={onExport}
          className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          Експорт
        </button>

        <label className="flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm cursor-pointer">
          Імпорт
          <input 
            type="file" 
            accept=".json" 
            onChange={onImport} 
            className="hidden" 
          />
        </label>
        
        <button
          onClick={onAddTask}
          className="flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
        >
          <Plus size={18} />
          Додати
        </button>
      </div>
      
    </div>
    
  )
};
