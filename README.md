# Study Task Tracker

A small vanilla HTML/CSS/JavaScript app for tracking study tasks by course, built for ITIS 5010 Assignment 8.

## Features

- Add a task with a required title and course name.
- Mark a task complete or incomplete.
- Delete a task.
- Tasks persist across page reloads via `localStorage`.
- Live counts of remaining and completed tasks.

## Running it

No build step or server required — open [index.html](index.html) directly in a browser.

## Design decisions

- **Plain three-file structure** (`index.html` / `style.css` / `script.js`), no framework or build tooling, to keep the implementation easy to read top-to-bottom and easy to defend line-by-line.
- **Single source of truth**: an in-memory `tasks` array in `script.js`. Every add/toggle/delete mutates that array, saves it to `localStorage`, then fully re-renders the list — a full re-render on every change is the simplest mental model and is more than fast enough at this scale.
- **Both title and course are required**, trimmed before validation, so whitespace-only input is rejected.
- **XSS-safe rendering**: task text is inserted via DOM node creation and `textContent`, never `innerHTML`, so a title or course containing HTML/script-like text is always displayed as literal text rather than executed.
- **Graceful storage failure**: reading or writing `localStorage` is wrapped in `try/catch`. If storage is unavailable, full, or contains corrupted JSON, the app falls back to an empty list on load (rather than crashing) and shows a non-blocking banner on save failure so the user knows changes may not persist, while the app keeps working for the rest of the session.

## Known limitations

- No "edit task" feature — only add, toggle complete/incomplete, and delete.
- No multi-tab live sync: a second open tab won't reflect changes until it is reloaded.
- Task IDs are generated with `crypto.randomUUID()` (with a `Date.now()`/`Math.random()` fallback for older browsers); collisions are not expected but are not formally guaranteed impossible.
- No automated test suite — this project is tested manually (see the testing checklist shared alongside this app).
