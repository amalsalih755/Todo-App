// DOM Elements
const themeToggle = document.getElementById('themeToggle');
const todoInput = document.getElementById('todoInput');
const addTodoCircle = document.getElementById('addTodoCircle');
const todoList = document.getElementById('todoList');
const itemsLeft = document.getElementById('itemsLeft');
const filterButtons = document.querySelectorAll('.filter-btn');
const clearCompletedBtn = document.getElementById('clearCompleted');
const filtersMobile = document.getElementById('filtersMobile');
const todoFooter = document.getElementById('todoFooter');

// State
let todos = [];
let currentFilter = 'all';
let isDarkTheme = false;

// Initialize
function init() {
    // Load todos from localStorage
    const savedTodos = localStorage.getItem('todos');
    todos = savedTodos ? JSON.parse(savedTodos) : [];
    
    // Load theme preference
    const savedTheme = localStorage.getItem('isDarkTheme');
    isDarkTheme = savedTheme === 'true';
    
    // Set initial theme
    setTheme(isDarkTheme);
    
    // Add sample todos if empty
    if (todos.length === 0) {
        addSampleTodos();
    }
    
    // Render initial todos
    renderTodos();
    updateItemsLeft();
}

// Theme Functions
function setTheme(isDark) {
    if (isDark) {
        document.body.classList.add('dark-theme');
        themeToggle.innerHTML = '<img src="data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'26\' height=\'26\'%3E%3Cpath fill=\'%23FFF\' d=\'M13 21a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zm-5.657-2.343a1 1 0 010 1.414l-2.121 2.121a1 1 0 01-1.414-1.414l2.12-2.121a1 1 0 011.415 0zm12.728 0l2.121 2.121a1 1 0 01-1.414 1.414l-2.121-2.12a1 1 0 011.414-1.415zM13 8a5 5 0 110 10 5 5 0 010-10zm12 4a1 1 0 110 2h-3a1 1 0 110-2h3zM4 12a1 1 0 110 2H1a1 1 0 110-2h3zm18.192-8.192a1 1 0 010 1.414l-2.12 2.121a1 1 0 01-1.415-1.414l2.121-2.121a1 1 0 011.414 0zm-16.97 0l2.121 2.121a1 1 0 01-1.414 1.414L2.808 5.222a1 1 0 011.414-1.414zM13 0a1 1 0 011 1v3a1 1 0 11-2 0V1a1 1 0 011-1z\'/%3E%3C/svg%3E" alt="Sun icon" class="theme-icon">';
    } else {
        document.body.classList.remove('dark-theme');
        themeToggle.innerHTML = '<img src="data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'26\' height=\'26\'%3E%3Cpath fill=\'%23FFF\' d=\'M13 0c.81 0 1.603.074 2.373.216C10.593 1.199 7 5.43 7 10.5 7 16.299 11.701 21 17.5 21c2.996 0 5.7-1.255 7.613-3.268C23.22 22.572 18.51 26 13 26 5.82 26 0 20.18 0 13S5.82 0 13 0z\'/%3E%3C/svg%3E" alt="Moon icon" class="theme-icon">';
    }
}

// Todo Functions
function addTodo() {
    const text = todoInput.value.trim();
    if (!text) return;
    
    const newTodo = {
        id: Date.now(),
        text: text,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    todos.push(newTodo);
    saveTodos();
    renderTodos();
    updateItemsLeft();
    
    todoInput.value = '';
    todoInput.focus();
}

function toggleTodo(id) {
    todos = todos.map(todo => 
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    saveTodos();
    renderTodos();
    updateItemsLeft();
}

function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    saveTodos();
    renderTodos();
    updateItemsLeft();
}

function clearCompleted() {
    todos = todos.filter(todo => !todo.completed);
    saveTodos();
    renderTodos();
    updateItemsLeft();
}

// Filter Functions
function filterTodos(filter) {
    currentFilter = filter;
    
    // Update active filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        if (btn.dataset.filter === filter) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    renderTodos();
}

// Render Functions
function renderTodos() {
    // Filter todos
    let filteredTodos;
    switch (currentFilter) {
        case 'active':
            filteredTodos = todos.filter(todo => !todo.completed);
            break;
        case 'completed':
            filteredTodos = todos.filter(todo => todo.completed);
            break;
        default:
            filteredTodos = todos;
    }
    
    // Clear list
    todoList.innerHTML = '';
    
    // Show empty state
    if (filteredTodos.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        
        let message;
        switch (currentFilter) {
            case 'active':
                message = 'No active todos';
                break;
            case 'completed':
                message = 'No completed todos';
                break;
            default:
                message = 'No todos yet';
        }
        
        emptyState.textContent = message;
        todoList.appendChild(emptyState);
        todoFooter.style.display = 'none';
        return;
    }
    
    // Show footer
    todoFooter.style.display = 'flex';
    
    // Create todo items
    filteredTodos.forEach(todo => {
        const todoElement = createTodoElement(todo);
        todoList.appendChild(todoElement);
    });
    
    // Initialize drag and drop
    initDragAndDrop();
}

function createTodoElement(todo) {
    const todoElement = document.createElement('div');
    todoElement.className = `todo-item ${todo.completed ? 'completed' : ''}`;
    todoElement.setAttribute('data-id', todo.id);
    todoElement.setAttribute('draggable', 'true');
    
    todoElement.innerHTML = `
        <div class="check-circle">
            <div class="circle ${todo.completed ? 'completed' : ''}"></div>
        </div>
        <div class="todo-text">${todo.text}</div>
        <button class="delete-btn" aria-label="Delete todo">✕</button>
    `;
    
    // Add event listeners
    const circle = todoElement.querySelector('.circle');
    const deleteBtn = todoElement.querySelector('.delete-btn');
    const todoText = todoElement.querySelector('.todo-text');
    
    circle.addEventListener('click', () => toggleTodo(todo.id));
    deleteBtn.addEventListener('click', () => deleteTodo(todo.id));
    todoText.addEventListener('click', () => toggleTodo(todo.id));
    
    return todoElement;
}

// Drag and Drop
let draggedItem = null;

function initDragAndDrop() {
    const todoItems = document.querySelectorAll('.todo-item');
    
    todoItems.forEach(item => {
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragover', handleDragOver);
        item.addEventListener('drop', handleDrop);
        item.addEventListener('dragend', handleDragEnd);
    });
}

function handleDragStart(e) {
    draggedItem = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', this.dataset.id);
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    
    if (draggedItem !== this) {
        const draggedId = parseInt(draggedItem.dataset.id);
        const droppedId = parseInt(this.dataset.id);
        
        const draggedIndex = todos.findIndex(todo => todo.id === draggedId);
        const droppedIndex = todos.findIndex(todo => todo.id === droppedId);
        
        if (draggedIndex > -1 && droppedIndex > -1) {
            const [movedTodo] = todos.splice(draggedIndex, 1);
            todos.splice(droppedIndex, 0, movedTodo);
            saveTodos();
            renderTodos();
        }
    }
}

function handleDragEnd() {
    this.classList.remove('dragging');
    draggedItem = null;
}

// Helper Functions
function updateItemsLeft() {
    const activeCount = todos.filter(todo => !todo.completed).length;
    itemsLeft.textContent = `${activeCount} item${activeCount !== 1 ? 's' : ''} left`;
}

function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

function addSampleTodos() {
    todos = [
        { id: 1, text: 'Complete online JavaScript course', completed: true },
        { id: 2, text: 'Jog around the park 3x', completed: false },
        { id: 3, text: '10 minutes meditation', completed: false },
        { id: 4, text: 'Read for 1 hour', completed: false },
        { id: 5, text: 'Pick up groceries', completed: false },
        { id: 6, text: 'Complete Todo App on Frontend Mentor', completed: false }
    ];
    saveTodos();
}

// Event Listeners
themeToggle.addEventListener('click', () => {
    isDarkTheme = !isDarkTheme;
    localStorage.setItem('isDarkTheme', isDarkTheme);
    setTheme(isDarkTheme);
});

todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTodo();
    }
});

addTodoCircle.addEventListener('click', addTodo);

clearCompletedBtn.addEventListener('click', clearCompleted);

// Filter event listeners
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        filterTodos(e.target.dataset.filter);
    });
});

// Initialize the app
init();