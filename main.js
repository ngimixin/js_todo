/**
 * Vanilla JS ToDo List - Create（新規追加）& Read（一覧表示・統計）
 *
 * 仕様:
 * [Create]
 * - 入力フィールドに文字を入力して保存ボタンを押すとToDo一覧に表示される
 *
 * [Read]
 * - 掃除（編集）(削除)のように表示される
 * - チェックボックスでタスクの完了と未完了がわかる
 * - 全てのタスク：3 完了済み：2 未完了：1 のようにタスクの数を表示
 * - チェック・削除・新規作成でタスクの数はリアルタイムで変わる（※トグル・削除の動作は次ステップで実装）
 */

// データ: { id, text, completed }
let todos = [];

// DOM要素
const todoInput = document.getElementById("todo-input");
const saveBtn = document.getElementById("save-btn");
const todoList = document.getElementById("todo-list");
const totalCountEl = document.getElementById("total-count");
const completedCountEl = document.getElementById("completed-count");
const incompleteCountEl = document.getElementById("incomplete-count");

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

// 統計を更新
function updateStats() {
  const total = todos.length;
  const completed = todos.filter((t) => t.completed).length;
  const incomplete = total - completed;

  totalCountEl.textContent = total;
  completedCountEl.textContent = completed;
  incompleteCountEl.textContent = incomplete;
}

// 一覧を描画（Read用：編集・削除ボタン付き、チェックボックス表示）
function render() {
  todoList.innerHTML = "";

  todos.forEach((todo) => {
    const li = document.createElement("li");
    li.className = "todo-item" + (todo.completed ? " completed" : "");
    li.dataset.id = todo.id;
    li.innerHTML = `
      <input type="checkbox" ${todo.completed ? "checked" : ""} data-action="toggle">
      <span class="todo-text">${escapeHtml(todo.text)}</span>
      <div class="todo-actions">
        <button type="button" class="edit-btn" data-action="edit">編集</button>
        <button type="button" class="delete-btn" data-action="delete">削除</button>
      </div>
    `;
    todoList.appendChild(li);
  });

  updateStats();
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

// イベント委譲で一覧のクリックを処理（Read時点ではトグル・編集・削除は未実装）
function handleTodoListClick(e) {
  const target = e.target.closest("[data-action]");
  if (!target) return;

  const li = target.closest(".todo-item");
  if (!li) return;

  const action = target.dataset.action;

  // Step 3, 4 で実装予定（クリックは無効化してデータ不整合を防ぐ）
  if (action === "toggle" || action === "edit" || action === "delete") {
    // 現時点ではトグル・編集・削除は未実装なので、クリックは無効化してデータ不整合を防ぐ
    e.preventDefault();
    return;
  }
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

  // 一覧のクリック（イベント委譲）
  todoList.addEventListener("click", handleTodoListClick);
}

init();
