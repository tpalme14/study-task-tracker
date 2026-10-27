// Study Task Tracker — vanilla JS, single state array + localStorage persistence.

const STORAGE_KEY = 'studyTaskTracker.tasks';

/** @type {{id: string, title: string, course: string, completed: boolean}[]} */
let tasks = [];

const taskListEl = document.getElementById('task-list');
const emptyStateEl = document.getElementById('empty-state');
const remainingCountEl = document.getElementById('remaining-count');
const completedCountEl = document.getElementById('completed-count');
const formEl = document.getElementById('add-task-form');
const titleInputEl = document.getElementById('title-input');
const courseInputEl = document.getElementById('course-input');
const formErrorEl = document.getElementById('form-error');
const storageWarningEl = document.getElementById('storage-warning');

function generateId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/** Reads tasks from localStorage. Falls back to an empty list if storage is
 * unavailable or contains invalid/corrupted JSON, so a bad stored value never
 * crashes the app on load. */
function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (t) => t && typeof t.id === 'string' && typeof t.title === 'string' && typeof t.course === 'string'
    );
  } catch (err) {
    console.warn('Could not load saved tasks, starting with an empty list.', err);
    return [];
  }
}

/** Persists tasks to localStorage. On failure (storage disabled, quota
 * exceeded, private-browsing restrictions, etc.) the app keeps working
 * in-memory for the session and shows a non-blocking warning instead of
 * throwing. */
function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    storageWarningEl.hidden = true;
  } catch (err) {
    console.warn('Could not save tasks to local storage.', err);
    storageWarningEl.hidden = false;
  }
}

function updateCounts() {
  const completed = tasks.filter((t) => t.completed).length;
  const remaining = tasks.length - completed;
  remainingCountEl.textContent = `${remaining} remaining`;
  completedCountEl.textContent = `${completed} completed`;
}

/** Builds one <li> for a task using DOM creation and textContent only, so
 * task titles/courses are always treated as plain text and never parsed as
 * HTML (prevents script/markup injection via user input). */
function createTaskElement(task) {
  const li = document.createElement('li');
  li.className = 'task-item' + (task.completed ? ' completed' : '');
  li.dataset.id = task.id;

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = task.completed;
  checkbox.setAttribute('aria-label', `Mark "${task.title}" as complete`);
  checkbox.dataset.action = 'toggle';

  const text = document.createElement('div');
  text.className = 'task-text';

  const title = document.createElement('span');
  title.className = 'task-title';
  title.textContent = task.title;

  const course = document.createElement('span');
  course.className = 'task-course';
  course.textContent = task.course;

  text.append(title, course);

  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'delete-btn';
  deleteBtn.textContent = 'Delete';
  deleteBtn.dataset.action = 'delete';

  li.append(checkbox, text, deleteBtn);
  return li;
}

/** Full re-render of the task list from the `tasks` array. Simplest mental
 * model for this scope: every mutation re-renders everything, so the DOM
 * can never drift out of sync with state. */
function renderTasks() {
  taskListEl.innerHTML = '';
  emptyStateEl.hidden = tasks.length > 0;
  for (const task of tasks) {
    taskListEl.appendChild(createTaskElement(task));
  }
  updateCounts();
}

function showFormError(message) {
  formErrorEl.textContent = message;
  formErrorEl.hidden = false;
}

function clearFormError() {
  formErrorEl.hidden = true;
  formErrorEl.textContent = '';
}

function addTask(rawTitle, rawCourse) {
  const title = rawTitle.trim();
  const course = rawCourse.trim();

  if (!title || !course) {
    showFormError('Please enter both a task title and a course name.');
    return;
  }

  clearFormError();
  tasks.push({ id: generateId(), title, course, completed: false });
  saveTasks();
  renderTasks();
}

function toggleTask(id) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;
  task.completed = !task.completed;
  saveTasks();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  saveTasks();
  renderTasks();
}

formEl.addEventListener('submit', (event) => {
  event.preventDefault();
  addTask(titleInputEl.value, courseInputEl.value);
  if (!formErrorEl.hidden) return;
  formEl.reset();
  titleInputEl.focus();
});

// Event delegation: one listener handles toggle/delete for every task,
// including tasks added after the page first loaded.
taskListEl.addEventListener('click', (event) => {
  const actionEl = event.target.closest('[data-action]');
  if (!actionEl) return;
  const id = actionEl.closest('.task-item')?.dataset.id;
  if (!id) return;

  if (actionEl.dataset.action === 'toggle') {
    toggleTask(id);
  } else if (actionEl.dataset.action === 'delete') {
    deleteTask(id);
  }
});

tasks = loadTasks();
renderTasks();
