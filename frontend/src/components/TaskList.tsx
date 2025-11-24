import { useActionState, useEffect, useState } from "react";

type Task = {
  id: number;
  description: string;
  created_at: string;
  updated_at: string;
}

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

const newTask = async (previousState: Task[], formData: FormData) => {
  const description = formData.get("description");

  try {
    const task = await createTask(description?.toString() as string);

    return [task, ...previousState];
  } catch (error) {
    // setError((error as Error).message);
  }

  return previousState;
}

export default function TaskList() {
  const [state, formAction, isPending] = useActionState(newTask, []);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const load = async () => {
      try {
        const tasks = await fetchTasks();
        setTasks(tasks);
      } catch (error) {
        setError((error as Error).message);
      }
    };

    load();
  }, []);

  if (error) {
    return <p>{error}</p>
  }

  if (isPending) {
    return <p>Loading...</p>
  }

  const mergedTasks = [...state, ...tasks];

  const mappedTasks = mergedTasks.map(t => (
    <li key={t.id}>
      <p>{t.description}</p>
      <div>
        <p>Create at: {new Date(t.created_at).toDateString()}</p>
        <p>Updated at: {new Date(t.updated_at).toDateString()}</p>
      </div>
    </li>
  ))

  return (
    <div>
      <form action={formAction}>
        <input type="text" name="description" id="description" placeholder="Type here..." />
        <button type="submit">Add Task</button>
      </form>
      <ul>{mappedTasks}</ul>
    </div>
  );
}
