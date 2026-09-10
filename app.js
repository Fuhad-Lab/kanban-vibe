// Kanban Board App

// DOM elements
let appDiv;
let themeToggleBtn;

// State
let currentUser = null;
let board = {
  todo: [],
  doing: [],
  done: []
};

// Constants
const STORAGE_KEY_PREFIX = 'kanban_';
const USERS_KEY = 'kanban_users';

// Initialize the app
function init() {
  appDiv = document.getElementById('app');
  themeToggleBtn = document.getElementById('theme-toggle');
  
  // Load theme preference
  loadTheme();
  
  // Check if user is logged in
  const loggedInUser = localStorage.getItem('kanban_currentUser');
  if (loggedInUser) {
    currentUser = loggedInUser;
    loadBoard();
    renderBoard();
  } else {
    renderAuth();
  }
  
  // Event listeners
  themeToggleBtn.addEventListener('click', toggleTheme);
}

// Authentication functions
function register(username, password) {
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
  if (users[username]) {
    alert('User already exists');
    return false;
  }
  users[username] = { password };
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  return true;
}

function login(username, password) {
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
  if (users[username] && users[username].password === password) {
    currentUser = username;
    localStorage.setItem('kanban_currentUser', username);
    loadBoard();
    renderBoard();
    return true;
  }
  alert('Invalid credentials');
  return false;
}

function logout() {
  currentUser = null;
  localStorage.removeItem('kanban_currentUser');
  renderAuth();
}

// Board persistence
function saveBoard() {
  if (!currentUser) return;
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
  if (!users[currentUser]) {
    users[currentUser] = { boards: {} };
  }
  users[currentUser].board = board;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function loadBoard() {
  if (!currentUser) return;
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
  if (users[currentUser] && users[currentUser].board) {
    board = users[currentUser].board;
  } else {
    // Initialize empty board
    board = { todo: [], doing: [], done: [] };
  }
}

// Render functions
function renderAuth() {
  appDiv.innerHTML = `
    <div class="auth-container">
      <h1>Kanban Board</h1>
      <div class="auth-tabs">
        <button id="login-tab" class="active">Login</button>
        <button id="register-tab">Register</button>
      </div>
      <div id="auth-form">
        <form id="login-form">
          <input type="text" id="login-username" placeholder="Username" required>
          <input type="password" id="login-password" placeholder="Password" required>
          <button type="submit">Login</button>
        </form>
        <form id="register-form" style="display:none;">
          <input type="text" id="register-username" placeholder="Username" required>
          <input type="password" id="register-password" placeholder="Password" required>
          <button type="submit">Register</button>
        </form>
      </div>
    </div>
  `;
  
  // Tab switching
  document.getElementById('login-tab').addEventListener('click', () => {
    document.getElementById('login-tab').classList.add('active');
    document.getElementById('register-tab').classList.remove('active');
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('register-form').style.display = 'none';
  });
  
  document.getElementById('register-tab').addEventListener('click', () => {
    document.getElementById('register-tab').classList.add('active');
    document.getElementById('login-tab').classList.remove('active');
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
  });
  
  // Form submissions
  document.getElementById('login-form').addEventListener('submit', e => {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    login(username, password);
  });
  
  document.getElementById('register-form').addEventListener('submit', e => {
    e.preventDefault();
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;
    if (register(username, password)) {
      alert('Registration successful! Please login.');
      // Switch to login tab
      document.getElementById('login-tab').click();
    }
  });
}

function renderBoard() {
  appDiv.innerHTML = `
    <div class="board-header">
      <h1>Kanban Board</h1>
      <div class="user-actions">
        <span>Welcome, ${currentUser}!</span>
        <button id="logout-btn">Logout</button>
      </div>
    </div>
    <div class="columns">
      <div class="column" data-column="todo">
        <h2>To Do</h2>
        <div class="card-list" id="todo-list"></div>
        <button class="add-card-btn" data-column="todo">+ Add Card</button>
      </div>
      <div class="column" data-column="doing">
        <h2>Doing</h2>
        <div class="card-list" id="doing-list"></div>
        <button class="add-card-btn" data-column="doing">+ Add Card</button>
      </div>
      <div class="column" data-column="done">
        <h2>Done</h2>
        <div class="card-list" id="done-list"></div>
        <button class="add-card-btn" data-column="done">+ Add Card</button>
      </div>
    </div>
  `;
  
  // Add event listeners
  document.getElementById('logout-btn').addEventListener('click', logout);
  
  // Add card buttons
  document.querySelectorAll('.add-card-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const column = btn.getAttribute('data-column');
      addCard(column);
    });
  });
  
  // Render cards
  renderColumns();
  
  // Make cards draggable
  setupDragAndDrop();
}

function renderColumns() {
  const columns = ['todo', 'doing', 'done'];
  columns.forEach(col => {
    const cardList = document.getElementById(`${col}-list`);
    cardList.innerHTML = '';
    board[col].forEach((card, index) => {
      const cardEl = document.createElement('div');
      cardEl.className = 'card';
      cardEl.draggable = true;
      cardEl.dataset.column = col;
      cardEl.dataset.index = index;
      cardEl.textContent = card.text;
      
      // Drag events
      cardEl.addEventListener('dragstart', dragStart);
      cardEl.addEventListener('dragend', dragEnd);
      
      cardList.appendChild(cardEl);
    });
  });
}

function addCard(column) {
  const text = prompt('Enter card description:');
  if (text !== null && text.trim() !== '') {
    board[column].push({ text: text.trim() });
    saveBoard();
    renderColumns();
  }
}

// Drag and drop
let draggedCard = null;
let draggedColumn = null;
let draggedIndex = null;

function dragStart(e) {
  draggedCard = e.target;
  draggedColumn = draggedCard.dataset.column;
  draggedIndex = parseInt(draggedCard.dataset.index);
  // Add a little delay to ensure the element is still visible while dragging
  setTimeout(() => {
    e.target.classList.add('dragging');
  }, 0);
}

function dragEnd(e) {
  e.target.classList.remove('dragging');
  // The drop logic is handled in the drop event listeners on the columns
}

function setupDragAndDrop() {
  const columns = document.querySelectorAll('.column');
  columns.forEach(column => {
    const cardList = column.querySelector('.card-list');
    
    cardList.addEventListener('dragover', e => {
      e.preventDefault();
      cardList.classList.add('dragover');
    });
    
    cardList.addEventListener('dragleave', () => {
      cardList.classList.remove('dragover');
    });
    
    cardList.addEventListener('drop', e => {
      e.preventDefault();
      cardList.classList.remove('dragover');
      
      const targetColumn = column.dataset.column;
      if (draggedColumn === targetColumn) {
        // Reordering within same column
        const cardListItems = Array.from(cardList.querySelectorAll('.card'));
        const targetIndex = cardListItems.indexOf(draggedCard);
        if (targetIndex !== -1 && targetIndex !== draggedIndex) {
          // Move the card in the board array
          const [movedItem] = board[draggedColumn].splice(draggedIndex, 1);
          board[draggedColumn].splice(targetIndex, 0, movedItem);
          saveBoard();
          renderColumns();
        }
      } else {
        // Moving to different column
        // Remove from source column
        const [movedItem] = board[draggedColumn].splice(draggedIndex, 1);
        // Add to target column at the end (or we could calculate position)
        board[targetColumn].push(movedItem);
        saveBoard();
        renderColumns();
      }
      
      draggedCard = null;
      draggedColumn = null;
      draggedIndex = null;
    });
  });
}

// Theme functions
function loadTheme() {
  const darkMode = localStorage.getItem('kanban_darkMode') === 'true';
  if (darkMode) {
    document.documentElement.classList.add('dark');
    themeToggleBtn.textContent = 'Toggle Light Mode';
  } else {
    document.documentElement.classList.remove('dark');
    themeToggleBtn.textContent = 'Toggle Dark Mode';
  }
}

function toggleTheme() {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('kanban_darkMode', isDark);
  themeToggleBtn.textContent = isDark ? 'Toggle Light Mode' : 'Toggle Dark Mode';
}

// Start the app
document.addEventListener('DOMContentLoaded', init);