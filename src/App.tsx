import React, { useState, useRef, useEffect, ChangeEvent } from 'react';
import { X, Play, Plus, Code, CheckCircle, Smartphone, RefreshCw, Database } from 'lucide-react';
import { createStore, Store } from 'tinybase';
import { Persister } from 'tinybase/persisters';
import { createIndexedDbPersister } from 'tinybase/persisters/persister-indexed-db';
// ==================== ТИПИ ====================
interface Task {
  id: string;
  title: string;
  description: string;
  difficulty: 'Легка' | 'Середня' | 'Важка';
  solution: string;
  completed: boolean;
  test_code: string;
  created_at: number;
  updated_at?: number;
}

interface ConsoleOutput {
  type: 'log' | 'error' | 'warn';
  content: string;
}

interface NewTaskForm {
  title: string;
  description: string;
  difficulty: 'Легка' | 'Середня' | 'Важка';
  test_code: string;
}

// ==================== КОНСТАНТИ ====================
const initialTasks: Record<string, Omit<Task, 'id'>> = {
  '1': {
    title: "Сума двох чисел",
    description: "Напишіть функцію sum(a, b), яка повертає суму двох чисел",
    difficulty: "Легка",
    solution: "",
    completed: false,
    test_code: "console.log(sum(5, 3)); // 8\nconsole.log(sum(-2, 7)); // 5",
    created_at: Date.now()
  },
  '2': {
    title: "Перевернути рядок",
    description: "Напишіть функцію reverseString(str), яка перевертає рядок",
    difficulty: "Легка",
    solution: "",
    completed: false,
    test_code: "console.log(reverseString('hello')); // 'olleh'\nconsole.log(reverseString('JavaScript')); // 'tpircSavaJ'",
    created_at: Date.now()
  },
  '3': {
    title: "Факторіал числа",
    description: "Напишіть функцію factorial(n), яка обчислює факторіал числа",
    difficulty: "Середня",
    solution: "",
    completed: false,
    test_code: "console.log(factorial(5)); // 120\nconsole.log(factorial(0)); // 1",
    created_at: Date.now()
  }
};

// ==================== КОМПОНЕНТ: SimpleEditor ====================
interface SimpleEditorProps {
  value: string;
  onChange: (value: string) => void;
  onRun: () => void;
}

const SimpleEditor: React.FC<SimpleEditorProps> = ({ value, onChange, onRun }) => {
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
        style={{ tabSize: 2 } as React.CSSProperties}
      />
    </div>
  );
};

// ==================== КОМПОНЕНТ: MonacoEditor ====================
interface MonacoEditorProps {
  value: string;
  onChange: (value: string) => void;
  onRun: () => void;
}

const MonacoEditor: React.FC<MonacoEditorProps> = ({ value, onChange, onRun }) => {
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

// ==================== КОМПОНЕНТ: Console ====================
interface ConsoleProps {
  output: ConsoleOutput[];
}

const Console: React.FC<ConsoleProps> = ({ output }) => {
  return (
    <div className="flex flex-col h-full">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">Консоль</h3>
      <div className="flex-1 bg-gray-900 text-green-400 p-3 md:p-4 rounded-lg overflow-auto font-mono text-xs md:text-sm">
        {output.length === 0 ? (
          <div className="text-gray-500">Натисніть "Виконати" щоб запустити код...</div>
        ) : (
          output.map((item, index) => (
            <div
              key={index}
              className={`mb-2 break-words ${
                item.type === 'error' ? 'text-red-400' :
                item.type === 'warn' ? 'text-yellow-400' :
                'text-green-400'
              }`}
            >
              {item.content}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// ==================== КОМПОНЕНТ: TaskCard ====================
interface TaskCardProps {
  task: Task;
  onOpen: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onOpen, onDelete }) => {
  const getDifficultyColor = (difficulty: Task['difficulty']): string => {
    switch (difficulty) {
      case 'Легка': return 'bg-green-100 text-green-700';
      case 'Середня': return 'bg-yellow-100 text-yellow-700';
      case 'Важка': return 'bg-red-100 text-red-700';
    }
  };

  return (
    <div
      onClick={() => onOpen(task)}
      className="border border-gray-200 rounded-lg p-3 md:p-4 hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer bg-white"
    >
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base md:text-lg font-semibold text-gray-800 break-words">
              {task.title}
            </h3>
            {task.completed && (
              <CheckCircle className="text-green-500 flex-shrink-0" size={18} />
            )}
            <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${getDifficultyColor(task.difficulty)}`}>
              {task.difficulty}
            </span>
          </div>
          <p className="text-sm md:text-base text-gray-600 mt-2 break-words">
            {task.description}
          </p>
        </div>
        <button
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            onDelete(task.id);
          }}
          className="text-red-500 hover:text-red-700 flex-shrink-0"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
};

// ==================== КОМПОНЕНТ: TaskModal ====================
interface TaskModalProps {
  task: Task | null;
  code: string;
  setCode: (code: string) => void;
  consoleOutput: ConsoleOutput[];
  onClose: () => void;
  onSave: () => void;
  onRun: () => void;
  isMobile: boolean;
  syncing: boolean;
}

const TaskModal: React.FC<TaskModalProps> = ({ 
  task, 
  code, 
  setCode, 
  consoleOutput, 
  onClose, 
  onSave, 
  onRun, 
  isMobile, 
  syncing 
}) => {
  if (!task) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 md:p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[95vh] md:h-[90vh] flex flex-col">
        <div className="flex justify-between items-start p-4 md:p-6 border-b">
          <div className="flex-1 min-w-0 pr-2">
            <h2 className="text-lg md:text-2xl font-bold text-gray-800 break-words">
              {task.title}
            </h2>
            <p className="text-sm md:text-base text-gray-600 mt-1 break-words">
              {task.description}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 flex-shrink-0">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 p-3 md:p-6 overflow-hidden flex flex-col gap-3 md:gap-4">
          <div className={isMobile ? 'h-2/5' : 'h-1/2'}>
            {isMobile ? (
              <SimpleEditor value={code} onChange={setCode} onRun={onRun} />
            ) : (
              <MonacoEditor value={code} onChange={setCode} onRun={onRun} />
            )}
          </div>

          <div className={isMobile ? 'h-3/5' : 'h-1/2'}>
            <Console output={consoleOutput} />
          </div>
        </div>

        <div className="p-3 md:p-6 border-t flex justify-end gap-2 md:gap-3">
          <button
            onClick={onClose}
            className="px-4 md:px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm md:text-base"
          >
            Закрити
          </button>
          <button
            onClick={onSave}
            disabled={syncing}
            className="px-4 md:px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm md:text-base disabled:opacity-50 flex items-center gap-2"
          >
            {syncing && <RefreshCw size={16} className="animate-spin" />}
            Зберегти
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== КОМПОНЕНТ: AddTaskModal ====================
interface AddTaskModalProps {
  show: boolean;
  newTask: NewTaskForm;
  setNewTask: (task: NewTaskForm) => void;
  onClose: () => void;
  onAdd: () => void;
  syncing: boolean;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({ 
  show, 
  newTask, 
  setNewTask, 
  onClose, 
  onAdd, 
  syncing 
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 md:p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 md:p-6 border-b sticky top-0 bg-white">
          <h2 className="text-lg md:text-2xl font-bold text-gray-800">Додати нову задачу</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="p-4 md:p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Назва задачі</label>
            <input
              type="text"
              value={newTask.title}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setNewTask({ ...newTask, title: e.target.value })}
              className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm md:text-base"
              placeholder="Наприклад: Знайти максимальне число"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Опис</label>
            <textarea
              value={newTask.description}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setNewTask({ ...newTask, description: e.target.value })}
              className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm md:text-base"
              rows={3}
              placeholder="Опишіть завдання..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Складність</label>
            <select
              value={newTask.difficulty}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setNewTask({ ...newTask, difficulty: e.target.value as Task['difficulty'] })}
              className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm md:text-base"
            >
              <option>Легка</option>
              <option>Середня</option>
              <option>Важка</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Тестовий код</label>
            <textarea
              value={newTask.test_code}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setNewTask({ ...newTask, test_code: e.target.value })}
              className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-xs md:text-sm"
              rows={4}
              placeholder="console.log(yourFunction(5));"
            />
          </div>
        </div>

        <div className="p-4 md:p-6 border-t flex justify-end gap-2 md:gap-3 sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            className="px-4 md:px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm md:text-base"
          >
            Скасувати
          </button>
          <button
            onClick={onAdd}
            disabled={syncing}
            className="px-4 md:px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm md:text-base disabled:opacity-50 flex items-center gap-2"
          >
            {syncing && <RefreshCw size={16} className="animate-spin" />}
            Додати
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== КОМПОНЕНТ: Header ====================
interface HeaderProps {
  isMobile: boolean;
  syncing: boolean;
  onSync: () => void;
  onExport: () => void;
  onImport: (event: ChangeEvent<HTMLInputElement>) => void;
  onAddTask: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
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
          <input type="file" accept=".json" onChange={onImport} className="hidden" />
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
  );
};

// ==================== КОМПОНЕНТ: LoadingScreen ====================
const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <Database className="animate-pulse mx-auto mb-4 text-indigo-600" size={48} />
        <p className="text-gray-600">Завантаження задач з TinyBase...</p>
      </div>
    </div>
  );
};

// ==================== ГОЛОВНИЙ КОМПОНЕНТ: App ====================
const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [code, setCode] = useState<string>('');
  const [consoleOutput, setConsoleOutput] = useState<ConsoleOutput[]>([]);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);
  const storeRef = useRef<Store | null>(null);
  const persisterRef = useRef<Persister | null>(null);
  const [newTask, setNewTask] = useState<NewTaskForm>({
    title: '',
    description: '',
    difficulty: 'Легка',
    test_code: ''
  });

  // Ініціалізація TinyBase
  useEffect(() => {
    const initTinyBase = async (): Promise<void> => {
      try {
        setLoading(true);
        
        const store = createStore();
        storeRef.current = store;

        const persister = createIndexedDbPersister(store, 'js-coding-tasks');
        persisterRef.current = persister;

        await persister.load();

        const existingTasks = store.getTable('tasks');
        if (!existingTasks || Object.keys(existingTasks).length === 0) {
          store.setTable('tasks', initialTasks);
          await persister.save();
        }

        await persister.startAutoSave();

        store.addTableListener('tasks', () => {
          updateTasksList();
        });

        updateTasksList();
        setLoading(false);
      } catch (error) {
        console.error('Помилка ініціалізації TinyBase:', error);
        setLoading(false);
      }
    };

    initTinyBase();

    return () => {
      if (persisterRef.current) {
        persisterRef.current.stopAutoSave();
      }
    };
  }, []);

  const updateTasksList = (): void => {
    if (storeRef.current) {
      const tasksTable = storeRef.current.getTable('tasks');
      const tasksArray: Task[] = Object.entries(tasksTable).map(([id, task]) => ({
        id,
        ...(task as Omit<Task, 'id'>)
      })).sort((a, b) => a.created_at - b.created_at);
      setTasks(tasksArray);
    }
  };

  useEffect(() => {
    const checkMobile = (): void => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const openTask = (task: Task): void => {
    setSelectedTask(task);
    setCode(task.solution || '');
    setConsoleOutput([]);
  };

  const closeModal = (): void => {
    setSelectedTask(null);
    setCode('');
    setConsoleOutput([]);
  };

  const runCode = (): void => {
    if (!selectedTask) return;

    setConsoleOutput([]);
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    const outputs: ConsoleOutput[] = [];

    console.log = (...args: any[]): void => {
      outputs.push({ 
        type: 'log', 
        content: args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ') 
      });
    };

    console.error = (...args: any[]): void => {
      outputs.push({ type: 'error', content: args.join(' ') });
    };

    console.warn = (...args: any[]): void => {
      outputs.push({ type: 'warn', content: args.join(' ') });
    };

    try {
      const fullCode = `${code}\n\n${selectedTask.test_code}`;
      eval(fullCode);
    } catch (error) {
      outputs.push({ type: 'error', content: String(error) });
    }

    console.log = originalLog;
    console.error = originalError;
    console.warn = originalWarn;

    setConsoleOutput(outputs);
  };

  const saveTask = async (): Promise<void> => {
    if (!selectedTask) return;

    try {
      setSyncing(true);
      
      if (storeRef.current) {
        storeRef.current.setRow('tasks', selectedTask.id, {
          ...selectedTask,
          solution: code,
          completed: true,
          updated_at: Date.now()
        });

        setSelectedTask(prev => prev ? { ...prev, solution: code, completed: true } : null);
      }

      alert('✅ Задачу збережено локально!');
    } catch (error) {
      console.error('Помилка збереження:', error);
      alert('❌ Помилка збереження задачі');
    } finally {
      setSyncing(false);
    }
  };

  const addNewTask = async (): Promise<void> => {
    try {
      setSyncing(true);
      
      if (storeRef.current) {
        const newId = String(Date.now());
        const newTaskData: Omit<Task, 'id'> = {
          title: newTask.title,
          description: newTask.description,
          difficulty: newTask.difficulty,
          test_code: newTask.test_code,
          solution: '',
          completed: false,
          created_at: Date.now()
        };

        storeRef.current.setRow('tasks', newId, newTaskData);

        setShowAddModal(false);
        setNewTask({ title: '', description: '', difficulty: 'Легка', test_code: '' });
      }
    } catch (error) {
      console.error('Помилка додавання задачі:', error);
      alert('❌ Помилка додавання задачі');
    } finally {
      setSyncing(false);
    }
  };

  const deleteTask = async (taskId: string): Promise<void> => {
    if (!confirm('Ви впевнені, що хочете видалити цю задачу?')) return;

    try {
      setSyncing(true);
      
      if (storeRef.current) {
        storeRef.current.delRow('tasks', taskId);
      }
    } catch (error) {
      console.error('Помилка видалення:', error);
      alert('❌ Помилка видалення задачі');
    } finally {
      setSyncing(false);
    }
  };

  const syncTasks = async (): Promise<void> => {
    setSyncing(true);
    if (persisterRef.current) {
      await persisterRef.current.save();
    }
    updateTasksList();
    setSyncing(false);
  };

  const exportData = (): void => {
    if (storeRef.current) {
      const data = storeRef.current.getContent();
      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'coding-tasks-backup.json';
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const importData = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e: ProgressEvent<FileReader>) => {
      try {
        const result = e.target?.result;
        if (typeof result === 'string') {
          const data = JSON.parse(result);
          if (storeRef.current && data.tasks) {
            storeRef.current.setContent(data);
            await persisterRef.current?.save();
            alert('✅ Дані успішно імпортовано!');
          }
        }
      } catch (error) {
        console.error('Помилка імпорту:', error);
        alert('❌ Помилка імпорту даних');
      }
    };
    reader.readAsText(file);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-3 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 mb-4 md:mb-6">
          <Header
            isMobile={isMobile}
            syncing={syncing}
            onSync={syncTasks}
            onExport={exportData}
            onImport={importData}
            onAddTask={() => setShowAddModal(true)}
          />

          <div className="grid gap-3 md:gap-4">
            {tasks.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Database size={48} className="mx-auto mb-4 opacity-50" />
                <p>Немає задач. Додайте нову задачу!</p>
              </div>
            ) : (
              tasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onOpen={openTask}
                  onDelete={deleteTask}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <TaskModal
        task={selectedTask}
        code={code}
        setCode={setCode}
        consoleOutput={consoleOutput}
        onClose={closeModal}
        onSave={saveTask}
        onRun={runCode}
        isMobile={isMobile}
        syncing={syncing}
      />

      <AddTaskModal
        show={showAddModal}
        newTask={newTask}
        setNewTask={setNewTask}
        onClose={() => setShowAddModal(false)}
        onAdd={addNewTask}
        syncing={syncing}
      />
    </div>
  );
};

export default App;
