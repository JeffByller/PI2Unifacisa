document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const taskList = document.getElementById('task-list');
    const statsText = document.getElementById('stats-text');
    const priorityRadios = document.getElementsByName('priority');

    let tasks = [];

    const trashIcon = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
    `;
    const emptyIcon = `
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 5H7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2V7a2 2 0 0 0 -2 -2h-2"></path>
            <rect x="9" y="3" width="6" height="4" rx="2"></rect>
            <path d="M9 14l2 2l4 -4"></path>
        </svg>
    `;

    function getSelectedPriority() {
        for (const radio of priorityRadios) {
            if (radio.checked) return radio.value;
        }
        return '#3b82f6';
    }

    function saveToLocal() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function loadFromLocal() {
        const stored = localStorage.getItem('tasks');
        tasks = stored ? JSON.parse(stored) : [];
        renderTasks();
    }

    async function fetchTasks() {
        const isOffline = localStorage.getItem('offline_mode') === 'true';
        if (isOffline) {
            console.log('Modo offline ativo. Carregando do localStorage...');
            loadFromLocal();
            return;
        }

        try {
            const res = await fetch(`${window.API_URL}/tasks`);
            if (res.ok) {
                tasks = await res.json();
                saveToLocal();
                renderTasks();
            } else {
                throw new Error('Resposta do servidor não foi ok');
            }
        } catch (err) {
            console.warn('Erro de conexão, mudando para modo offline...', err);
            localStorage.setItem('offline_mode', 'true');
            loadFromLocal();
        }
    }

    async function addTask(title) {
        const newTask = {
            id: window.generateUUID(),
            title: title,
            completed: false,
            status: 'todo',
            priorityColor: getSelectedPriority(),
            createdAt: new Date().toISOString()
        };

        tasks.push(newTask);
        saveToLocal();
        renderTasks();

        const isOffline = localStorage.getItem('offline_mode') === 'true';
        if (!isOffline) {
            try {
                const res = await fetch(`${window.API_URL}/tasks`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newTask)
                });
                if (!res.ok) throw new Error('Falha ao salvar no back-end');
            } catch (err) {
                console.warn('Erro ao salvar no back-end, mudando para modo offline...', err);
                localStorage.setItem('offline_mode', 'true');
            }
        }
    }

    if (taskForm) {
        taskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const title = taskInput.value.trim();
            if (!title) return;
            addTask(title);
            taskInput.value = '';
        });
    }

    window.toggleComplete = async function(id) {
        const task = tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            task.status = task.completed ? 'done' : 'todo';
            
            saveToLocal();
            renderTasks();

            const isOffline = localStorage.getItem('offline_mode') === 'true';
            if (!isOffline) {
                try {
                    const res = await fetch(`${window.API_URL}/tasks/${id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(task)
                    });
                    if (!res.ok) throw new Error('Falha ao atualizar no back-end');
                } catch (err) {
                    console.warn('Erro ao atualizar no back-end, mudando para modo offline...', err);
                    localStorage.setItem('offline_mode', 'true');
                }
            }
        }
    };

    window.deleteTask = async function(id, btnElement) {
        const li = btnElement.closest('.task-item');
        if(li) li.classList.add('removing');

        setTimeout(async () => {
            tasks = tasks.filter(t => t.id !== id);
            saveToLocal();
            renderTasks();

            const isOffline = localStorage.getItem('offline_mode') === 'true';
            if (!isOffline) {
                try {
                    const res = await fetch(`${window.API_URL}/tasks/${id}`, { method: 'DELETE' });
                    if (!res.ok) throw new Error('Falha ao deletar no back-end');
                } catch (err) {
                    console.warn('Erro ao deletar no back-end, mudando para modo offline...', err);
                    localStorage.setItem('offline_mode', 'true');
                }
            }
        }, 300);
    };

    function updateStats() {
        if (!statsText) return;
        const pendingCount = tasks.filter(t => !t.completed).length;
        if (tasks.length === 0) statsText.textContent = "Nenhuma tarefa criada";
        else if (pendingCount === 0) statsText.textContent = "Todas as tarefas concluídas! 🎉";
        else statsText.textContent = `${pendingCount} tarefa${pendingCount !== 1 ? 's' : ''} pendente${pendingCount !== 1 ? 's' : ''}`;
    }

    function renderTasks() {
        if (!taskList) return;
        taskList.innerHTML = '';
        if (tasks.length === 0) {
            taskList.innerHTML = `
                <div class="empty-state">
                    ${emptyIcon}
                    <p>Sua lista está limpa.<br>Adicione uma nova tarefa acima.</p>
                </div>
            `;
            updateStats();
            return;
        }

        const sortedTasks = [...tasks].sort((a, b) => {
            if (a.completed === b.completed) return new Date(b.createdAt) - new Date(a.createdAt);
            return a.completed ? 1 : -1;
        });

        sortedTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;
            li.style.setProperty('--task-color', task.priorityColor);

            li.innerHTML = `
                <label class="checkbox-wrapper">
                    <input type="checkbox" class="task-checkbox" onchange="toggleComplete('${task.id}')" ${task.completed ? 'checked' : ''}>
                </label>
                <div class="task-content">
                    <span class="task-title">${window.escapeHTML(task.title)}</span>
                    <span class="task-date">${window.formatDate(task.createdAt)}</span>
                </div>
                <button class="delete-btn" aria-label="Excluir tarefa" onclick="deleteTask('${task.id}', this)">
                    ${trashIcon}
                </button>
            `;
            taskList.appendChild(li);
        });
        updateStats();
    }

    // Init fetch
    fetchTasks();
});
