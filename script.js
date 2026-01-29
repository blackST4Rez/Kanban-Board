// Landing Page Animation
document.addEventListener('DOMContentLoaded', function() {
    const startBtn = document.getElementById('startBtn');
    const landingScreen = document.querySelector('.landing-screen');
    const mainContent = document.querySelector('.main-content');
    
    // Start button click
    startBtn.addEventListener('click', function() {
        // Hide landing screen with animation
        landingScreen.classList.add('hidden');
        
        // Show main content after a delay
        setTimeout(() => {
            mainContent.classList.remove('hidden');
            landingScreen.style.display = 'none';
        }, 1000);
    });
    
    // Also allow skipping landing by pressing space or enter
    document.addEventListener('keydown', function(e) {
        if (e.code === 'Space' || e.code === 'Enter') {
            if (!landingScreen.classList.contains('hidden')) {
                startBtn.click();
            }
        }
    });
    
    // Scroll hint click
    document.querySelector('.scroll-hint').addEventListener('click', function() {
        startBtn.click();
    });
});

// Task Modal
const addTaskBtn = document.getElementById('addTaskBtn');
const taskModal = document.getElementById('taskModal');
const cancelBtn = document.getElementById('cancelBtn');
const taskForm = document.getElementById('taskForm');
let selectedTags = [];

// Add Task Button Click
addTaskBtn.addEventListener('click', function() {
    taskModal.classList.remove('hidden');
    selectedTags = [];
    updateTagSelection();
});

// Cancel Button Click
cancelBtn.addEventListener('click', function() {
    taskModal.classList.add('hidden');
    taskForm.reset();
});

// Close modal when clicking outside
taskModal.addEventListener('click', function(e) {
    if (e.target === taskModal) {
        taskModal.classList.add('hidden');
        taskForm.reset();
    }
});

// Tag selection
document.querySelectorAll('.tag-option').forEach(tag => {
    tag.addEventListener('click', function() {
        const tagValue = this.dataset.tag;
        const index = selectedTags.indexOf(tagValue);
        
        if (index > -1) {
            selectedTags.splice(index, 1);
            this.classList.remove('selected');
        } else {
            selectedTags.push(tagValue);
            this.classList.add('selected');
        }
    });
});

function updateTagSelection() {
    document.querySelectorAll('.tag-option').forEach(tag => {
        if (selectedTags.includes(tag.dataset.tag)) {
            tag.classList.add('selected');
        } else {
            tag.classList.remove('selected');
        }
    });
}

// Form submission
taskForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const title = document.getElementById('taskTitle').value;
    const description = document.getElementById('taskDescription').value;
    const list = document.getElementById('taskList').value;
    
    if (title.trim()) {
        addNewCard(list, title, description, selectedTags);
        taskModal.classList.add('hidden');
        taskForm.reset();
        selectedTags = [];
        updateTagSelection();
    }
});

// ========== DRAG & DROP LOGIC ==========
// Keep track of the card being dragged
let draggedCard = null;

// Initialize drag and drop
function initializeDragDrop() {
    const cards = document.querySelectorAll('.card');
    const lists = document.querySelectorAll('.list');

    // Add event listeners to all cards
    cards.forEach(card => {
        card.addEventListener('dragstart', function(e) {
            // Store reference to the card being dragged
            draggedCard = this;
            
            // Use a class for better visual control
            this.classList.add('dragging');
            
            // Set drag data
            e.dataTransfer.setData('text/plain', this.dataset.card);
        });
        
        card.addEventListener('dragend', function() {
            // Remove dragging class
            this.classList.remove('dragging');
            draggedCard = null;
            
            // Remove hover styles from all lists
            lists.forEach(list => {
                list.classList.remove('drag-over');
            });
        });
    });

    // Add event listeners to all lists
    lists.forEach(list => {
        list.addEventListener('dragover', function(e) {
            // Allow drop by preventing default
            e.preventDefault();
        });
        
        list.addEventListener('dragenter', function(e) {
            // Prevent default to allow drop
            e.preventDefault();
            
            // Don't highlight if it's the same list
            if (draggedCard && draggedCard.parentElement !== this) {
                this.classList.add('drag-over');
            }
        });
        
        list.addEventListener('dragleave', function(e) {
            // Remove class
            this.classList.remove('drag-over');
        });
        
        list.addEventListener('drop', function(e) {
            // Prevent default to allow drop
            e.preventDefault();
            
            // Remove visual feedback
            this.classList.remove('drag-over');
            
            // If we have a card being dragged and it's not already in this list
            if (draggedCard && draggedCard.parentElement !== this) {
                // Move the card to this list
                this.appendChild(draggedCard);
                
                // Update card style based on which list it's in
                updateCardStyle(draggedCard, this.getAttribute('data-list'));
                
                // Update task counts
                updateTaskCounts();
            }
        });
    });
}

// Function to update card style based on list status
function updateCardStyle(card, status) {
    // Remove all status classes
    card.classList.remove('status-todo', 'status-progress', 'status-done');
    
    // Add the new status class
    card.classList.add('status-' + status);
}

// Function to add a new card
function addNewCard(listId, title, description, tags = []) {
    const list = document.querySelector(`[data-list="${listId}"]`);
    if (!list) return;
    
    const cardId = Date.now(); // Simple unique ID
    const card = document.createElement('div');
    card.className = 'card';
    card.draggable = true;
    card.dataset.card = cardId;
    
    // Card content
    const cardContent = document.createElement('div');
    cardContent.className = 'card-content';
    
    const cardTitle = document.createElement('h3');
    cardTitle.textContent = title;
    
    const cardDesc = document.createElement('p');
    cardDesc.textContent = description || 'No description';
    
    cardContent.appendChild(cardTitle);
    cardContent.appendChild(cardDesc);
    
    // Card tags
    const cardTags = document.createElement('div');
    cardTags.className = 'card-tags';
    
    tags.forEach(tag => {
        const tagSpan = document.createElement('span');
        tagSpan.className = `tag ${tag}`;
        tagSpan.textContent = tag.charAt(0).toUpperCase() + tag.slice(1);
        cardTags.appendChild(tagSpan);
    });
    
    // Assemble card
    card.appendChild(cardContent);
    card.appendChild(cardTags);
    
    // Add to list
    list.appendChild(card);
    
    // Initialize drag events for the new card
    card.addEventListener('dragstart', function(e) {
        draggedCard = this;
        this.classList.add('dragging');
        e.dataTransfer.setData('text/plain', this.dataset.card);
    });
    
    card.addEventListener('dragend', function() {
        this.classList.remove('dragging');
        draggedCard = null;
        document.querySelectorAll('.list').forEach(list => {
            list.classList.remove('drag-over');
        });
    });
    
    // Update card style based on list
    updateCardStyle(card, listId);
    
    // Update task counts
    updateTaskCounts();
    
    return card;
}

// Function to update task counts
function updateTaskCounts() {
    document.querySelectorAll('.list').forEach(list => {
        const count = list.querySelectorAll('.card').length;
        const countElement = list.querySelector('.task-count');
        if (countElement) {
            countElement.textContent = count;
        }
    });
}

// Initialize drag and drop when main content is loaded
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        initializeDragDrop();
        updateTaskCounts();
    }, 100);
});