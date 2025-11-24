# Task Tracker
Rails API for tasks plus a Vite/React client.

## Requirements
- Ruby 3.4.5 (see `.ruby-version`)
- Node 20+ with npm
- SQLite 3+
- Bun was used to develop this application, but it is optional

## Clone the repo
```
git clone <your fork url>/task-tracker.git
cd task-tracker
```
Then follow the backend and frontend setup steps below. Run the Rails API first so the React app can reach `http://127.0.0.1:3000`.

## Backend (Rails API)
- Install: `bundle install`
- Set up database: `bin/rails db:setup`
- Run the API: `bin/rails server`
- Tests: `bin/rails test`

### API Endpoints
- `GET /tasks` — returns tasks ordered newest first.
- `POST /tasks` — body `{ "task": { "description": "..." } }`; returns `{"error": [...]}` with `400` if the description is blank.

## Frontend (React + Vite)
- Install deps: `cd frontend && npm install`
- Run dev server: `npm run dev`
- Tests: `npm test`

## How it works
You can view existing tasks and add new ones. Validation lives on the backend: the task description must be present. The frontend handles and displays any errors coming back from the API.

### Fetching tasks
On first render, `TaskList.tsx` loads tasks from the API and shows an error message if the request fails. Tasks are displayed with created/updated timestamps sorted by most recent.

### Creating tasks
Submitting the form sends a POST to the API and prepends the new task to the list. If the request fails (for example, an empty description), the error message from the API is shown inline so the user knows what happened.

## Considerations
- Pagination or infinite scroll if the task list grows large.
