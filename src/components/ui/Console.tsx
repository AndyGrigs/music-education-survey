import React from 'react';
import { ConsoleOutput } from '../../types';

interface ConsoleProps {
    output: ConsoleOutput[];
}
const Console: React.FC<ConsoleProps> = ({ output }) => {
    return (
        <div className="flex flex-col h-full">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Console</h3>
            <div className="flex-1 bg-gray-900 text-green-400 p-3 md:p-4 rounded-lg overflow-auto font-mono text-xs md:text-sm">
                {output.length === 0 ? (
                    <div className="text-gray-500 min-h-20">Press to run the code...</div>
                ) : (
                    output.map((item, index) => (
                        <div
                            
                            key={index}
                            className={`mb-2 wrap-break-words ${
                                item.type === 'error'
                                    ? 'text-red-400'
                                    : item.type === 'warn'
                                      ? 'text-amber-200'
                                      : 'text-green-500'
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
export default Console;
