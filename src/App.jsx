
import { createClient } from '@supabase/supabase-js';
import './App.css';

const supabaseUrl = import.meta.env.VITE_API_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_API_SUPABASE_ANON;
const supabase = createClient(supabaseUrl, supabaseKey);

import React, { useState, useRef, useEffect } from 'react';
import { X, Play, Plus, Code, CheckCircle, Smartphone } from 'lucide-react';

// Початкові задачі
const initialTasks = [
  {
    id: 1,
    title: "Сума двох чисел",
    description: "Напишіть функцію sum(a, b), яка повертає суму двох чисел",
    difficulty: "Легка",
    solution: "",
    completed: false,
    testCode: "console.log(sum(5, 3)); // 8\nconsole.log(sum(-2, 7)); // 5"
  },
  {
    id: 2,
    title: "Перевернути рядок",
    description: "Напишіть функцію reverseString(str), яка перевертає рядок",
    difficulty: "Легка",
    solution: "",
    completed: false,
    testCode: "console.log(reverseString('hello')); // 'olleh'\nconsole.log(reverseString('JavaScript')); // 'tpircSavaJ'"
  },
  {
    id: 3,
    title: "Факторіал числа",
    description: "Напишіть функцію factorial(n), яка обчислює факторіал числа",
    difficulty: "Середня",
    solution: "",
    completed: false,
    testCode: "console.log(factorial(5)); // 120\nconsole.log(factorial(0)); // 1"
  }
];

// CodeMirror редактор для мобільних
const CodeMirrorEditor = ({ value, onChange, onRun }) => {
  const editorRef = useRef(null);
  const viewRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadCodeMirror = async () => {
      try {
        // Завантажуємо CodeMirror через CDN
        if (!window.CodeMirror6Loaded) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/6.0.1/codemirror.min.js';
            script.type = 'module';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });

          // Завантажуємо додаткові модулі
          const modules = [
            'https://cdnjs.cloudflare.com/ajax/libs/codemirror/6.0.1/lang-javascript.min.js',
            'https://cdnjs.cloudflare.com/ajax/libs/codemirror/6.0.1/theme-one-dark.min.js'
          ];

          await Promise.all(modules.map(src => 
            new Promise((resolve, reject) => {
              const script = document.createElement('script');
              script.src = src;
              script.type = 'module';
              script.onload = resolve;
              script.onerror = reject;
              document.head.appendChild(script);
            })
          ));

          window.CodeMirror6Loaded = true;
        }

        if (mounted && editorRef.current && !viewRef.current) {
          // Імпортуємо необхідні модулі динамічно
          const { EditorView, basicSetup } = await import('https://esm.sh/@codemirror/basic-setup@0.20.0');
          const { javascript } = await import('https://esm.sh/@codemirror/lang-javascript@6.0.0');
          const { oneDark } = await import('https://esm.sh/@codemirror/theme-one-dark@6.0.0');
          const { EditorState } = await import('https://esm.sh/@codemirror/state@6.0.0');

          viewRef.current = new EditorView({
            state: EditorState.create({
              doc: value,
              extensions: [
                basicSetup,
                javascript(),
                oneDark,
                EditorView.updateListener.of((update) => {
                  if (update.docChanged) {
                    onChange(update.state.doc.toString());
                  }
                }),
                EditorView.theme({
                  "&": {
                    height: "100%",
                    fontSize: "14px"
                  },
                  ".cm-scroller": {
                    overflow: "auto",
                    fontFamily: "monospace"
                  }
                })
              ]
            }),
            parent: editorRef.current
          });

          setIsLoaded(true);
        }
      } catch (error) {
        console.error('Помилка завантаження CodeMirror:', error);
      }
    };

    loadCodeMirror();

    return () => {
      mounted = false;
      if (viewRef.current) {
        viewRef.current.destroy();
        viewRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (viewRef.current && value !== viewRef.current.state.doc.toString()) {
      viewRef.current.dispatch({
        changes: {
          from: 0,
          to: viewRef.current.state.doc.length,
          insert: value
        }
      });
    }
  }, [value]);

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
      <div 
        ref={editorRef} 
        className="flex-1 border border-gray-300 rounded-lg overflow-hidden bg-gray-900"
        style={{ minHeight: '200px' }}
      >
        {!isLoaded && (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            Завантаження редактора...
          </div>
        )}
      </div>
    </div>
  );
};

// Простий fallback редактор
const SimpleEditor = ({ value, onChange, onRun }) => {
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
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 w-full p-3 border border-gray-300 rounded-lg font-mono text-sm bg-gray-900 text-green-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
        placeholder="// Пишіть ваш код тут..."
        spellCheck={false}
        style={{ 
          tabSize: 2,
          WebkitTabSize: 2,
          MozTabSize: 2
        }}
      />
    </div>
  );
};

// Monaco Editor для десктопу
const MonacoEditor = ({ value, onChange, onRun }) => {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs/loader.min.js';
    script.async = true;
    script.onload = () => {
      window.require.config({ 
        paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs' } 
      });
      
      window.require(['vs/editor/editor.main'], () => {
        if (editorRef.current && !monacoRef.current) {
          monacoRef.current = window.monaco.editor.create(editorRef.current, {
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
      <div ref={editorRef} className="flex-1 border border-gray-300 rounded-lg overflow-hidden" style={{ display: isLoading ? 'none' : 'block' }} />
    </div>
  );
};

function App() {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('codingTasks');
    return saved ? JSON.parse(saved) : initialTasks;
  });
  const [selectedTask, setSelectedTask] = useState(null);
  const [code, setCode] = useState('');
  const [consoleOutput, setConsoleOutput] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [useCodeMirror, setUseCodeMirror] = useState(true);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    difficulty: 'Легка',
    testCode: ''
  });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    localStorage.setItem('codingTasks', JSON.stringify(tasks));
  }, [tasks]);

  const openTask = (task) => {
    setSelectedTask(task);
    setCode(task.solution);
    setConsoleOutput([]);
  };

  const closeModal = () => {
    setSelectedTask(null);
    setCode('');
    setConsoleOutput([]);
  };

  const runCode = () => {
    setConsoleOutput([]);
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    const outputs = [];

    console.log = (...args) => {
      outputs.push({ type: 'log', content: args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ') });
    };

    console.error = (...args) => {
      outputs.push({ type: 'error', content: args.join(' ') });
    };

    console.warn = (...args) => {
      outputs.push({ type: 'warn', content: args.join(' ') });
    };

    try {
      const fullCode = `${code}\n\n${selectedTask.testCode}`;
      eval(fullCode);
    } catch (error) {
      outputs.push({ type: 'error', content: error.toString() });
    }

    console.log = originalLog;
    console.error = originalError;
    console.warn = originalWarn;

    setConsoleOutput(outputs);
  };

  const saveTask = () => {
    const updatedTasks = tasks.map(task =>
      task.id === selectedTask.id
        ? { ...task, solution: code, completed: true }
        : task
    );
    setTasks(updatedTasks);
    alert('Задачу збережено!');
  };

  const addNewTask = () => {
    const newId = Math.max(...tasks.map(t => t.id), 0) + 1;
    const taskToAdd = {
      id: newId,
      ...newTask,
      solution: '',
      completed: false
    };
    setTasks([...tasks, taskToAdd]);
    setShowAddModal(false);
    setNewTask({ title: '', description: '', difficulty: 'Легка', testCode: '' });
  };

  const deleteTask = (taskId) => {
    if (confirm('Ви впевнені, що хочете видалити цю задачу?')) {
      setTasks(tasks.filter(task => task.id !== taskId));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-3 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 mb-4 md:mb-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4 md:mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2 md:gap-3">
                <Code className="text-indigo-600" size={isMobile ? 28 : 36} />
                JS Coding Tasks
              </h1>
              <p className="text-sm md:text-base text-gray-600 mt-1">Практикуйте JavaScript задачі</p>
              {isMobile && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-2 text-xs text-indigo-600">
                    <Smartphone size={14} />
                    <span>Мобільна версія (CodeMirror)</span>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm md:text-base"
            >
              <Plus size={20} />
              Додати задачу
            </button>
          </div>

          <div className="grid gap-3 md:gap-4">
            {tasks.map(task => (
              <div
                key={task.id}
                onClick={() => openTask(task)}
                className="border border-gray-200 rounded-lg p-3 md:p-4 hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer bg-white"
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base md:text-lg font-semibold text-gray-800 break-words">{task.title}</h3>
                      {task.completed && (
                        <CheckCircle className="text-green-500 flex-shrink-0" size={18} />
                      )}
                      <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                        task.difficulty === 'Легка' ? 'bg-green-100 text-green-700' :
                        task.difficulty === 'Середня' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {task.difficulty}
                      </span>
                    </div>
                    <p className="text-sm md:text-base text-gray-600 mt-2 break-words">{task.description}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTask(task.id);
                    }}
                    className="text-red-500 hover:text-red-700 flex-shrink-0"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal для задачі */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 md:p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[95vh] md:h-[90vh] flex flex-col">
            <div className="flex justify-between items-start p-4 md:p-6 border-b">
              <div className="flex-1 min-w-0 pr-2">
                <h2 className="text-lg md:text-2xl font-bold text-gray-800 break-words">{selectedTask.title}</h2>
                <p className="text-sm md:text-base text-gray-600 mt-1 break-words">{selectedTask.description}</p>
              </div>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 flex-shrink-0">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 p-3 md:p-6 overflow-hidden flex flex-col gap-3 md:gap-4">
              <div className={isMobile ? 'h-2/5' : 'h-1/2'}>
                {isMobile ? (
                  useCodeMirror ? (
                    <CodeMirrorEditor
                      value={code}
                      onChange={setCode}
                      onRun={runCode}
                    />
                  ) : (
                    <SimpleEditor
                      value={code}
                      onChange={setCode}
                      onRun={runCode}
                    />
                  )
                ) : (
                  <MonacoEditor
                    value={code}
                    onChange={setCode}
                    onRun={runCode}
                  />
                )}
              </div>

              <div className={isMobile ? 'h-3/5' : 'h-1/2'} style={{ display: 'flex', flexDirection: 'column' }}>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Консоль</h3>
                <div className="flex-1 bg-gray-900 text-green-400 p-3 md:p-4 rounded-lg overflow-auto font-mono text-xs md:text-sm">
                  {consoleOutput.length === 0 ? (
                    <div className="text-gray-500">Натисніть "Виконати" щоб запустити код...</div>
                  ) : (
                    consoleOutput.map((output, index) => (
                      <div
                        key={index}
                        className={`mb-2 break-words ${
                          output.type === 'error' ? 'text-red-400' :
                          output.type === 'warn' ? 'text-yellow-400' :
                          'text-green-400'
                        }`}
                      >
                        {output.content}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="p-3 md:p-6 border-t flex justify-end gap-2 md:gap-3">
              <button
                onClick={closeModal}
                className="px-4 md:px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm md:text-base"
              >
                Закрити
              </button>
              <button
                onClick={saveTask}
                className="px-4 md:px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm md:text-base"
              >
                Зберегти
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal для додавання задачі */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 md:p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 md:p-6 border-b sticky top-0 bg-white">
              <h2 className="text-lg md:text-2xl font-bold text-gray-800">Додати нову задачу</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <div className="p-4 md:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Назва задачі</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm md:text-base"
                  placeholder="Наприклад: Знайти максимальне число"
                />
              </div>

              <div>
       
