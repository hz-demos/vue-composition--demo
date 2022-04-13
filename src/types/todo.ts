export type Todo = {
  id?: number;
  title: string;
  completed: boolean;
};

export type Todos = Todo[];

export type FilterStatus = "all" | "active" | "completed";
