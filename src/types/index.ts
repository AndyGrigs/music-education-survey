export interface Task {
    id: string;
    title: string;
    description: string;
    difficulty: "Легко" | "Середньо" | "Важко";
    solution: string;
    completed: boolean;
    test_code: string;
    created_at: number;
    updated_at?: number; 
}

export interface ConsoleOutput{
    type: "log" | "error" | "warn";
    content: string;
}
export interface NewTaskForm {
    title: string;
    description: string;
    difficulty: "Легко" | "Середньо" | "Важко";
    test_code: string;
}