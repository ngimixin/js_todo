/**
 * Vanilla JS ToDo List - Create & Read & Update
 *
 * 仕様:
 * [Create]
 * - 入力フィールドに文字を入力して保存ボタンを押すとToDo一覧に表示される
 *
 * [Read]
 * - 掃除（編集）(削除)のように表示される
 * - チェックボックスでタスクの完了と未完了がわかる
 * - 全てのタスク：3 完了済み：2 未完了：1 のようにタスクの数を表示
 * - チェック・削除・新規作成でタスクの数はリアルタイムで変わる（※削除の動作は Step 4 で実装）
 *
 * [Update]
 * - 編集ボタンを押すと文字がフォームに変わってその場で編集できる
 * - [掃除](保存)と表示され保存すると文字に戻る
 * - チェックボックスでタスクの完了/未完了を切り替え
 */

// データ: { id, text, completed, editing }
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
        editing: false,
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

// 一覧を描画
function render() {
  todoList.innerHTML = "";

  todos.forEach((todo) => {
    const li = document.createElement("li");
    li.className = "todo-item" + (todo.completed ? " completed" : "");
    li.dataset.id = todo.id;

    if (todo.editing) {
      li.classList.add("editing");
      li.innerHTML = `
        <input type="checkbox" ${todo.completed ? "checked" : ""} data-action="toggle">
        <form class="edit-form">
          <input type="text" value="${escapeHtml(todo.text)}" class="edit-input">
          <button type="submit" class="save-edit-btn">保存</button>
        </form>
      `;
    } else {
      li.innerHTML = `
        <input type="checkbox" ${todo.completed ? "checked" : ""} data-action="toggle">
        <span class="todo-text">${escapeHtml(todo.text)}</span>
        <div class="todo-actions">
          <button type="button" class="edit-btn" data-action="edit">編集</button>
          <button type="button" class="delete-btn" data-action="delete">削除</button>
        </div>
      `;
    }

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
    editing: false,
  });

  saveToStorage();
  render();
  todoInput.value = "";
  todoInput.focus();
}

// Update: 完了/未完了切り替え
function toggleTodo(id) {
  const todo = todos.find((t) => t.id === id);
  if (todo) {
    todo.completed = !todo.completed;
    saveToStorage();
    render();
  }
}

// Update: 編集モード開始
function startEdit(id) {
  todos.forEach((t) => {
    t.editing = t.id === id;
  });
  saveToStorage();
  render();

  const li = todoList.querySelector(`[data-id="${id}"]`);
  if (li) {
    const input = li.querySelector(".edit-input");
    if (input) {
      input.focus();
      input.select();
    }
  }
}

// Update: 編集保存
function saveEdit(id, newText) {
  const trimmed = newText.trim();
  const todo = todos.find((t) => t.id === id);
  if (todo) {
    todo.text = trimmed || todo.text;
    todo.editing = false;
    saveToStorage();
    render();
  }
}

// イベント委譲で一覧のクリックを処理
function handleTodoListClick(e) {
  const target = e.target.closest("[data-action]");
  if (!target) return;

  const li = target.closest(".todo-item");
  if (!li) return;

  const id = li.dataset.id;
  const action = target.dataset.action;

  switch (action) {
    case "toggle":
      toggleTodo(id);
      break;
    case "edit":
      startEdit(id);
      break;
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

  // 編集フォームの送信（保存ボタンクリック or Enter キー）
  todoList.addEventListener("submit", (e) => {
    const form = e.target.closest("form.edit-form");
    if (!form) return;
    e.preventDefault();
    const li = form.closest(".todo-item");
    const id = li?.dataset.id;
    const input = form.querySelector(".edit-input");
    if (id && input) saveEdit(id, input.value);
  });
}

init();
