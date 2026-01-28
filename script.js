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
let todos = JSON.parse(localStorage.getItem('todos')) || [];
let currentFilter = 'all';
let isDarkTheme = localStorage.getItem('isDarkTheme') === 'true';

// Initialize
function init() {
    // Set theme
    if (isDarkTheme) {
        document.body.classList.add('dark-theme');
        themeToggle.querySelector('img').src = './images/icon-sun.svg';
    }
    
    // Add sample todos if empty
    if (todos.length === 0) {
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
    
    renderTodos();
    updateItemsLeft();
}

// Theme Toggle
themeToggle.addEventListener('click', () => {
    isDarkTheme = !isDarkTheme;
    localStorage.setItem('isDarkTheme', isDarkTheme);
    
    const themeIcon = themeToggle.querySelector('img');
    
    if (isDarkTheme) {
        document.body.classList.add('dark-theme');
        themeIcon.src = './images/icon-sun.svg';
        themeIcon.alt = 'Switch to light theme';
    } else {
        document.body.classList.remove('dark-theme');
        themeIcon.src = './images/icon-moon.svg';
        themeIcon.alt = 'Switch to dark theme';
    }
});

// Todo Functions
function addTodo() {
    const text = todoInput.value.trim();
    if (!text) return;
    
    const newTodo = {
        id: Date.now(),
        text: text,
        completed: false
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
        const todoElement = document.createElement('div');
        todoElement.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        todoElement.setAttribute('data-id', todo.id);
        todoElement.setAttribute('draggable', 'true');
        
        todoElement.innerHTML = `
            <div class="check-circle">
                <div class="circle ${todo.completed ? 'completed' : ''}"></div>
            </div>
            <div class="todo-text">${todo.text}</div>
            <button class="delete-btn">
                <img src="./images/icon-cross.svg" alt="Delete todo">
            </button>
        `;
        
        // Add event listeners
        const circle = todoElement.querySelector('.circle');
        const deleteBtn = todoElement.querySelector('.delete-btn');
        const todoText = todoElement.querySelector('.todo-text');
        
        circle.addEventListener('click', () => toggleTodo(todo.id));
        deleteBtn.addEventListener('click', () => deleteTodo(todo.id));
        todoText.addEventListener('click', () => toggleTodo(todo.id));
        
        // Drag and drop
        todoElement.addEventListener('dragstart', handleDragStart);
        todoElement.addEventListener('dragover', handleDragOver);
        todoElement.addEventListener('drop', handleDrop);
        todoElement.addEventListener('dragend', handleDragEnd);
        
        todoList.appendChild(todoElement);
    });
}

// Drag and Drop
let draggedItem = null;

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

// Event Listeners
todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTodo();
    }
});

addTodoCircle.addEventListener('click', addTodo);

clearCompletedBtn.addEventListener('click', clearCompleted);

document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        filterTodos(e.target.dataset.filter);
    });
});

// Initialize the app
init();