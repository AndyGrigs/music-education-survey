import { Task } from '../types';

export const initialTasks: Record<string, Omit<Task, 'id'>> = {
  '1': {
    title: "Сума двох чисел",
    description: "Напишіть функцію sum(a, b), яка повертає суму двох чисел",
    difficulty: "Легко",
    solution: "",
    completed: false,
    test_code: "console.log(sum(5, 3)); // 8\nconsole.log(sum(-2, 7)); // 5",
    created_at: Date.now()
  },
  '2': {
    title: "Перевернути рядок",
    description: "Напишіть функцію reverseString(str), яка перевертає рядок",
    difficulty: "Легко",
    solution: "",
    completed: false,
    test_code: "console.log(reverseString('hello')); // 'olleh'\nconsole.log(reverseString('JavaScript')); // 'tpircSavaJ'",
    created_at: Date.now()
  },
  '3': {
    title: "Факторіал числа",
    description: "Напишіть функцію factorial(n), яка обчислює факторіал числа",
    difficulty: "Середньо",
    solution: "",
    completed: false,
    test_code: "console.log(factorial(5)); // 120\nconsole.log(factorial(0)); // 1",
    created_at: Date.now()
  }
};