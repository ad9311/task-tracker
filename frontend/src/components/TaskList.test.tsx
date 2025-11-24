import { describe, expect, it, vi, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TaskList from "./TaskList";

const mockTask = (overrides?: Partial<{ id: number; description: string; created_at: string; updated_at: string; }>) => ({
  id: 1,
  description: "Buy milk",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
  ...overrides,
});

const mockFetch = (responses: Array<{ ok: boolean; json?: () => Promise<unknown> }>) => {
  const fetchSpy = vi.fn();
  responses.forEach((response) => {
    fetchSpy.mockResolvedValueOnce({
      ok: response.ok,
      json: response.json,
    });
  });
  vi.stubGlobal("fetch", fetchSpy);
  return fetchSpy;
};

describe("TaskList", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("loads tasks on mount and renders them", async () => {
    const task = mockTask();
    const fetchSpy = mockFetch([
      {
        ok: true,
        json: () => Promise.resolve([task]),
      },
    ]);

    render(<TaskList />);

    expect(fetchSpy).toHaveBeenCalledWith("http://127.0.0.1:3000/tasks");
    expect(await screen.findByTestId("task-list")).toBeInTheDocument();
    expect(await screen.findAllByTestId("task-item")).toHaveLength(1);
    expect(screen.getByText(task.description)).toBeInTheDocument();
  });

  it("creates a new task and shows it at the top", async () => {
    const existingTask = mockTask({ id: 1, description: "Existing" });
    const newTask = mockTask({ id: 2, description: "New" });
    const fetchSpy = mockFetch([
      {
        ok: true,
        json: () => Promise.resolve([existingTask]),
      },
      {
        ok: true,
        json: () => Promise.resolve(newTask),
      },
    ]);

    render(<TaskList />);
    expect(await screen.findByText("Existing")).toBeInTheDocument();

    await userEvent.type(screen.getByTestId("task-input"), "New");
    await userEvent.click(screen.getByTestId("task-submit"));

    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(2));
    const items = await screen.findAllByTestId("task-item");
    expect(items[0]).toHaveTextContent("New");
    expect(items[1]).toHaveTextContent("Existing");
  });

  it("shows an error message when loading tasks fails", async () => {
    mockFetch([{ ok: false }]);

    render(<TaskList />);

    expect(await screen.findByTestId("task-error")).toHaveTextContent("failed to fetch tasks");
  });

  it("shows an error message when creating a task fails", async () => {
    mockFetch([
      { ok: true, json: () => Promise.resolve([]) },
      { ok: false },
    ]);

    render(<TaskList />);

    await userEvent.type(screen.getByTestId("task-input"), "Bad task");
    await userEvent.click(screen.getByTestId("task-submit"));

    expect(await screen.findByTestId("task-error")).toHaveTextContent("failed to fetch tasks");
  });
});
