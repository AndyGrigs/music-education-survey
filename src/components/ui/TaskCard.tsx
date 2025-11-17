import React from 'react';
import { X, CheckCircle } from 'lucide-react';
import { Task } from '../../types';

interface TaskCardProps {
  task: Task;
  onOpen: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onOpen, onDelete }) => {
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
