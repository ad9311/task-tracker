import { useActionState, useEffect, useState } from "react";

type Task = {
  id: number;
  description: string;
  created_at: string;
  updated_at: string;
}

type InitState = {
  tasks: Task[];
  error?: string;
}

const initialState: InitState = {
  tasks: [],
};

const fetchTasks = async(): Promise<Task[]> => {
  const res = await fetch('http://127.0.0.1:3000/tasks');
  if (res.ok) {
    const json = await res.json();

    return json as Task[];
  }

  throw new Error("failed to fetch tasks");
}

const createTask = async (description: string): Promise<Task> => {
  const res = await fetch('http://127.0.0.1:3000/tasks', {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
    "task": {
        "description": description
    },
}),
  })
  if (res.ok) {
    return await res.json() as Task;
  }

  throw new Error("failed to fetch tasks");
}

const newTask = async (previousState: InitState, formData: FormData): Promise<InitState> => {
  const description = formData.get("description");

  try {
    const task = await createTask(description?.toString() as string);

    return {
      tasks: [task, ...previousState.tasks],
    };
  } catch (error) {
    return {
      tasks: previousState.tasks,
      error: (error as Error).message,
    };
  }
}

export default function TaskList() {
  const [state, formAction, isPending] = useActionState(newTask, initialState);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const tasks = await fetchTasks();
        setTasks(tasks);
      } catch (error) {
        setError((error as Error).message);
      }
      setIsLoading(false);
    };

    load();
  }, []);

  if (isPending || isLoading) {
    return <p className="loading-message">Loading...</p>
  }

  const mergedTasks = [...state.tasks, ...tasks];

  const mappedTasks = mergedTasks.map(t => (
    <li key={t.id} data-testid="task-item">
      <div className="inner-div">
        <p>{t.description}</p>
        <div className="dates">
          <p>Created at: {new Date(t.created_at).toDateString()}</p>
          <p>Updated at: {new Date(t.updated_at).toDateString()}</p>
        </div>
      </div>
    </li>
  ))

  return (
    <div data-testid="task-list-container">
      <form action={formAction} data-testid="task-form">
        <input type="text" name="description" id="description" placeholder="Type here..." data-testid="task-input" />
        <br />
        <button type="submit" data-testid="task-submit">Add Task</button>
      </form>
      { error || state.error ? <p className="error-message" data-testid="task-error">{(error || state.error) }</p>: ''}
      <ul data-testid="task-list">{mappedTasks}</ul>
    </div>
  );
}
