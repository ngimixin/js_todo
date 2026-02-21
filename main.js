/**
 * Vanilla JS ToDo List - Create（新規追加）
 *
 * 仕様:
 * - 入力フィールドに文字を入力して保存ボタンを押すとToDo一覧に表示される
 */

// データ: { id, text, completed }
let todos = [];

// DOM要素
const todoInput = document.getElementById("todo-input");
const saveBtn = document.getElementById("save-btn");
const todoList = document.getElementById("todo-list");

const STORAGE_KEY = "js_todo_todos";

// 初期化
function init() {
  loadFromStorage();
  render();
  bindEvents();
}

// localStorage から読み込み
function loadFromStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      todos = parsed.map((t) => ({
        id: t.id,
        text: t.text,
        completed: Boolean(t.completed),
      }));
    }
  } catch (e) {
    console.error("Failed to load todos:", e);
  }
}

// localStorage に保存
function saveToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

// 一覧を描画
function render() {
  todoList.innerHTML = "";

  todos.forEach((todo) => {
    const li = document.createElement("li");
    li.className = "todo-item" + (todo.completed ? " completed" : "");
    li.dataset.id = todo.id;
    li.innerHTML = `
      <input type="checkbox" ${todo.completed ? "checked" : ""} disabled>
      <span class="todo-text">${escapeHtml(todo.text)}</span>
    `;
    todoList.appendChild(li);
  });
}

// HTMLエスケープ
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// Create: 新規追加
function addTodo(text) {
  const trimmed = text.trim();
  if (!trimmed) return;

  const id = Date.now().toString();
  todos.push({
    id,
    text: trimmed,
    completed: false,
  });

  saveToStorage();
  render();
  todoInput.value = "";
  todoInput.focus();
}

function bindEvents() {
  // 保存ボタンをクリック
  saveBtn.addEventListener("click", () => {
    addTodo(todoInput.value);
  });

  // Enter キーで保存（IME変換中は無視）
  todoInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.isComposing) {
      e.preventDefault();
      addTodo(todoInput.value);
    }
  });
}

init();
